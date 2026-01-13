/*
  # Create Reactions Table for Movie & Series Journal

  1. New Tables
    - `reactions`
      - `id` (uuid, primary key) - Unique identifier
      - `title` (text) - Movie or series title
      - `type` (text) - Either 'movie' or 'series'
      - `poster_url` (text, nullable) - URL to poster image
      - `reaction_text` (text) - Personal reaction (100-150 words)
      - `date_watched` (date) - When the movie/series was watched
      - `tags` (text array, nullable) - Optional tags for categorization
      - `slug` (text, unique) - URL-friendly slug for individual pages
      - `created_at` (timestamptz) - When the entry was created
      - `updated_at` (timestamptz) - Last update timestamp
      - `user_id` (uuid) - Reference to auth.users

  2. Security
    - Enable RLS on `reactions` table
    - Add policy for public read access (anyone can view reactions)
    - Add policy for authenticated users to insert their own reactions
    - Add policy for authenticated users to update their own reactions
    - Add policy for authenticated users to delete their own reactions
*/

CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('movie', 'series')),
  poster_url text,
  reaction_text text NOT NULL,
  date_watched date NOT NULL,
  tags text[],
  slug text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON reactions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert their own reactions"
  ON reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
  ON reactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS reactions_user_id_idx ON reactions(user_id);
CREATE INDEX IF NOT EXISTS reactions_date_watched_idx ON reactions(date_watched DESC);
CREATE INDEX IF NOT EXISTS reactions_slug_idx ON reactions(slug);