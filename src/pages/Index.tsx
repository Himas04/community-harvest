import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Users, Truck, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const features = [
  { icon: Heart, title: "Share Food", desc: "Donate surplus food to people in your community who need it most." },
  { icon: MapPin, title: "Find Nearby", desc: "Browse an interactive map to discover available food near you." },
  { icon: Truck, title: "Volunteer Pickups", desc: "Volunteers help deliver food from donors to receivers seamlessly." },
  { icon: ShieldCheck, title: "Trusted Community", desc: "Ratings and reviews build trust between donors, receivers, and volunteers." },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto flex flex-col items-center gap-8 px-4 py-24 text-center md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
            <Heart className="h-4 w-4 fill-primary" /> Reducing food waste, one meal at a time
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
            Share Food,{" "}
            <span className="text-primary">Spread Love</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            LeftoverLove connects food donors with people in need through a community-driven platform with real-time maps, volunteer pickups, and trust-based ratings.
          </p>
          <div className="flex gap-3">
            <Button size="lg" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-2 text-muted-foreground">A simple, powerful way to reduce food waste in your community.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="group transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Who Can Join?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🍽️", role: "Donor", desc: "Share surplus food with your community" },
              { icon: "🙋", role: "Receiver", desc: "Find and request free food nearby" },
              { icon: "🚗", role: "Volunteer", desc: "Help deliver food to those in need" },
              { icon: "🛡️", role: "Admin", desc: "Moderate and manage the platform" },
            ].map((r) => (
              <Card key={r.role} className="text-center transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-3 text-4xl">{r.icon}</div>
                  <h3 className="text-lg font-semibold">{r.role}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to Make a Difference?</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Join LeftoverLove today and help build a community where no food goes to waste.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link to="/signup">Join Now — It's Free</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold text-foreground">LeftoverLove</span>
          </div>
          <p>© 2026 LeftoverLove. Built with love to reduce food waste.</p>
        </div>
      </footer>
    </div>
  );
}
