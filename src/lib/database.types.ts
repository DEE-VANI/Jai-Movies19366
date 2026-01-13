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
          short_review: string | null
          date_watched: string
          tags: string[] | null
          genres: string[] | null
          slug: string
          featured: boolean
          image_urls: string[] | null
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
          short_review?: string | null
          date_watched: string
          tags?: string[] | null
          genres?: string[] | null
          slug: string
          featured?: boolean
          image_urls?: string[] | null
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
          short_review?: string | null
          date_watched?: string
          tags?: string[] | null
          genres?: string[] | null
          slug?: string
          featured?: boolean
          image_urls?: string[] | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          reaction_id: string
          rating: number
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reaction_id: string
          rating: number
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reaction_id?: string
          rating?: number
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
