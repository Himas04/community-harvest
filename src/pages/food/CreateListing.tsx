import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationPicker } from "@/components/LocationPicker";
import { useAuth } from "@/lib/auth";
import { createFoodListing, uploadFoodImage } from "@/lib/food-listings";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadFoodImage(user.id, imageFile);
      }

      await createFoodListing({
        donor_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        pickup_address: pickupAddress.trim() || null,
        latitude,
        longitude,
        image_url: imageUrl,
      });

      toast({ title: "Listing created!", description: "Your food listing is now available." });
      navigate("/dashboard/donor");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link to="/dashboard/donor" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create Food Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fresh vegetables from garden" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the food, quantity, dietary info..." rows={3} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pickup Address</label>
                <Input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="Enter pickup address" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Photo</label>
                <div className="flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Upload className="h-4 w-4" />
                    {imageFile ? imageFile.name : "Upload image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />}
                </div>
              </div>

              <LocationPicker latitude={latitude} longitude={longitude} onLocationChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />

              <Button type="submit" className="w-full" disabled={loading || !title.trim()}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Listing"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
