/** Server Actions для услуг и записей (Supabase) */
"use server";

import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { generateDaySlots } from "@/lib/services/slots";
import {
  getAvailabilityRules,
  getBookedSlots,
  getSpecialistForOwner,
} from "@/lib/queries/services-supabase";
import { requireAdminUser, requireAuthUser } from "@/lib/supabase/guard";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { AppointmentStatus, SpecialistKind, VerificationStatus } from "@/lib/supabase/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

function fail(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

/**
 * Создаёт запись к одобренному специалисту на свободный слот.
 * @param specialistId — id specialist_profiles
 * @param serviceId — id услуги
 * @param appointmentTimeIso — время ISO
 * @param note — комментарий
 * @param petId — опциональный питомец
 * @returns ActionResult
 */
export async function createAppointment(
  specialistId: string,
  serviceId: string,
  appointmentTimeIso: string,
  note?: string,
  petId?: string
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return fail("Supabase не настроен");
  }

  try {
    const user = await requireAuthUser();
    const supabase = createSupabaseServerClient();

    const { data: specialistRow } = await supabase
      .from("specialist_profiles")
      .select("id, user_id, verification_status")
      .eq("id", specialistId)
      .eq("verification_status", "approved")
      .maybeSingle();

    const specialist = specialistRow as {
      id: string;
      user_id: string;
      verification_status: string;
    } | null;

    // Только verification_status approved
    if (!specialist) return fail("Специалист недоступен");

    const { data: serviceRow } = await supabase
      .from("services")
      .select("id, duration_minutes, name")
      .eq("id", serviceId)
      .eq("specialist_id", specialistId)
      .maybeSingle();

    const service = serviceRow as {
      id: string;
      duration_minutes: number;
      name: string;
    } | null;

    if (!service) return fail("Услуга не найдена");

    const appointmentTime = new Date(appointmentTimeIso);
    // Валидация ISO-даты
    if (isNaN(appointmentTime.getTime())) {
      return fail("Некорректное время");
    }

    const dayStart = new Date(appointmentTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentTime);
    dayEnd.setHours(23, 59, 59, 999);

    const rules = await getAvailabilityRules(specialistId);
    const booked = await getBookedSlots(
      specialistId,
      dayStart.toISOString(),
      dayEnd.toISOString()
    );

    const slots = generateDaySlots(
      appointmentTime,
      rules,
      service.duration_minutes,
      booked.map((b) => (b as { appointment_time: string }).appointment_time)
    );

    // Слот должен быть в сгенерированном списке
    if (!slots.some((s) => s.iso === appointmentTime.toISOString())) {
      return fail("Выбранное время занято или недоступно");
    }

    await supabase.from("profiles").upsert({
      user_id: user.id,
      role: user.role === "ADMIN" ? "admin" : user.role === "SPECIALIST" ? "specialist" : "client",
      full_name: user.displayName ?? user.name ?? "Клиент",
      avatar_url: user.avatar ?? null,
      city: user.city ?? null,
    });

    const { error } = await supabase.from("appointments").insert({
      client_id: user.id,
      specialist_id: specialistId,
      service_id: serviceId,
      appointment_time: appointmentTime.toISOString(),
      status: "pending",
      note: note?.trim() || null,
      pet_id: petId || null,
    });

    if (error) return fail(error.message);

    await createNotification({
      userId: specialist.user_id,
      type: "BOOKING_UPDATE",
      title: "Новая запись",
      body: `${user.displayName ?? "Клиент"} — ${service.name}`,
      link: "/dashboard/specialist",
    });

    revalidatePath("/services");
    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/specialist");
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка записи");
  }
}

/**
 * Меняет статус записи; клиент может только cancelled.
 * @param appointmentId — id appointments
 * @param status — AppointmentStatus
 * @returns ActionResult
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Supabase не настроен");

  try {
    const user = await requireAuthUser();
    const supabase = createSupabaseServerClient();

    const { data: appointment } = await supabase
      .from("appointments")
      .select("*, specialist_profiles(user_id)")
      .eq("id", appointmentId)
      .maybeSingle();

    if (!appointment) return fail("Запись не найдена");

    const specialistUserId = (
      appointment.specialist_profiles as { user_id: string }
    )?.user_id;
    const isProvider = specialistUserId === user.id;
    const isCustomer = appointment.client_id === user.id;

    if (!isProvider && !isCustomer && user.role !== "ADMIN") {
      return fail("Недостаточно прав");
    }

    // Клиент: только cancelled
    if (isCustomer && status !== "cancelled") {
      return fail("Клиент может только отменить запись");
    }

    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId);

    if (error) return fail(error.message);

    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/specialist");
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка");
  }
}

/**
 * Обновляет профиль специалиста и связанный profiles в Supabase.
 * @param formData — city, address, about, phone, fullName
 * @returns ActionResult
 */
export async function updateSpecialistProfile(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Supabase не настроен");

  try {
    const user = await requireAuthUser();
    const supabase = createSupabaseServerClient();
    const profile = await getSpecialistForOwner(user.id);
    if (!profile) return fail("Профиль специалиста не найден");

    const city = (formData.get("city") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const about = (formData.get("about") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    if (!address) return fail("Укажите адрес");

    await supabase.from("profiles").update({
      city: city || null,
      phone: phone || null,
      full_name: (formData.get("fullName") as string)?.trim() || undefined,
    }).eq("user_id", user.id);

    const { error } = await supabase
      .from("specialist_profiles")
      .update({
        address,
        about: about || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) return fail(error.message);
    revalidatePath("/dashboard/specialist");
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка");
  }
}

/**
 * Создаёт или обновляет услугу специалиста в Supabase.
 * @param formData — id (опц.), name, price, durationMinutes, description
 * @returns ActionResult
 */
export async function upsertService(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Supabase не настроен");

  try {
    const user = await requireAuthUser();
    const profile = await getSpecialistForOwner(user.id);
    if (!profile) return fail("Профиль специалиста не найден");

    const id = (formData.get("id") as string) || undefined;
    const name = (formData.get("name") as string)?.trim();
    const price = Number(formData.get("price"));
    const duration = Number(formData.get("durationMinutes"));
    const description = (formData.get("description") as string)?.trim() || null;

    if (!name || !price || !duration) return fail("Заполните все поля");

    const supabase = createSupabaseServerClient();
    if (id) {
      const { error } = await supabase
        .from("services")
        .update({ name, price, duration_minutes: duration, description })
        .eq("id", id)
        .eq("specialist_id", profile.id);
      if (error) return fail(error.message);
    } else {
      const { error } = await supabase.from("services").insert({
        specialist_id: profile.id,
        name,
        price,
        duration_minutes: duration,
        description,
      });
      if (error) return fail(error.message);
    }

    revalidatePath("/dashboard/specialist");
    revalidatePath("/services");
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка");
  }
}

/**
 * Удаляет услугу специалиста.
 * @param serviceId — id services
 * @returns ActionResult
 */
export async function deleteService(serviceId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Supabase не настроен");

  try {
    const user = await requireAuthUser();
    const profile = await getSpecialistForOwner(user.id);
    if (!profile) return fail("Профиль специалиста не найден");

    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId)
      .eq("specialist_id", profile.id);

    if (error) return fail(error.message);
    revalidatePath("/dashboard/specialist");
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка");
  }
}

/**
 * Создаёт или обновляет правило доступности по дню недели.
 * @param formData — id, weekday, startTime, endTime, breakStart, breakEnd
 * @returns ActionResult
 */
export async function saveAvailabilityRule(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Supabase не настроен");

  try {
    const user = await requireAuthUser();
    const profile = await getSpecialistForOwner(user.id);
    if (!profile) return fail("Профиль специалиста не найден");

    const weekday = Number(formData.get("weekday"));
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const breakStart = (formData.get("breakStart") as string) || null;
    const breakEnd = (formData.get("breakEnd") as string) || null;
    const ruleId = (formData.get("id") as string) || undefined;

    const supabase = createSupabaseServerClient();
    const payload = {
      specialist_id: profile.id,
      weekday,
      start_time: startTime,
      end_time: endTime,
      break_start: breakStart,
      break_end: breakEnd,
    };

    if (ruleId) {
      const { error } = await supabase
        .from("availability_rules")
        .update(payload)
        .eq("id", ruleId);
      if (error) return fail(error.message);
    } else {
      const { error } = await supabase.from("availability_rules").insert(payload);
      if (error) return fail(error.message);
    }

    revalidatePath("/dashboard/specialist");
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка");
  }
}

/**
 * Удаляет правило расписания специалиста.
 * @param ruleId — id availability_rules
 * @returns ActionResult
 */
export async function deleteAvailabilityRule(ruleId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Supabase не настроен");

  try {
    const user = await requireAuthUser();
    const profile = await getSpecialistForOwner(user.id);
    if (!profile) return fail("Профиль специалиста не найден");

    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("availability_rules")
      .delete()
      .eq("id", ruleId)
      .eq("specialist_id", profile.id);

    if (error) return fail(error.message);
    revalidatePath("/dashboard/specialist");
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка");
  }
}

/**
 * Меняет verification_status специалиста (только админ).
 * @param specialistId — id specialist_profiles
 * @param status — VerificationStatus
 * @returns ActionResult
 */
export async function setSpecialistVerification(
  specialistId: string,
  status: VerificationStatus
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Supabase не настроен");

  try {
    await requireAdminUser();
    const supabase = createSupabaseServerClient();

    const { data: specialist } = await supabase
      .from("specialist_profiles")
      .select("user_id")
      .eq("id", specialistId)
      .maybeSingle();

    const { error } = await supabase
      .from("specialist_profiles")
      .update({
        verification_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", specialistId);

    if (error) return fail(error.message);

    if (specialist?.user_id) {
      await createNotification({
        userId: specialist.user_id,
        type: "BOOKING_UPDATE",
        title:
          status === "approved"
            ? "Профиль одобрен"
            : "Профиль отклонён",
        body:
          status === "approved"
            ? "Вы появились в каталоге услуг"
            : "Проверьте данные и загрузите лицензию снова",
        link: "/dashboard/specialist",
      });
    }

    revalidatePath("/admin");
    revalidatePath("/services");
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка");
  }
}

/**
 * Загружает лицензию в storage и ставит verification pending.
 * @param formData — поле file
 * @returns ActionResult с url публичной ссылки
 */
export async function uploadLicense(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  if (!isSupabaseConfigured()) return fail("Supabase не настроен");

  try {
    const user = await requireAuthUser();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return fail("Выберите файл");
    }

    const profile = await getSpecialistForOwner(user.id);
    if (!profile) return fail("Профиль специалиста не найден");

    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${user.id}/license-${Date.now()}.${ext}`;
    const supabase = createSupabaseServerClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("licenses")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) return fail(uploadError.message);

    const { data: urlData } = supabase.storage.from("licenses").getPublicUrl(path);
    const licenseUrl = urlData.publicUrl;

    const { error } = await supabase
      .from("specialist_profiles")
      .update({
        license_url: licenseUrl,
        verification_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) return fail(error.message);
    revalidatePath("/dashboard/specialist");
    return { ok: true, url: licenseUrl };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка загрузки");
  }
}

/**
 * Возвращает свободные слоты на день для услуги специалиста.
 * @param specialistId — id specialist_profiles
 * @param serviceId — id services (длительность)
 * @param dateIso — дата ISO
 * @returns { ok, slots } или { ok: false, error }
 */
export async function getAvailableSlots(
  specialistId: string,
  serviceId: string,
  dateIso: string
): Promise<{ ok: true; slots: { iso: string; label: string }[] } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) return fail("Supabase не настроен");

  try {
    const supabase = createSupabaseServerClient();
    const { data: service } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .maybeSingle();

    if (!service) return fail("Услуга не найдена");

    const date = new Date(dateIso);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const rules = await getAvailabilityRules(specialistId);
    const booked = await getBookedSlots(
      specialistId,
      dayStart.toISOString(),
      dayEnd.toISOString()
    );

    const slots = generateDaySlots(
      date,
      rules,
      service.duration_minutes,
      booked.map((b) => b.appointment_time)
    );

    return { ok: true, slots };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка");
  }
}

/**
 * Создаёт profiles и specialist_profiles при регистрации SPECIALIST.
 * @param data — userId, fullName, city, kind, address, licenseUrl, specialties
 * @returns ActionResult (ok без Supabase — no-op)
 */
export async function registerSpecialistProfile(data: {
  userId: string;
  fullName: string;
  city: string;
  kind: SpecialistKind;
  address: string;
  licenseUrl: string;
  specialties?: string[];
}): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { ok: true };

  try {
    const supabase = createSupabaseServerClient();

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: data.userId,
        role: "specialist",
        full_name: data.fullName,
        city: data.city,
      },
      { onConflict: "user_id" }
    );

    if (profileError) return fail(profileError.message);

    const { error } = await supabase.from("specialist_profiles").insert({
      user_id: data.userId,
      kind: data.kind,
      address: data.address,
      license_url: data.licenseUrl || null,
      verification_status: "pending",
      specialties: data.specialties ?? [],
    });

    if (error) return fail(error.message);
    return { ok: true };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Ошибка");
  }
}
