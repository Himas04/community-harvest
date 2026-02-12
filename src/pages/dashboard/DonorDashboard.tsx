import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyListings, deleteFoodListing } from "@/lib/food-listings";
import { fetchRequestsForDonor, statusLabel, statusColor, type PickupRequest } from "@/lib/pickup-requests";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, MapPin, Package } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function DonorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Tables<"food_listings">[]>([]);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchMyListings(user.id),
      fetchRequestsForDonor(user.id),
    ]).then(([l, r]) => { setListings(l); setRequests(r); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [user]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('donor-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickup_requests' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_listings', filter: `donor_id=eq.${user.id}` }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await deleteFoodListing(id);
      toast({ title: "Deleted" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const active = listings.filter((l) => l.status === "available").length;
  const completed = listings.filter((l) => l.status === "completed").length;
  const claimed = listings.filter((l) => l.status === "claimed").length;
  const pendingRequests = requests.filter((r) => r.status === "pending" || r.status === "accepted").length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Donor Dashboard</h1>
          <Button asChild>
            <Link to="/food/create"><Plus className="mr-1 h-4 w-4" /> New Listing</Link>
          </Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{active}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{completed}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Claimed</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-accent">{claimed}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-accent">{pendingRequests}</p></CardContent></Card>
        </div>

        {/* Incoming Requests */}
        {requests.length > 0 && (
          <>
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2"><Package className="h-5 w-5" /> Incoming Requests</h2>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-1">{req.food_listings?.title || "Listing"}</h3>
                      <Badge className={`${statusColor(req.status)} text-white shrink-0 text-xs`}>{statusLabel(req.status)}</Badge>
                    </div>
                    {req.note && <p className="mb-2 text-sm text-muted-foreground line-clamp-2">"{req.note}"</p>}
                    <p className="text-xs text-muted-foreground">Requested {new Date(req.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <h2 className="mb-4 text-xl font-semibold">My Listings</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : listings.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No listings yet. Create your first food listing!</CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                {listing.image_url && <img src={listing.image_url} alt={listing.title} className="h-36 w-full object-cover" />}
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
                    <Badge variant={listing.status === "available" ? "default" : "secondary"} className="shrink-0 text-xs">{listing.status}</Badge>
                  </div>
                  {listing.pickup_address && (
                    <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{listing.pickup_address}</p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild><Link to={`/food/edit/${listing.id}`}><Edit className="mr-1 h-3 w-3" /> Edit</Link></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(listing.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
