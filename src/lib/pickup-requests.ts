import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/lib/notifications";

export type PickupRequest = {
  id: string;
  listing_id: string;
  receiver_id: string;
  volunteer_id: string | null;
  status: "pending" | "accepted" | "picked_up" | "delivered" | "cancelled";
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

export async function createPickupRequest(listingId: string, receiverId: string, note?: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .insert({ listing_id: listingId, receiver_id: receiverId, note: note || null } as any)
    .select("*, food_listings(donor_id, title)")
    .single();
  if (error) throw error;
  // Also update the listing status to claimed
  await supabase.from("food_listings").update({ status: "claimed" as any }).eq("id", listingId);
  // Notify the donor
  const donorId = (data as any)?.food_listings?.donor_id;
  if (donorId) {
    await createNotification(donorId, "new_request", "New pickup request", `Someone requested "${(data as any)?.food_listings?.title}"`, `/food/${listingId}`);
  }
  return data;
}

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

export async function fetchPendingRequests() {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*, food_listings(id, title, pickup_address, image_url, donor_id, status)")
    .eq("status", "pending" as any)
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

export async function acceptRequest(requestId: string, volunteerId: string) {
  const { data, error } = await supabase
    .from("pickup_requests")
    .update({ volunteer_id: volunteerId, status: "accepted" as any } as any)
    .eq("id", requestId)
    .select("*, food_listings(title)")
    .single();
  if (error) throw error;
  // Notify the receiver
  const receiverId = (data as any)?.receiver_id;
  if (receiverId) {
    await createNotification(receiverId, "request_accepted", "Pickup accepted!", `A volunteer accepted your request for "${(data as any)?.food_listings?.title}"`);
  }
  return data;
}

export async function updateRequestStatus(requestId: string, status: "picked_up" | "delivered" | "cancelled") {
  const { data, error } = await supabase
    .from("pickup_requests")
    .update({ status: status as any } as any)
    .eq("id", requestId)
    .select("*, food_listings(id, title, donor_id)")
    .single();
  if (error) throw error;
  // If delivered, update listing to completed
  if (status === "delivered" && (data as any)?.food_listings?.id) {
    await supabase.from("food_listings").update({ status: "completed" as any }).eq("id", (data as any).food_listings.id);
  }
  // Notify receiver about status changes
  const receiverId = (data as any)?.receiver_id;
  const title = (data as any)?.food_listings?.title ?? "your request";
  if (receiverId) {
    const statusMessages: Record<string, string> = {
      picked_up: `Your food "${title}" has been picked up!`,
      delivered: `Your food "${title}" has been delivered!`,
    };
    if (statusMessages[status]) {
      await createNotification(receiverId, `status_${status}`, statusLabel(status), statusMessages[status]);
    }
  }
  return data;
}

export async function cancelRequest(requestId: string, listingId: string) {
  const { error } = await supabase
    .from("pickup_requests")
    .update({ status: "cancelled" as any } as any)
    .eq("id", requestId);
  if (error) throw error;
  // Revert listing to available
  await supabase.from("food_listings").update({ status: "available" as any }).eq("id", listingId);
}

export async function fetchAllRequestsAdmin() {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*, food_listings(id, title, pickup_address, image_url, donor_id, status)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as PickupRequest[];
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    picked_up: "Picked Up",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] || status;
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500",
    accepted: "bg-blue-500",
    picked_up: "bg-orange-500",
    delivered: "bg-green-600",
    cancelled: "bg-muted-foreground",
  };
  return map[status] || "bg-muted-foreground";
}
