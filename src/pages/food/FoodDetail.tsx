import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchListingById } from "@/lib/food-listings";
import { ArrowLeft, MapPin, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { FoodMap } from "@/components/FoodMap";

export default function FoodDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Tables<"food_listings"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchListingById(id).then(setListing).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div></div>;
  if (!listing) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20 text-muted-foreground">Listing not found.</div></div>;

  const statusColor = listing.status === "available" ? "bg-primary" : listing.status === "claimed" ? "bg-accent" : "bg-muted-foreground";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Link to="/browse" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>

        <Card>
          <CardContent className="p-0">
            {listing.image_url && (
              <img src={listing.image_url} alt={listing.title} className="h-64 w-full rounded-t-lg object-cover" />
            )}
            <div className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold">{listing.title}</h1>
                <Badge className={`${statusColor} text-primary-foreground`}>{listing.status}</Badge>
              </div>

              {listing.description && <p className="text-muted-foreground">{listing.description}</p>}

              {listing.pickup_address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {listing.pickup_address}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Posted {new Date(listing.created_at).toLocaleDateString()}
              </div>

              {listing.latitude && listing.longitude && (
                <FoodMap listings={[listing]} className="mt-4" />
              )}

              {listing.status === "available" && (
                <Button className="w-full" size="lg">
                  Request Pickup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
