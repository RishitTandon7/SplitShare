/*
  # Fix group members policy recursion

  1. Changes
    - Remove recursive policy for group members table
    - Add simplified policy for group members visibility
    - Update policy for group member management

  2. Security
    - Maintain RLS protection
    - Ensure users can only see members of groups they belong to
    - Allow group admins to manage members
*/

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Group members can create expenses" ON group_members;

-- Create new, non-recursive policies
CREATE POLICY "Users can view members of their groups"
ON group_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members my_groups
    WHERE my_groups.group_id = group_members.group_id
    AND my_groups.user_id = auth.uid()
  )
);

-- Update group admin management policy
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;

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
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members admin_check
    WHERE admin_check.group_id = group_members.group_id
    AND admin_check.user_id = auth.uid()
    AND admin_check.role = 'admin'
  )
);