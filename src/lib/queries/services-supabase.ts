/**
 * Каталог специалистов и записи через Supabase с fallback на Prisma.
 */
import type { ServiceKind } from "@prisma/client";
import {
  type CatalogSpecialist,
  serviceKindToSpecialistKind,
  specialistKindToServiceKind,
} from "@/lib/services/catalog-types";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getServiceProviders, getServiceProviderById } from "@/lib/queries/services";

export type SpecialistFilters = {
  kind?: ServiceKind;
  city?: string;
  priceMin?: number;
  priceMax?: number;
};

type SpecialistRow = {
  id: string;
  user_id: string;
  kind: "vet" | "groomer";
  about: string | null;
  address: string;
  verification_status: string;
  rating: number;
  review_count: number;
  specialties: string[];
};

type ProfileRow = {
  user_id: string;
  full_name: string;
  city: string | null;
  avatar_url: string | null;
};

/**
 * Собирает CatalogSpecialist из строк Supabase и связанных данных.
 * @param sp Строка specialist_profiles
 * @param profile Профиль пользователя или undefined
 * @param services Список услуг специалиста
 * @returns Объект для UI каталога
 */
function mapToCatalog(
  sp: SpecialistRow,
  profile: ProfileRow | undefined,
  services: CatalogSpecialist["services"]
): CatalogSpecialist {
  const prices = services.map((s) => s.price);
  return {
    id: sp.id,
    userId: sp.user_id,
    name: profile?.full_name ?? "Специалист",
    kind: specialistKindToServiceKind(sp.kind),
    city: profile?.city ?? "",
    address: sp.address,
    rating: sp.rating,
    reviewCount: sp.review_count,
    priceFrom: prices.length > 0 ? Math.min(...prices) : 0,
    specialties: sp.specialties ?? [],
    verified: sp.verification_status === "approved",
    about: sp.about,
    media: profile?.avatar_url ? { url: profile.avatar_url } : null,
    services,
  };
}

/**
 * Загружает услуги для набора specialist_id и группирует по id.
 * @param ids Массив id специалистов
 * @returns Map specialist_id → services[]
 */
async function fetchServicesBySpecialistIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, CatalogSpecialist["services"]>();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("services")
    .select("id, specialist_id, name, duration_minutes, price, description")
    .in("specialist_id", ids);

  const map = new Map<string, CatalogSpecialist["services"]>();
  for (const row of data ?? []) {
    const list = map.get(row.specialist_id) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      durationMinutes: row.duration_minutes,
      price: row.price,
      description: row.description,
    });
    map.set(row.specialist_id, list);
  }
  return map;
}

/**
 * Загружает profiles по списку user_id.
 * @param userIds Идентификаторы пользователей
 * @returns Map user_id → ProfileRow
 */
async function fetchProfiles(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, ProfileRow>();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("user_id, full_name, city, avatar_url")
    .in("user_id", userIds);

  return new Map((data ?? []).map((p) => [p.user_id, p as ProfileRow]));
}

/**
 * Список одобренных специалистов с фильтрами (Supabase или Prisma fallback).
 * @param filters kind, city, priceMin, priceMax
 * @returns Массив CatalogSpecialist
 */
export async function getApprovedSpecialists(
  filters: SpecialistFilters = {}
): Promise<CatalogSpecialist[]> {
  // Fallback на Prisma, если Supabase не настроен
  if (!isSupabaseConfigured()) {
    const prismaRows = await getServiceProviders(filters.kind, filters.city);
    return prismaRows.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.name,
      kind: p.kind,
      city: p.city,
      address: p.address,
      rating: p.rating,
      reviewCount: p.reviewCount,
      priceFrom: p.priceFrom,
      specialties: p.specialties,
      verified: p.verified,
      about: null,
      media: p.media ? { url: p.media.url } : null,
      services: [],
    }));
  }

  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("specialist_profiles")
    .select("*")
    .eq("verification_status", "approved");

  const specialistKind = filters.kind
    ? serviceKindToSpecialistKind(filters.kind)
    : null;
  if (specialistKind) query = query.eq("kind", specialistKind);

  const { data, error } = await query.order("rating", { ascending: false });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as SpecialistRow[];
  const userIds = rows.map((r) => r.user_id);
  const [profilesMap, servicesMap] = await Promise.all([
    fetchProfiles(userIds),
    fetchServicesBySpecialistIds(rows.map((r) => r.id)),
  ]);

  let result = rows.map((sp) => {
    const profile = profilesMap.get(sp.user_id);
    const services = servicesMap.get(sp.id) ?? [];
    return mapToCatalog(sp, profile, services);
  });

  if (filters.city?.trim()) {
    const city = filters.city.trim().toLowerCase();
    result = result.filter((s) => s.city.toLowerCase().includes(city));
  }
  if (filters.priceMin != null) {
    result = result.filter((s) => s.priceFrom >= filters.priceMin!);
  }
  if (filters.priceMax != null) {
    result = result.filter((s) => s.priceFrom <= filters.priceMax!);
  }

  return result;
}

/**
 * Карточка специалиста по id (только approved в Supabase).
 * @param id id specialist_profiles или ServiceProvider
 * @returns CatalogSpecialist или null
 */
export async function getSpecialistById(
  id: string
): Promise<CatalogSpecialist | null> {
  if (!isSupabaseConfigured()) {
    const p = await getServiceProviderById(id);
    if (!p) return null;
    return {
      id: p.id,
      userId: p.userId,
      name: p.name,
      kind: p.kind,
      city: p.city,
      address: p.address,
      rating: p.rating,
      reviewCount: p.reviewCount,
      priceFrom: p.priceFrom,
      specialties: p.specialties,
      verified: p.verified,
      about: null,
      media: p.media ? { url: p.media.url } : null,
      services: [],
    };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("specialist_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const sp = data as SpecialistRow;
  // Не одобрен — не показываем в каталоге
  if (sp.verification_status !== "approved") return null;

  const profilesMap = await fetchProfiles([sp.user_id]);
  const servicesMap = await fetchServicesBySpecialistIds([sp.id]);
  return mapToCatalog(
    sp,
    profilesMap.get(sp.user_id),
    servicesMap.get(sp.id) ?? []
  );
}

/**
 * Профиль специалиста владельца (сырая строка Supabase).
 * @param userId user_id
 */
export async function getSpecialistForOwner(userId: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("specialist_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

/**
 * Услуги специалиста из таблицы services.
 * @param specialistId id specialist_profiles
 */
export async function getSpecialistServices(specialistId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("specialist_id", specialistId)
    .order("price", { ascending: true });
  return data ?? [];
}

/**
 * Записи клиента с именем специалиста.
 * @param clientId client_id в appointments
 */
export async function getClientAppointments(clientId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("appointments")
    .select("*, services(name, price, duration_minutes)")
    .eq("client_id", clientId)
    .order("appointment_time", { ascending: false });

  if (!data?.length) return [];

  const specialistIds = [...new Set(data.map((a) => a.specialist_id))];
  const { data: specialists } = await supabase
    .from("specialist_profiles")
    .select("id, kind, address, user_id")
    .in("id", specialistIds);

  const userIds = specialists?.map((s) => s.user_id) ?? [];
  const profilesMap = await fetchProfiles(userIds);
  const specMap = new Map(specialists?.map((s) => [s.id, s]));

  return data.map((a) => {
    const spec = specMap.get(a.specialist_id);
    const profile = spec ? profilesMap.get(spec.user_id) : undefined;
    return { ...a, specialistName: profile?.full_name ?? "Специалист", specialistKind: spec?.kind };
  });
}

/**
 * Записи у специалиста с именами клиентов.
 * @param specialistId id specialist_profiles
 */
export async function getSpecialistAppointments(specialistId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("appointments")
    .select("*, services(name, price, duration_minutes)")
    .eq("specialist_id", specialistId)
    .order("appointment_time", { ascending: false });

  if (!data?.length) return [];

  const clientIds = [...new Set(data.map((a) => a.client_id))];
  const profilesMap = await fetchProfiles(clientIds);

  return data.map((a) => ({
    ...a,
    clientName: profilesMap.get(a.client_id)?.full_name ?? "Клиент",
  }));
}

/**
 * Правила доступности для генерации слотов.
 * @param specialistId id specialist_profiles
 */
export async function getAvailabilityRules(specialistId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("specialist_id", specialistId);
  return data ?? [];
}

/**
 * Занятые слоты за день (кроме cancelled).
 * @param specialistId id специалиста
 * @param dayStart Начало интервала ISO
 * @param dayEnd Конец интервала ISO
 */
export async function getBookedSlots(
  specialistId: string,
  dayStart: string,
  dayEnd: string
) {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("specialist_id", specialistId)
    .gte("appointment_time", dayStart)
    .lte("appointment_time", dayEnd)
    .neq("status", "cancelled");
  return data ?? [];
}

/**
 * Список специалистов для админ-модерации.
 * @param status Опциональный verification_status
 */
export async function getAdminSpecialists(status?: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("specialist_profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("verification_status", status);
  const { data } = await query;

  if (!data?.length) return [];
  const profilesMap = await fetchProfiles(data.map((s) => s.user_id));
  return data.map((s) => ({
    ...s,
    profile: profilesMap.get(s.user_id),
  }));
}
