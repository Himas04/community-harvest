import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/lib/notifications";

export type PickupRequest = {
  id: string;
  listing_id: string;
  receiver_id: string;
  volunteer_id: string | null;
  self_pickup: boolean;
  status: "pending" | "donor_approved" | "volunteer_requested" | "volunteer_accepted" | "accepted" | "picked_up" | "delivered" | "confirmed" | "cancelled";
  note: string | null;
  created_at: string;
  updated_at: string;
  food_listings?: {
    id: string;
    title: string;
    pickup_address: string | null;
    image_url: string | null;
    donor_id: string;
    status: string;
  };
  profiles?: {
    name: string | null;
    phone: string | null;
  };
};

// Receiver creates a pickup request → status: pending
export async function createPickupRequest(listingId: string, receiverId: string, note?: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .insert({ listing_id: listingId, receiver_id: receiverId, note: note || null } as any)
    .select("*, food_listings(donor_id, title)")
    .single();
  if (error) throw error;
  await supabase.from("food_listings").update({ status: "claimed" as any }).eq("id", listingId);
  const donorId = (data as any)?.food_listings?.donor_id;
  if (donorId) {
    await createNotification(donorId, "new_request", "New pickup request", `Someone requested "${(data as any)?.food_listings?.title}"`, `/food/${listingId}`);
  }
  return data;
}

// Donor approves a pending request → status: donor_approved
export async function donorApproveRequest(requestId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .update({ status: "donor_approved" as any } as any)
    .eq("id", requestId)
    .select("*, food_listings(title)")
    .single();
  if (error) throw error;
  const receiverId = (data as any)?.receiver_id;
  if (receiverId) {
    await createNotification(receiverId, "request_approved", "Request approved!", `Your request for "${(data as any)?.food_listings?.title}" has been approved. Please pick up or request a volunteer.`);
  }
  return data;
}

// Donor rejects a pending request → status: cancelled, listing back to available
export async function donorRejectRequest(requestId: string, listingId: string) {
  const { error } = await supabase
    .from("pickup_requests")
    .update({ status: "cancelled" as any } as any)
    .eq("id", requestId);
  if (error) throw error;
  await supabase.from("food_listings").update({ status: "available" as any }).eq("id", listingId);
}

// Receiver chooses self-pickup → status: picked_up (they go get it themselves)
export async function receiverSelfPickup(requestId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .update({ self_pickup: true, status: "picked_up" as any } as any)
    .eq("id", requestId)
    .select("*, food_listings(title, donor_id)")
    .single();
  if (error) throw error;
  const donorId = (data as any)?.food_listings?.donor_id;
  if (donorId) {
    await createNotification(donorId, "self_pickup", "Receiver is picking up", `The receiver will pick up "${(data as any)?.food_listings?.title}" themselves.`);
  }
  return data;
}

// Receiver requests a volunteer → status: volunteer_requested
export async function requestVolunteer(requestId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .update({ status: "volunteer_requested" as any } as any)
    .eq("id", requestId)
    .select("*, food_listings(title)")
    .single();
  if (error) throw error;
  return data;
}

// Volunteer accepts a volunteer_requested task → status: volunteer_accepted
export async function volunteerAcceptRequest(requestId: string, volunteerId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .update({ volunteer_id: volunteerId, status: "volunteer_accepted" as any } as any)
    .eq("id", requestId)
    .select("*, food_listings(title)")
    .single();
  if (error) throw error;
  const receiverId = (data as any)?.receiver_id;
  if (receiverId) {
    await createNotification(receiverId, "volunteer_accepted", "Volunteer accepted!", `A volunteer will pick up "${(data as any)?.food_listings?.title}" for you.`);
  }
  return data;
}

// Volunteer marks as picked up → status: picked_up
export async function volunteerPickedUp(requestId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .update({ status: "picked_up" as any } as any)
    .eq("id", requestId)
    .select("*, food_listings(title)")
    .single();
  if (error) throw error;
  const receiverId = (data as any)?.receiver_id;
  if (receiverId) {
    await createNotification(receiverId, "status_picked_up", "Food picked up!", `Your food "${(data as any)?.food_listings?.title}" has been picked up by the volunteer.`);
  }
  return data;
}

// Volunteer marks as delivered to receiver → status: delivered
export async function volunteerDelivered(requestId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .update({ status: "delivered" as any } as any)
    .eq("id", requestId)
    .select("*, food_listings(title)")
    .single();
  if (error) throw error;
  const receiverId = (data as any)?.receiver_id;
  if (receiverId) {
    await createNotification(receiverId, "status_delivered", "Food delivered!", `Your food "${(data as any)?.food_listings?.title}" has been delivered. Please confirm receipt.`);
  }
  return data;
}

// Receiver confirms delivery → status: confirmed, listing → completed
export async function receiverConfirmDelivery(requestId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .update({ status: "confirmed" as any } as any)
    .eq("id", requestId)
    .select("*, food_listings(id, title, donor_id)")
    .single();
  if (error) throw error;
  if ((data as any)?.food_listings?.id) {
    await supabase.from("food_listings").update({ status: "completed" as any }).eq("id", (data as any).food_listings.id);
  }
  const donorId = (data as any)?.food_listings?.donor_id;
  if (donorId) {
    await createNotification(donorId, "delivery_confirmed", "Delivery confirmed!", `The receiver confirmed receipt of "${(data as any)?.food_listings?.title}".`);
  }
  const volunteerId = (data as any)?.volunteer_id;
  if (volunteerId) {
    await createNotification(volunteerId, "delivery_confirmed", "Delivery confirmed!", `The receiver confirmed receipt of "${(data as any)?.food_listings?.title}".`);
  }
  return data;
}

// Cancel request (receiver cancels pending)
export async function cancelRequest(requestId: string, listingId: string) {
  const { error } = await supabase
    .from("pickup_requests")
    .update({ status: "cancelled" as any } as any)
    .eq("id", requestId);
  if (error) throw error;
  await supabase.from("food_listings").update({ status: "available" as any }).eq("id", listingId);
}

// Fetch helpers
export async function fetchRequestsForReceiver(receiverId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*, food_listings(id, title, pickup_address, image_url, donor_id, status)")
    .eq("receiver_id", receiverId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as PickupRequest[];
}

export async function fetchRequestsForDonor(donorId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*, food_listings!inner(id, title, pickup_address, image_url, donor_id, status)")
    .eq("food_listings.donor_id", donorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as PickupRequest[];
}

export async function fetchVolunteerAvailableRequests() {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*, food_listings(id, title, pickup_address, image_url, donor_id, status)")
    .eq("status", "volunteer_requested" as any)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as PickupRequest[];
}

export async function fetchVolunteerRequests(volunteerId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*, food_listings(id, title, pickup_address, image_url, donor_id, status)")
    .eq("volunteer_id", volunteerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as PickupRequest[];
}

export async function fetchPendingRequests() {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*, food_listings(id, title, pickup_address, image_url, donor_id, status)")
    .eq("status", "pending" as any)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as PickupRequest[];
}

export async function fetchAllRequestsAdmin() {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*, food_listings(id, title, pickup_address, image_url, donor_id, status)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as PickupRequest[];
}

// Keep old functions for backward compat
export async function acceptRequest(requestId: string, volunteerId: string) {
  return volunteerAcceptRequest(requestId, volunteerId);
}

export async function updateRequestStatus(requestId: string, status: "picked_up" | "delivered" | "cancelled") {
  if (status === "picked_up") return volunteerPickedUp(requestId);
  if (status === "delivered") return volunteerDelivered(requestId);
  const { data, error } = await supabase
    .from("pickup_requests")
    .update({ status: status as any } as any)
    .eq("id", requestId)
    .select("*, food_listings(id, title, donor_id)")
    .single();
  if (error) throw error;
  return data;
}

// Status display helpers
export function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Pending Approval",
    donor_approved: "Approved - Awaiting Pickup",
    volunteer_requested: "Volunteer Requested",
    volunteer_accepted: "Volunteer Accepted",
    accepted: "Accepted",
    picked_up: "Picked Up",
    delivered: "Delivered to Receiver",
    confirmed: "Completed",
    cancelled: "Cancelled",
  };
  return map[status] || status;
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500",
    donor_approved: "bg-blue-500",
    volunteer_requested: "bg-orange-500",
    volunteer_accepted: "bg-indigo-500",
    accepted: "bg-blue-500",
    picked_up: "bg-orange-500",
    delivered: "bg-teal-500",
    confirmed: "bg-green-600",
    cancelled: "bg-muted-foreground",
  };
  return map[status] || "bg-muted-foreground";
}
