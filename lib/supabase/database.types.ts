export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      hotels: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hotels"]["Insert"]>;
      };
      learner_profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          nickname: string;
          phone: string;
          hotel_id: string | null;
          hotel_name: string;
          total_points: number;
          weekly_points: number;
          week_start: string | null;
          cefr_level: string;
          assessment_score: number;
          points_history: Json;
          visited_courses: Json;
          last_daily_bonus: string | null;
          hr_registered: boolean;
          trial_lessons_used: number;
          employee_meta: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          nickname?: string;
          phone?: string;
          hotel_id?: string | null;
          hotel_name?: string;
          total_points?: number;
          weekly_points?: number;
          week_start?: string | null;
          cefr_level?: string;
          assessment_score?: number;
          points_history?: Json;
          visited_courses?: Json;
          last_daily_bonus?: string | null;
          hr_registered?: boolean;
          trial_lessons_used?: number;
          employee_meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["learner_profiles"]["Insert"]>;
      };
      employees: {
        Row: {
          id: string;
          legacy_id: string | null;
          hotel_id: string;
          phone: string;
          nickname: string;
          department: string;
          role: string;
          cefr_level: string;
          assessment_score: number;
          passed_assessment_levels: Json;
          total_points: number;
          weekly_points: number;
          completed_lessons: number;
          total_lessons: number;
          course_progress_percent: number;
          last_active_at: string | null;
          status: "active" | "inactive" | "new";
          hire_date: string | null;
          probation_end_date: string | null;
          is_imported: boolean;
          is_hidden: boolean;
          learner_profile_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          legacy_id?: string | null;
          hotel_id: string;
          phone: string;
          nickname: string;
          department?: string;
          role?: string;
          cefr_level?: string;
          assessment_score?: number;
          passed_assessment_levels?: Json;
          total_points?: number;
          weekly_points?: number;
          completed_lessons?: number;
          total_lessons?: number;
          course_progress_percent?: number;
          last_active_at?: string | null;
          status?: "active" | "inactive" | "new";
          hire_date?: string | null;
          probation_end_date?: string | null;
          is_imported?: boolean;
          is_hidden?: boolean;
          learner_profile_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
      };
      learning_progress: {
        Row: {
          id: string;
          learner_id: string;
          progress_key: string;
          data: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          learner_id: string;
          progress_key: string;
          data?: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["learning_progress"]["Insert"]>;
      };
      learning_history: {
        Row: {
          id: string;
          learner_id: string;
          employee_id: string | null;
          occurred_at: string;
          phase: string;
          ask_dimension: string;
          title: string;
          subtitle: string | null;
          node_id: string | null;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          learner_id: string;
          employee_id?: string | null;
          occurred_at: string;
          phase: string;
          ask_dimension: string;
          title: string;
          subtitle?: string | null;
          node_id?: string | null;
          score?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["learning_history"]["Insert"]>;
      };
      hr_admin_accounts: {
        Row: {
          id: string;
          hotel_id: string;
          username: string;
          password_hash: string;
          display_name: string;
          phone: string | null;
          email: string | null;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          username: string;
          password_hash: string;
          display_name: string;
          phone?: string | null;
          email?: string | null;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hr_admin_accounts"]["Insert"]>;
      };
      hotel_hr_permissions: {
        Row: {
          hotel_id: string;
          config: Json;
          updated_at: string;
        };
        Insert: {
          hotel_id: string;
          config?: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hotel_hr_permissions"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type HotelRow = Database["public"]["Tables"]["hotels"]["Row"];
export type LearnerProfileRow = Database["public"]["Tables"]["learner_profiles"]["Row"];
export type EmployeeRow = Database["public"]["Tables"]["employees"]["Row"];
export type LearningProgressRow = Database["public"]["Tables"]["learning_progress"]["Row"];
export type LearningHistoryRow = Database["public"]["Tables"]["learning_history"]["Row"];
export type HrAdminAccountRow = Database["public"]["Tables"]["hr_admin_accounts"]["Row"];
