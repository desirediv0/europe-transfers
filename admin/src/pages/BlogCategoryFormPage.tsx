import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { BlogCategory } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function BlogCategoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
  });

  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      api.get<BlogCategory>(`/blog/categories/${id}`)
        .then((data) => {
          setForm({
            name: data.name || "",
            slug: data.slug || "",
            description: data.description || "",
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
          });
        })
        .catch(() => toast.error("Failed to load category details"))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: !isEditing && (!prev.slug || prev.slug === slugify(prev.name)) ? slugify(name) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error("Category Name and URL Slug are required");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        await api.put(`/blog/categories/${id}`, form);
        toast.success("Category updated successfully");
      } else {
        await api.post("/blog/categories", form);
        toast.success("Category created successfully");
      }
      navigate("/blog/categories");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading category details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link
        to="/blog/categories"
        className="inline-flex items-center text-sm font-semibold text-[#1B2A4A] hover:underline transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Categories
      </Link>

      <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 md:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CATEGORY NAME</Label>
                <Input
                  placeholder="e.g. Travel Tips"
                  value={form.name}
                  onChange={handleNameChange}
                  required
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">URL SLUG</Label>
                <Input
                  placeholder="e.g. travel-tips"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">DESCRIPTION</Label>
              <Textarea
                placeholder="Brief description of this category..."
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-gray-50/50 border-gray-200"
              />
            </div>

            {/* SEO CONFIGURATION */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider block">SEO CONFIGURATION</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!form.name) {
                      toast.error("Please enter a Category Name first");
                      return;
                    }
                    const generatedTitle = `${form.name} Guides & Articles | Europe Transfers Blog`;
                    const generatedDesc = form.description
                      ? form.description.substring(0, 155)
                      : `Explore ${form.name} travel guides, destination tips, and Europe transfer insights from Europe Transfers.`;


                    setForm((prev) => ({
                      ...prev,
                      metaTitle: generatedTitle,
                      metaDescription: generatedDesc,
                    }));
                    toast.success("SEO Meta fields auto-generated!");
                  }}
                  className="text-xs font-semibold text-[#1B2A4A] border-[#1B2A4A]/20 hover:bg-[#1B2A4A]/5"
                >
                  ✨ Auto-generate SEO Meta
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">META TITLE</Label>
                  <span className={`text-[11px] font-mono font-medium ${form.metaTitle.length > 65 ? "text-amber-600 font-bold" : "text-gray-400"}`}>
                    {form.metaTitle.length} / 65 chars
                  </span>
                </div>
                <Input
                  placeholder="Category Meta Title..."
                  value={form.metaTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">META DESCRIPTION</Label>
                  <span className={`text-[11px] font-mono font-medium ${form.metaDescription.length > 160 ? "text-amber-600 font-bold" : "text-gray-400"}`}>
                    {form.metaDescription.length} / 160 chars
                  </span>
                </div>
                <Textarea
                  placeholder="Category Meta Description..."
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>
            </div>


            <div className="pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-medium py-3 rounded-xl shadow-md text-base transition-all"
              >
                {saving ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
