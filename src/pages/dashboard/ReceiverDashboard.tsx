import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReceiverDashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Receiver Dashboard</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-lg">Available Food</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Listings near you</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">My Requests</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Pickup requests</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Received</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Completed pickups</p></CardContent>
          </Card>
        </div>
        <p className="mt-8 text-muted-foreground">Browse and map view coming in Phase 2.</p>
      </div>
    </div>
  );
}
