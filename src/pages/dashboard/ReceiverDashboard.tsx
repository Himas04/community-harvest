import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FoodMap } from "@/components/FoodMap";
import { supabase } from "@/integrations/supabase/client";
import { fetchFoodListings } from "@/lib/food-listings";
import { fetchRequestsForReceiver, cancelRequest, statusLabel, statusColor, type PickupRequest } from "@/lib/pickup-requests";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Search, Package, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

export default function ReceiverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Tables<"food_listings">[]>([]);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchFoodListings("available"),
      fetchRequestsForReceiver(user.id),
    ]).then(([l, r]) => { setListings(l); setRequests(r); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('receiver-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickup_requests' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_listings' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleCancel = async (req: PickupRequest) => {
    if (!confirm("Cancel this request?")) return;
    try {
      await cancelRequest(req.id, req.listing_id);
      toast({ title: "Request cancelled" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const activeRequests = requests.filter((r) => r.status !== "cancelled" && r.status !== "delivered");
  const completedRequests = requests.filter((r) => r.status === "delivered");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Receiver Dashboard</h1>
          <Button asChild><Link to="/browse"><Search className="mr-1 h-4 w-4" /> Browse All</Link></Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Available Food</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{listings.length}</p><p className="text-xs text-muted-foreground">Listings near you</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">My Requests</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{activeRequests.length}</p><p className="text-xs text-muted-foreground">Active requests</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Received</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{completedRequests.length}</p><p className="text-xs text-muted-foreground">Completed pickups</p></CardContent></Card>
        </div>

        {/* My Requests */}
        {requests.length > 0 && (
          <>
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2"><Package className="h-5 w-5" /> My Requests</h2>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-1 cursor-pointer hover:text-primary" onClick={() => navigate(`/food/${req.listing_id}`)}>{req.food_listings?.title || "Listing"}</h3>
                      <Badge className={`${statusColor(req.status)} text-white shrink-0 text-xs`}>{statusLabel(req.status)}</Badge>
                    </div>
                    {req.food_listings?.pickup_address && (
                      <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{req.food_listings.pickup_address}</p>
                    )}
                    <p className="text-xs text-muted-foreground mb-2">Requested {new Date(req.created_at).toLocaleDateString()}</p>
                    {req.status === "pending" && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleCancel(req)}>
                        <X className="mr-1 h-3 w-3" /> Cancel
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <h2 className="mb-4 text-xl font-semibold">Nearby Food</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : listings.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No available listings right now.</CardContent></Card>
        ) : (
          <>
            <FoodMap listings={listings} onListingClick={(id) => navigate(`/food/${id}`)} className="mb-6" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.slice(0, 6).map((listing) => (
                <Card key={listing.id} className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => navigate(`/food/${listing.id}`)}>
                  {listing.image_url && <img src={listing.image_url} alt={listing.title} className="h-36 w-full object-cover rounded-t-lg" />}
                  <CardContent className="p-4">
                    <h3 className="mb-1 font-semibold">{listing.title}</h3>
                    {listing.pickup_address && <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{listing.pickup_address}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
