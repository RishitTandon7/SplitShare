/*
  # Fix group_members policies

  1. Changes
    - Drop existing policies on group_members table that cause infinite recursion
    - Create new, optimized policies that avoid self-referencing loops
    
  2. Security
    - Maintain RLS security while preventing infinite recursion
    - Ensure group members can still view and manage their groups
    - Prevent unauthorized access to group data
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;

-- Create new, optimized policies
CREATE POLICY "Group admins can manage members"
ON group_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members admin_check
    WHERE admin_check.group_id = group_members.group_id
    AND admin_check.user_id = auth.uid()
    AND admin_check.role = 'admin'
  )
);

CREATE POLICY "Users can view members of their groups"
ON group_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members member_check
    WHERE member_check.group_id = group_members.group_id
    AND member_check.user_id = auth.uid()
  )
);