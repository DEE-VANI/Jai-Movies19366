/*
  # Optimize RLS Policies and Indexes

  1. RLS Policy Optimization
    - Replace direct auth.uid() calls with (select auth.uid()) subqueries
    - This improves performance by preventing row-level re-evaluation
    - Affects: INSERT, UPDATE, DELETE policies on reactions table

  2. Index Optimization
    - Remove unused index `reactions_user_id_idx`
    - The user_id column is used in RLS policies but not frequently queried directly
    - Reduces storage overhead and maintenance cost
*/

DROP POLICY IF EXISTS "Authenticated users can insert their own reactions" ON reactions;
DROP POLICY IF EXISTS "Users can update their own reactions" ON reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON reactions;

CREATE POLICY "Authenticated users can insert their own reactions"
  ON reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own reactions"
  ON reactions
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own reactions"
  ON reactions
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP INDEX IF EXISTS reactions_user_id_idx;