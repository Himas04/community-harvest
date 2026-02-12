import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export default function DonorDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Donor Dashboard</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-lg">My Listings</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Active food listings</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Total Donations</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Completed donations</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Pending Requests</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-accent">0</p><p className="text-sm text-muted-foreground">Awaiting pickup</p></CardContent>
          </Card>
        </div>
        <p className="mt-8 text-muted-foreground">Food listing management coming in Phase 2.</p>
      </div>
    </div>
  );
}
