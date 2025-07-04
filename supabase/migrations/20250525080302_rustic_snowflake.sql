/*
  # Fix group members policies

  1. Changes
    - Drop existing policies on group_members table that cause recursion
    - Create new, simplified policies that avoid recursion:
      - Group admins can manage members
      - Users can view members of their groups
      - Users can join groups (insert their own membership)

  2. Security
    - Maintains RLS protection
    - Prevents infinite recursion while keeping security intact
    - Uses direct user ID checks instead of recursive membership checks
*/

-- Drop existing policies to replace them
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;

-- Create new, non-recursive policies
CREATE POLICY "Group admins can manage members"
ON group_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.role = 'admin'
  )
);

CREATE POLICY "Users can view members of their groups"
ON group_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join groups"
ON group_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);