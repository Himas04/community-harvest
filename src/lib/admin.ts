import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type UserWithRole = {
  user_id: string;
  name: string | null;
  created_at: string;
  role: string | null;
};

export async function fetchAllUsers(): Promise<UserWithRole[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, name, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const { data: roles } = await supabase.from("user_roles").select("user_id, role");
  const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

  return (profiles ?? []).map((p) => ({
    ...p,
    role: roleMap.get(p.user_id) ?? null,
  }));
}

export async function changeUserRole(userId: string, newRole: string) {
  // Delete existing role
  await supabase.from("user_roles").delete().eq("user_id", userId);
  // Insert new role
  const { error } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role: newRole as any });
  if (error) throw error;
}

export async function deleteReviewAdmin(reviewId: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw error;
}

export async function fetchAllReviewsAdmin() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const reviews = data ?? [];

  // Fetch reviewer & reviewed names
  const userIds = [...new Set(reviews.flatMap((r) => [r.reviewer_id, r.reviewed_user_id]))];
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("user_id, name").in("user_id", userIds);
    const nameMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p.name ?? "User"]));
    return reviews.map((r) => ({
      ...r,
      reviewer_name: nameMap.get(r.reviewer_id) ?? "User",
      reviewed_name: nameMap.get(r.reviewed_user_id) ?? "User",
    }));
  }
  return reviews.map((r) => ({ ...r, reviewer_name: "User", reviewed_name: "User" }));
}

export async function deleteListingAdmin(listingId: string) {
  const { error } = await supabase.from("food_listings").delete().eq("id", listingId);
  if (error) throw error;
}
