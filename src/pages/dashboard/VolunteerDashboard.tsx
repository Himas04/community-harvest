import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VolunteerDashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Volunteer Dashboard</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-lg">Available Pickups</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Pending deliveries</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">My Deliveries</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Active deliveries</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Completed</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Total delivered</p></CardContent>
          </Card>
        </div>
        <p className="mt-8 text-muted-foreground">Pickup management coming in Phase 3.</p>
      </div>
    </div>
  );
}
