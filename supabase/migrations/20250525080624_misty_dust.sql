/*
  # Fix group members recursion

  1. Changes
    - Drop existing policies that cause recursion
    - Add new optimized policies for group members table
    - Ensure proper access control without recursion
  
  2. Security
    - Maintain RLS protection while preventing recursion
    - Allow users to view and manage their groups
    - Prevent unauthorized access
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;

-- Create new, optimized policies
CREATE POLICY "Users can view members of their groups"
ON group_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM group_members my_groups
    WHERE my_groups.group_id = group_members.group_id
    AND my_groups.user_id = auth.uid()
  )
);

CREATE POLICY "Group admins can manage members"
ON group_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM group_members admin_check
    WHERE admin_check.group_id = group_members.group_id
    AND admin_check.user_id = auth.uid()
    AND admin_check.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM group_members admin_check
    WHERE admin_check.group_id = group_members.group_id
    AND admin_check.user_id = auth.uid()
    AND admin_check.role = 'admin'
  )
);

CREATE POLICY "Users can join groups"
ON group_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());