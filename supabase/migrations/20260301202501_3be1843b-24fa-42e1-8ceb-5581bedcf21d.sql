
-- Drop all existing policies on pickup_requests and recreate as PERMISSIVE

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Receivers can create pickup requests" ON public.pickup_requests;
DROP POLICY IF EXISTS "NGOs can create pickup requests" ON public.pickup_requests;

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view their own requests" ON public.pickup_requests;
DROP POLICY IF EXISTS "NGOs can view their own requests" ON public.pickup_requests;
DROP POLICY IF EXISTS "Volunteers can view volunteer_requested requests" ON public.pickup_requests;

-- Drop existing UPDATE policies
DROP POLICY IF EXISTS "Receivers can update their own requests" ON public.pickup_requests;
DROP POLICY IF EXISTS "NGOs can update their own requests" ON public.pickup_requests;
DROP POLICY IF EXISTS "Donors can update requests on their listings" ON public.pickup_requests;
DROP POLICY IF EXISTS "Volunteers can update requests" ON public.pickup_requests;

-- Recreate INSERT policies as PERMISSIVE
CREATE POLICY "Receivers can create pickup requests"
ON public.pickup_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = receiver_id AND has_role(auth.uid(), 'receiver'::app_role));

CREATE POLICY "NGOs can create pickup requests"
ON public.pickup_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = receiver_id AND has_role(auth.uid(), 'ngo'::app_role));

-- Recreate SELECT policies as PERMISSIVE
CREATE POLICY "Users can view their own requests"
ON public.pickup_requests FOR SELECT
TO authenticated
USING (
  auth.uid() = receiver_id
  OR auth.uid() = volunteer_id
  OR auth.uid() IN (SELECT food_listings.donor_id FROM food_listings WHERE food_listings.id = pickup_requests.listing_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Volunteers can view volunteer_requested requests"
ON public.pickup_requests FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'volunteer'::app_role) AND status = 'volunteer_requested'::request_status);

-- Recreate UPDATE policies as PERMISSIVE
CREATE POLICY "Receivers can update their own requests"
ON public.pickup_requests FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id AND status IN ('pending'::request_status, 'donor_approved'::request_status, 'picked_up'::request_status, 'delivered'::request_status));

CREATE POLICY "NGOs can update their own requests"
ON public.pickup_requests FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id AND has_role(auth.uid(), 'ngo'::app_role) AND status IN ('pending'::request_status, 'donor_approved'::request_status, 'picked_up'::request_status, 'delivered'::request_status));

CREATE POLICY "Donors can update requests on their listings"
ON public.pickup_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM food_listings WHERE food_listings.id = pickup_requests.listing_id AND food_listings.donor_id = auth.uid())
  AND status = 'pending'::request_status
);

CREATE POLICY "Volunteers can update requests"
ON public.pickup_requests FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'volunteer'::app_role)
  AND ((volunteer_id IS NULL AND status = 'volunteer_requested'::request_status) OR volunteer_id = auth.uid())
);

-- Also allow authenticated users to update food_listings status for claimed/completed transitions
DROP POLICY IF EXISTS "Authenticated can update listing status" ON public.food_listings;
CREATE POLICY "Authenticated can update listing status"
ON public.food_listings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
