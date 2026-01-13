/*
  # Migrate to Movie Review Platform

  1. Add New Columns to Reactions Table
    - `short_review` (text) - Concise review for previews
    - `genres` (text[]) - Movie genres for filtering
    - `featured` (boolean) - Mark as featured review
    - `image_urls` (text[]) - Array of up to 10 images for gallery

  2. Create Ratings Table
    - `id` (uuid, primary key)
    - `reaction_id` (uuid) - Foreign key to reactions
    - `rating` (integer, 1-5)
    - `user_id` (uuid) - Who gave the rating
    - `created_at` (timestamptz)
    - Unique constraint on (reaction_id, user_id) - one rating per user per review

  3. Security
    - Enable RLS on ratings table
    - Add policies for public read, authenticated users create/update own ratings
*/

ALTER TABLE reactions 
ADD COLUMN IF NOT EXISTS short_review text,
ADD COLUMN IF NOT EXISTS genres text[],
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS image_urls text[];

CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reaction_id uuid NOT NULL REFERENCES reactions(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(reaction_id, user_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON ratings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own ratings"
  ON ratings
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own ratings"
  ON ratings
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS ratings_reaction_id_idx ON ratings(reaction_id);
CREATE INDEX IF NOT EXISTS ratings_user_id_idx ON ratings(user_id);
CREATE INDEX IF NOT EXISTS reactions_featured_idx ON reactions(featured, date_watched DESC);