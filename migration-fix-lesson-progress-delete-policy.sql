-- Migration: Add DELETE policy for lesson_progress table
-- This fixes the bug where unchecking a lesson checkbox doesn't persist

-- Add DELETE policy to allow users to delete their own progress
CREATE POLICY "Users can delete own progress" ON lesson_progress FOR DELETE USING (true);
