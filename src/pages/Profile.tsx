import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";
import { fetchReviewsForUser, fetchAverageRating, type Review } from "@/lib/reviews";

export default function Profile() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        setBio(data.bio ?? "");
      }
    });
    fetchReviewsForUser(user.id).then(setReviews);
    fetchAverageRating(user.id).then(setAvgRating);
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ name, phone, bio }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-lg px-4 py-12">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                {name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-3">My Profile</CardTitle>
            {role && <Badge variant="secondary" className="capitalize">{role}</Badge>}
            {avgRating.count > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating value={Math.round(avgRating.avg)} readonly size="sm" />
                <span className="text-sm text-muted-foreground">
                  {avgRating.avg.toFixed(1)} ({avgRating.count} review{avgRating.count !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Reviews section */}
        {reviews.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{review.reviewer_name ?? "User"}</span>
                    <StarRating value={review.rating} readonly size="sm" />
                  </div>
                  {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
                  <p className="mt-1 text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
