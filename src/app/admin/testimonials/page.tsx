"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Plus, Edit2, Trash2, Quote, Loader2, Upload, Image as ImageIcon, X, Search } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string | null;
  quote: string;
  badge: string | null;
  rating: number;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const ROLES = [
  "Outreach Recipient",
  "LDI Participant",
  "LDI Graduate",
  "Community Member",
  "Volunteer",
  "Partner Organization",
  "Family Member",
  "Staff Member",
];

const BADGES = [
  "Seen. Heard. Valued.",
  "Transformed Life",
  "Hope Restored",
  "Community Impact",
  "Recovery Journey",
  "Leadership Development",
  "Grateful Heart",
];

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
    quote: "",
    badge: "",
    rating: 5,
    isPublished: false,
    isFeatured: false,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/testimonials?all=true');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      image: "",
      quote: "",
      badge: "",
      rating: 5,
      isPublished: false,
      isFeatured: false,
      sortOrder: 0,
    });
    setEditingTestimonial(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('bucket', 'document-uploads');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, image: data.url });
        toast.success('Image uploaded successfully');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, image: reader.result as string });
          toast.success('Image loaded (local preview)');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
        toast.success('Image loaded (local preview)');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.quote) {
      toast.error('Name and quote are required');
      return;
    }

    setSaving(true);
    try {
      const url = editingTestimonial 
        ? `/api/testimonials?id=${editingTestimonial.id}`
        : '/api/testimonials';
      
      const response = await fetch(url, {
        method: editingTestimonial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingTestimonial ? 'Testimonial updated' : 'Testimonial created');
        resetForm();
        setIsAddDialogOpen(false);
        fetchTestimonials();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save testimonial');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      image: testimonial.image || "",
      quote: testimonial.quote,
      badge: testimonial.badge || "",
      rating: testimonial.rating,
      isPublished: testimonial.isPublished,
      isFeatured: testimonial.isFeatured,
      sortOrder: testimonial.sortOrder,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const response = await fetch(`/api/testimonials?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Testimonial deleted');
        fetchTestimonials();
      } else {
        toast.error('Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const togglePublished = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`/api/testimonials?id=${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testimonial,
          isPublished: !testimonial.isPublished,
        }),
      });

      if (response.ok) {
        toast.success(testimonial.isPublished ? 'Testimonial unpublished' : 'Testimonial published');
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Failed to update testimonial');
    }
  };

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`/api/testimonials?id=${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testimonial,
          isFeatured: !testimonial.isFeatured,
        }),
      });

      if (response.ok) {
        toast.success(testimonial.isFeatured ? 'Removed from featured' : 'Added to featured');
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Failed to update testimonial');
    }
  };

  const filteredTestimonials = testimonials.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage testimonials displayed on the homepage
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </DialogTitle>
              <DialogDescription>
                {editingTestimonial ? 'Update testimonial details' : 'Create a new testimonial for the homepage'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="John D."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Testimonial Image</Label>
                <div className="mt-2 flex items-start gap-4">
                  {formData.image ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image
                        src={formData.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Or paste an image URL below
                    </p>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="quote">Quote *</Label>
                <Textarea
                  id="quote"
                  placeholder="Share the testimonial quote..."
                  rows={4}
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="badge">Badge</Label>
                  <Select
                    value={formData.badge}
                    onValueChange={(value) => setFormData({ ...formData, badge: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select badge" />
                    </SelectTrigger>
                    <SelectContent>
                      {BADGES.map((badge) => (
                        <SelectItem key={badge} value={badge}>{badge}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Select
                    value={formData.rating.toString()}
                    onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((r) => (
                        <SelectItem key={r} value={r.toString()}>
                          {r} {r === 1 ? 'Star' : 'Stars'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <Label>Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                  <Label>Featured on Homepage</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={saving}
                  className="bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingTestimonial ? 'Update' : 'Create'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
          <CardDescription>
            {filteredTestimonials.length} testimonial{filteredTestimonials.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#A92FFA]" />
              <p className="text-muted-foreground">Loading testimonials...</p>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Quote className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No testimonials found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {testimonial.image ? (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Quote className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold">{testimonial.name}</p>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{testimonial.role}</span>
                      {testimonial.isPublished && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Published
                        </Badge>
                      )}
                      {testimonial.isFeatured && (
                        <Badge className="text-xs bg-[#A92FFA] text-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < testimonial.rating ? 'fill-[#F28C28] text-[#F28C28]' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                      {testimonial.badge && (
                        <Badge variant="outline" className="text-xs">{testimonial.badge}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePublished(testimonial)}
                    >
                      {testimonial.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFeatured(testimonial)}
                    >
                      {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(testimonial.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
