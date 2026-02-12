import { Navbar } from "@/components/Navbar";
import { Heart, Target, Users, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">About LeftoverLove</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We believe no food should go to waste while people go hungry. LeftoverLove is a community-driven
            platform connecting food donors with those in need, powered by dedicated volunteers.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          {[
            { icon: Target, title: "Our Mission", desc: "To eliminate food waste and hunger in local communities by making food sharing easy, safe, and accessible to everyone." },
            { icon: Users, title: "Community First", desc: "Built on trust and transparency — every user is verified, and ratings help maintain a safe sharing environment." },
            { icon: Globe, title: "Local Impact", desc: "We focus on hyperlocal connections, so shared food reaches people quickly while it's still fresh." },
            { icon: Heart, title: "Made with Love", desc: "LeftoverLove is a passion project built to prove that technology can solve real-world problems in our neighborhoods." },
          ].map((item) => (
            <Card key={item.title} className="transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="w-fit rounded-lg bg-primary/10 p-2">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
