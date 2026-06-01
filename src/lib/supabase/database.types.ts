/**
 * Сгенерированные типы схемы Supabase (public): профили, специалисты,
 * услуги, записи и правила доступности. Обновлять при изменении БД в Supabase.
 */
export type ProfileRole = "client" | "specialist" | "admin";
export type SpecialistKind = "vet" | "groomer";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          role: ProfileRole;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          city: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: ProfileRole;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      specialist_profiles: {
        Row: {
          id: string;
          user_id: string;
          kind: SpecialistKind;
          about: string | null;
          address: string;
          license_url: string | null;
          verification_status: VerificationStatus;
          rating: number;
          review_count: number;
          specialties: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: SpecialistKind;
          about?: string | null;
          address: string;
          license_url?: string | null;
          verification_status?: VerificationStatus;
          rating?: number;
          review_count?: number;
          specialties?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["specialist_profiles"]["Insert"]
        >;
      };
      services: {
        Row: {
          id: string;
          specialist_id: string;
          name: string;
          duration_minutes: number;
          price: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          specialist_id: string;
          name: string;
          duration_minutes: number;
          price: number;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };
      availability_rules: {
        Row: {
          id: string;
          specialist_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          break_start: string | null;
          break_end: string | null;
        };
        Insert: {
          id?: string;
          specialist_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          break_start?: string | null;
          break_end?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["availability_rules"]["Insert"]
        >;
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          specialist_id: string;
          service_id: string;
          appointment_time: string;
          status: AppointmentStatus;
          note: string | null;
          pet_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          specialist_id: string;
          service_id: string;
          appointment_time: string;
          status?: AppointmentStatus;
          note?: string | null;
          pet_id?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["appointments"]["Insert"]
        >;
      };
    };
  };
};
