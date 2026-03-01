
-- Update volunteer SELECT policy to see volunteer_requested instead of just pending
DROP POLICY IF EXISTS "Volunteers can view pending requests" ON public.pickup_requests;
CREATE POLICY "Volunteers can view volunteer_requested requests"
ON public.pickup_requests
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'volunteer'::app_role) 
  AND status = 'volunteer_requested'
);

-- Update volunteer UPDATE policy to handle volunteer_accepted status  
DROP POLICY IF EXISTS "Volunteers can update requests they accepted" ON public.pickup_requests;
CREATE POLICY "Volunteers can update requests"
ON public.pickup_requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'volunteer'::app_role) 
  AND (
    (volunteer_id IS NULL AND status = 'volunteer_requested')
    OR volunteer_id = auth.uid()
  )
);

-- Allow receivers to update their own requests for self-pickup and confirm
DROP POLICY IF EXISTS "Receivers can cancel their pending requests" ON public.pickup_requests;
CREATE POLICY "Receivers can update their own requests"
ON public.pickup_requests
FOR UPDATE
TO authenticated
USING (
  auth.uid() = receiver_id
  AND status IN ('pending', 'donor_approved', 'picked_up', 'delivered')
);

-- NGOs can also update their requests
DROP POLICY IF EXISTS "NGOs can cancel their pending requests" ON public.pickup_requests;
CREATE POLICY "NGOs can update their own requests"
ON public.pickup_requests
FOR UPDATE
TO authenticated
USING (
  auth.uid() = receiver_id
  AND has_role(auth.uid(), 'ngo'::app_role)
  AND status IN ('pending', 'donor_approved', 'picked_up', 'delivered')
);
