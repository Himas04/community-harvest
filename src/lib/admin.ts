import { supabase } from "@/integrations/supabase/client";

export type UserWithRole = {
  user_id: string;
  name: string | null;
  created_at: string;
  role: string | null;
  is_banned: boolean;
  ban_reason: string | null;
};

export type AuditLogEntry = {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: any;
  created_at: string;
  admin_name?: string;
};

export async function fetchAllUsers(): Promise<UserWithRole[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, name, created_at, is_banned, ban_reason")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const { data: roles } = await supabase.from("user_roles").select("user_id, role");
  const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

  return (profiles ?? []).map((p: any) => ({
    ...p,
    role: roleMap.get(p.user_id) ?? null,
  }));
}

export async function fetchAuditLog(): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from("admin_audit_log" as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  const entries = (data ?? []) as unknown as AuditLogEntry[];
  const adminIds = [...new Set(entries.map((e) => e.admin_id))];
  if (adminIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("user_id, name").in("user_id", adminIds);
    const nameMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p.name ?? "Admin"]));
    return entries.map((e) => ({ ...e, admin_name: nameMap.get(e.admin_id) ?? "Admin" }));
  }
  return entries;
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
