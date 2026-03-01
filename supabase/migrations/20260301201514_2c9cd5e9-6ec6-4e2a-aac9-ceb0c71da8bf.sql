
-- Add new statuses to request_status enum
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'donor_approved';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'volunteer_requested';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'volunteer_accepted';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'confirmed';

-- Add volunteer_requested flag and receiver self-pickup tracking
ALTER TABLE public.pickup_requests 
  ADD COLUMN IF NOT EXISTS self_pickup boolean NOT NULL DEFAULT false;

-- RLS: Donors can approve/reject pending requests on their listings
CREATE POLICY "Donors can update requests on their listings"
ON public.pickup_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM food_listings 
    WHERE food_listings.id = pickup_requests.listing_id 
    AND food_listings.donor_id = auth.uid()
  )
  AND status = 'pending'
);
