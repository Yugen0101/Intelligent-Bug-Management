-- Drop old restrictive policy
DROP POLICY IF EXISTS "Users can view members of projects they're in" ON public.project_members;

-- Create new inclusive policy for authenticated users
CREATE POLICY "Authenticated users can view project members"
  ON public.project_members FOR SELECT
  USING (true); -- Since projects table also uses (true) for select
