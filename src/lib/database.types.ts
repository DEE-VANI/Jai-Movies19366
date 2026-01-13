export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      reactions: {
        Row: {
          id: string
          title: string
          type: 'movie' | 'series'
          poster_url: string | null
          reaction_text: string
          date_watched: string
          tags: string[] | null
          slug: string
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          type: 'movie' | 'series'
          poster_url?: string | null
          reaction_text: string
          date_watched: string
          tags?: string[] | null
          slug: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: 'movie' | 'series'
          poster_url?: string | null
          reaction_text?: string
          date_watched?: string
          tags?: string[] | null
          slug?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
