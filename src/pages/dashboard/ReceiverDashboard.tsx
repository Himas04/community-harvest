import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodMap } from "@/components/FoodMap";
import { fetchFoodListings } from "@/lib/food-listings";
import { MapPin, Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

export default function ReceiverDashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Tables<"food_listings">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodListings("available").then(setListings).catch(() => {}).finally(() => setLoading(false));
  }, []);

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
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">My Requests</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-xs text-muted-foreground">Coming in Phase 3</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Received</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-xs text-muted-foreground">Coming in Phase 3</p></CardContent></Card>
        </div>

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
