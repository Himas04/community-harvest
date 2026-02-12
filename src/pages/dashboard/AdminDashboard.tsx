import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Users</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Registered users</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Listings</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Food listings</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Pickups</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">0</p><p className="text-sm text-muted-foreground">Active pickups</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Reports</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-accent">0</p><p className="text-sm text-muted-foreground">Pending reports</p></CardContent>
          </Card>
        </div>
        <p className="mt-8 text-muted-foreground">Admin moderation tools coming in Phase 5.</p>
      </div>
    </div>
  );
}
