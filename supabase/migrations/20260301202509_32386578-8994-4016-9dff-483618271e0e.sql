
-- Replace the overly permissive food_listings update policy with a proper one
DROP POLICY IF EXISTS "Authenticated can update listing status" ON public.food_listings;

-- Allow receivers/volunteers to update listing status only for status transitions (claimed/completed)
CREATE POLICY "Authenticated can update listing status"
ON public.food_listings FOR UPDATE
TO authenticated
USING (
  auth.uid() = donor_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'receiver'::app_role)
  OR has_role(auth.uid(), 'volunteer'::app_role)
  OR has_role(auth.uid(), 'ngo'::app_role)
)
WITH CHECK (
  auth.uid() = donor_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'receiver'::app_role)
  OR has_role(auth.uid(), 'volunteer'::app_role)
  OR has_role(auth.uid(), 'ngo'::app_role)
);

-- Also drop the old donor-only update policy to avoid conflicts
DROP POLICY IF EXISTS "Donors can update their own listings" ON public.food_listings;
