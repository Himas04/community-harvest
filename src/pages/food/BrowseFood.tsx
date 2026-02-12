import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodMap } from "@/components/FoodMap";
import { fetchFoodListings, getDistance } from "@/lib/food-listings";
import { MapPin, Navigation, Search, Grid, Map as MapIcon } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function BrowseFood() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Tables<"food_listings">[]>([]);
  const [filtered, setFiltered] = useState<Tables<"food_listings">[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetchFoodListings("available").then(setListings).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = listings;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((l) => l.title.toLowerCase().includes(s) || l.description?.toLowerCase().includes(s) || l.pickup_address?.toLowerCase().includes(s));
    }

    if (userLocation) {
      result = result
        .filter((l) => l.latitude && l.longitude)
        .filter((l) => getDistance(userLocation.lat, userLocation.lng, l.latitude!, l.longitude!) <= maxDistance)
        .sort((a, b) => getDistance(userLocation.lat, userLocation.lng, a.latitude!, a.longitude!) - getDistance(userLocation.lat, userLocation.lng, b.latitude!, b.longitude!));
    }

    setFiltered(result);
  }, [listings, search, userLocation, maxDistance]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => setLocating(false)
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Browse Food</h1>
          <div className="flex gap-2">
            <Button variant={view === "grid" ? "default" : "outline"} size="sm" onClick={() => setView("grid")}>
              <Grid className="mr-1 h-4 w-4" /> Grid
            </Button>
            <Button variant={view === "map" ? "default" : "outline"} size="sm" onClick={() => setView("map")}>
              <MapIcon className="mr-1 h-4 w-4" /> Map
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search food listings..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" onClick={handleUseLocation} disabled={locating}>
            <Navigation className="mr-1 h-4 w-4" />
            {locating ? "Locating..." : userLocation ? "Update Location" : "Use My Location"}
          </Button>
          {userLocation && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Max {maxDistance}km</label>
              <input type="range" min={1} max={100} value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="w-24" />
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading listings...</p>
        ) : view === "map" ? (
          <FoodMap listings={filtered} userLocation={userLocation} onListingClick={(id) => navigate(`/food/${id}`)} />
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No food listings found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <Card key={listing.id} className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg" onClick={() => navigate(`/food/${listing.id}`)}>
                {listing.image_url && (
                  <img src={listing.image_url} alt={listing.title} className="h-40 w-full object-cover" />
                )}
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
                    <Badge variant="secondary" className="shrink-0 text-xs">{listing.status}</Badge>
                  </div>
                  {listing.description && <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{listing.description}</p>}
                  {listing.pickup_address && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {listing.pickup_address}
                    </p>
                  )}
                  {userLocation && listing.latitude && listing.longitude && (
                    <p className="mt-1 text-xs font-medium text-primary">
                      {getDistance(userLocation.lat, userLocation.lng, listing.latitude, listing.longitude).toFixed(1)} km away
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
