import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchFoodListings } from "@/lib/food-listings";
import { fetchAllRequestsAdmin, statusLabel, statusColor, type PickupRequest } from "@/lib/pickup-requests";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export default function AdminDashboard() {
  const [users, setUsers] = useState(0);
  const [listings, setListings] = useState<Tables<"food_listings">[]>([]);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      fetchFoodListings(),
      fetchAllRequestsAdmin(),
    ]).then(([profileRes, l, r]) => {
      setUsers(profileRes.count ?? 0);
      setListings(l);
      setRequests(r);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const activePickups = requests.filter((r) => r.status === "accepted" || r.status === "picked_up").length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{loading ? "..." : users}</p><p className="text-xs text-muted-foreground">Registered users</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Listings</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{loading ? "..." : listings.length}</p><p className="text-xs text-muted-foreground">Food listings</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Pickups</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{loading ? "..." : activePickups}</p><p className="text-xs text-muted-foreground">In progress</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-accent">{loading ? "..." : pendingRequests}</p><p className="text-xs text-muted-foreground">Awaiting volunteers</p></CardContent></Card>
        </div>

        {/* Recent Requests */}
        <h2 className="mb-4 text-xl font-semibold">Recent Pickup Requests</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : requests.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No pickup requests yet.</CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.slice(0, 9).map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold line-clamp-1">{req.food_listings?.title || "Listing"}</h3>
                    <Badge className={`${statusColor(req.status)} text-white shrink-0 text-xs`}>{statusLabel(req.status)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Created {new Date(req.created_at).toLocaleDateString()}</p>
                  {req.volunteer_id && <p className="mt-1 text-xs text-muted-foreground">Volunteer assigned</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="mt-8 text-muted-foreground">Full admin moderation tools coming in Phase 5.</p>
      </div>
    </div>
  );
}
