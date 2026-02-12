import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  fetchPendingRequests,
  fetchVolunteerRequests,
  acceptRequest,
  updateRequestStatus,
  statusLabel,
  statusColor,
  type PickupRequest,
} from "@/lib/pickup-requests";
import { MapPin, Truck, CheckCircle, Package } from "lucide-react";

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pending, setPending] = useState<PickupRequest[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchPendingRequests(),
      fetchVolunteerRequests(user.id),
    ]).then(([p, d]) => { setPending(p); setMyDeliveries(d); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('volunteer-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickup_requests' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_listings' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleAccept = async (requestId: string) => {
    if (!user) return;
    try {
      await acceptRequest(requestId, user.id);
      toast({ title: "Pickup accepted!" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (requestId: string, status: "picked_up" | "delivered") => {
    try {
      await updateRequestStatus(requestId, status);
      toast({ title: `Status updated to ${statusLabel(status)}` });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const active = myDeliveries.filter((d) => d.status === "accepted" || d.status === "picked_up");
  const completed = myDeliveries.filter((d) => d.status === "delivered");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Volunteer Dashboard</h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Available Pickups</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{pending.length}</p><p className="text-xs text-muted-foreground">Pending requests</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">My Deliveries</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{active.length}</p><p className="text-xs text-muted-foreground">Active deliveries</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{completed.length}</p><p className="text-xs text-muted-foreground">Total delivered</p></CardContent></Card>
        </div>

        {/* Available Pickups */}
        <h2 className="mb-4 text-xl font-semibold flex items-center gap-2"><Package className="h-5 w-5" /> Available Pickups</h2>
        {loading ? (
          <p className="text-muted-foreground mb-8">Loading...</p>
        ) : pending.length === 0 ? (
          <Card className="mb-8"><CardContent className="py-8 text-center text-muted-foreground">No pending pickups right now.</CardContent></Card>
        ) : (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((req) => (
              <Card key={req.id}>
                {req.food_listings?.image_url && <img src={req.food_listings.image_url} alt={req.food_listings.title} className="h-32 w-full object-cover rounded-t-lg" />}
                <CardContent className="p-4">
                  <h3 className="mb-1 font-semibold line-clamp-1 cursor-pointer hover:text-primary" onClick={() => navigate(`/food/${req.listing_id}`)}>{req.food_listings?.title || "Listing"}</h3>
                  {req.food_listings?.pickup_address && (
                    <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{req.food_listings.pickup_address}</p>
                  )}
                  {req.note && <p className="mb-2 text-xs text-muted-foreground italic">"{req.note}"</p>}
                  <Button size="sm" className="w-full" onClick={() => handleAccept(req.id)}>
                    <Truck className="mr-1 h-3 w-3" /> Accept Pickup
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* My Active Deliveries */}
        {active.length > 0 && (
          <>
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2"><Truck className="h-5 w-5" /> My Active Deliveries</h2>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((req) => (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-1">{req.food_listings?.title || "Listing"}</h3>
                      <Badge className={`${statusColor(req.status)} text-white shrink-0 text-xs`}>{statusLabel(req.status)}</Badge>
                    </div>
                    {req.food_listings?.pickup_address && (
                      <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{req.food_listings.pickup_address}</p>
                    )}
                    <div className="flex gap-2">
                      {req.status === "accepted" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(req.id, "picked_up")}>
                          Mark Picked Up
                        </Button>
                      )}
                      {req.status === "picked_up" && (
                        <Button size="sm" onClick={() => handleStatusUpdate(req.id, "delivered")}>
                          <CheckCircle className="mr-1 h-3 w-3" /> Mark Delivered
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Completed Deliveries</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((req) => (
                <Card key={req.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-1">{req.food_listings?.title || "Listing"}</h3>
                      <Badge className="bg-green-600 text-white shrink-0 text-xs">Delivered</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Completed {new Date(req.updated_at).toLocaleDateString()}</p>
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
