export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      frequency_word_examples: {
        Row: {
          arabic: string;
          audio_url: string | null;
          created_at: string;
          id: string;
          meaning: string;
          order: number;
          transliteration: string;
          updated_at: string;
          word_id: string;
        };
        Insert: {
          arabic: string;
          audio_url?: string | null;
          created_at?: string;
          id: string;
          meaning: string;
          order: number;
          transliteration: string;
          updated_at?: string;
          word_id: string;
        };
        Update: {
          arabic?: string;
          audio_url?: string | null;
          created_at?: string;
          id?: string;
          meaning?: string;
          order?: number;
          transliteration?: string;
          updated_at?: string;
          word_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'frequency_word_examples_word_id_fkey';
            columns: ['word_id'];
            isOneToOne: false;
            referencedRelation: 'words';
            referencedColumns: ['id'];
          },
        ];
      };
      lesson_quiz_questions: {
        Row: {
          correct_answer: string;
          created_at: string;
          explanation: string | null;
          id: string;
          lesson_id: string;
          order: number;
          question: string;
          updated_at: string;
          wrong_answers: string[];
        };
        Insert: {
          correct_answer: string;
          created_at?: string;
          explanation?: string | null;
          id: string;
          lesson_id: string;
          order: number;
          question: string;
          updated_at?: string;
          wrong_answers: string[];
        };
        Update: {
          correct_answer?: string;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          lesson_id?: string;
          order?: number;
          question?: string;
          updated_at?: string;
          wrong_answers?: string[];
        };
        Relationships: [
          {
            foreignKeyName: 'lesson_quiz_questions_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
      lessons: {
        Row: {
          created_at: string;
          id: string;
          lesson_type: string;
          name: string;
          order: number;
          unit_id: string;
          updated_at: string;
          word_count: number;
        };
        Insert: {
          created_at?: string;
          id: string;
          lesson_type?: string;
          name: string;
          order: number;
          unit_id: string;
          updated_at?: string;
          word_count?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          lesson_type?: string;
          name?: string;
          order?: number;
          unit_id?: string;
          updated_at?: string;
          word_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'lessons_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'units';
            referencedColumns: ['id'];
          },
        ];
      };
      pathways: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          name: string;
          preview_items: string[] | null;
          promise: string;
          slug: string;
          total_units: number;
          total_words: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id: string;
          is_active?: boolean;
          name: string;
          preview_items?: string[] | null;
          promise: string;
          slug: string;
          total_units?: number;
          total_words?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          preview_items?: string[] | null;
          promise?: string;
          slug?: string;
          total_units?: number;
          total_words?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      roots: {
        Row: {
          created_at: string;
          id: string;
          letters: string;
          meaning: string;
          transliteration: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          letters: string;
          meaning: string;
          transliteration?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          letters?: string;
          meaning?: string;
          transliteration?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      units: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          order: number;
          pathway_id: string;
          updated_at: string;
          word_count: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id: string;
          name: string;
          order: number;
          pathway_id: string;
          updated_at?: string;
          word_count?: number;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          order?: number;
          pathway_id?: string;
          updated_at?: string;
          word_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'units_pathway_id_fkey';
            columns: ['pathway_id'];
            isOneToOne: false;
            referencedRelation: 'pathways';
            referencedColumns: ['id'];
          },
        ];
      };
      user_lesson_progress: {
        Row: {
          completed_at: string | null;
          id: string;
          is_synced: boolean | null;
          lesson_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          id?: string;
          is_synced?: boolean | null;
          lesson_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          id?: string;
          is_synced?: boolean | null;
          lesson_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_lesson_progress_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
      user_xp: {
        Row: {
          id: string;
          user_id: string;
          total_xp: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_xp?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_xp?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          freeze_used_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          freeze_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          freeze_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          streak_reminders: boolean;
          review_reminders: boolean;
          learning_reminders: boolean;
          sound_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          streak_reminders?: boolean;
          review_reminders?: boolean;
          learning_reminders?: boolean;
          sound_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          streak_reminders?: boolean;
          review_reminders?: boolean;
          learning_reminders?: boolean;
          sound_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      export_requests: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          status: string;
          requested_at: string;
          completed_at: string | null;
          download_url: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          status?: string;
          requested_at?: string;
          completed_at?: string | null;
          download_url?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          status?: string;
          requested_at?: string;
          completed_at?: string | null;
          download_url?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      deletion_requests: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          type: string;
          status: string;
          requested_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          type?: string;
          status?: string;
          requested_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          type?: string;
          status?: string;
          requested_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          display_name: string | null;
          id: string;
          onboarding_completed: boolean | null;
          onboarding_completed_at: string | null;
          script_reading_ability: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          id: string;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          script_reading_ability?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          id?: string;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          script_reading_ability?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_word_progress: {
        Row: {
          created_at: string;
          ease_factor: number;
          id: string;
          interval: number;
          next_review: string;
          repetitions: number;
          status: string;
          updated_at: string;
          user_id: string;
          word_id: string;
        };
        Insert: {
          created_at?: string;
          ease_factor?: number;
          id?: string;
          interval?: number;
          next_review?: string;
          repetitions?: number;
          status?: string;
          updated_at?: string;
          user_id: string;
          word_id: string;
        };
        Update: {
          created_at?: string;
          ease_factor?: number;
          id?: string;
          interval?: number;
          next_review?: string;
          repetitions?: number;
          status?: string;
          updated_at?: string;
          user_id?: string;
          word_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_word_progress_word_id_fkey';
            columns: ['word_id'];
            isOneToOne: false;
            referencedRelation: 'words';
            referencedColumns: ['id'];
          },
        ];
      };
      word_roots: {
        Row: {
          root_id: string;
          word_id: string;
        };
        Insert: {
          root_id: string;
          word_id: string;
        };
        Update: {
          root_id?: string;
          word_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'word_roots_root_id_fkey';
            columns: ['root_id'];
            isOneToOne: false;
            referencedRelation: 'roots';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'word_roots_word_id_fkey';
            columns: ['word_id'];
            isOneToOne: false;
            referencedRelation: 'words';
            referencedColumns: ['id'];
          },
        ];
      };
      words: {
        Row: {
          arabic: string;
          audio_url: string | null;
          created_at: string;
          description: string | null;
          frequency: number | null;
          id: string;
          lesson_id: string;
          meaning: string;
          order: number;
          transliteration: string;
          updated_at: string;
        };
        Insert: {
          arabic: string;
          audio_url?: string | null;
          created_at?: string;
          description?: string | null;
          frequency?: number | null;
          id: string;
          lesson_id: string;
          meaning: string;
          order: number;
          transliteration: string;
          updated_at?: string;
        };
        Update: {
          arabic?: string;
          audio_url?: string | null;
          created_at?: string;
          description?: string | null;
          frequency?: number | null;
          id?: string;
          lesson_id?: string;
          meaning?: string;
          order?: number;
          transliteration?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'words_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_user_xp: {
        Args: {
          p_user_id: string;
          p_delta: number;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;

// Convenience type exports for application use
export type Pathway = Database['public']['Tables']['pathways']['Row'];
export type Unit = Database['public']['Tables']['units']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Word = Database['public']['Tables']['words']['Row'];
export type Root = Database['public']['Tables']['roots']['Row'];
export type WordRoot = Database['public']['Tables']['word_roots']['Row'];
export type UserLessonProgress = Database['public']['Tables']['user_lesson_progress']['Row'];
export type UserLessonProgressInsert =
  Database['public']['Tables']['user_lesson_progress']['Insert'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type FrequencyWordExample = Database['public']['Tables']['frequency_word_examples']['Row'];
export type LessonQuizQuestion = Database['public']['Tables']['lesson_quiz_questions']['Row'];
export type UserWordProgress = Database['public']['Tables']['user_word_progress']['Row'];
export type UserXp = Database['public']['Tables']['user_xp']['Row'];
export type UserXpInsert = Database['public']['Tables']['user_xp']['Insert'];
export type UserXpUpdate = Database['public']['Tables']['user_xp']['Update'];
export type UserStreak = Database['public']['Tables']['user_streaks']['Row'];
export type UserStreakInsert = Database['public']['Tables']['user_streaks']['Insert'];
export type UserStreakUpdate = Database['public']['Tables']['user_streaks']['Update'];

export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];
export type ExportRequest = Database['public']['Tables']['export_requests']['Row'];
export type DeletionRequest = Database['public']['Tables']['deletion_requests']['Row'];

// Composed types
export interface PathwayWithUnits extends Pathway {
  units: Unit[];
}
