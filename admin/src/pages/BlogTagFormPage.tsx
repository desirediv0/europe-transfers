import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { BlogTag } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function BlogTagFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
  });

  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      api.get<BlogTag>(`/blog/tags/${id}`)
        .then((data) => {
          setForm({
            name: data.name || "",
            slug: data.slug || "",
          });
        })
        .catch(() => toast.error("Failed to load tag details"))
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
      toast.error("Tag Name and URL Slug are required");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        await api.put(`/blog/tags/${id}`, form);
        toast.success("Tag updated successfully");
      } else {
        await api.post("/blog/tags", form);
        toast.success("Tag created successfully");
      }
      navigate("/blog/tags");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save tag");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading tag details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link
        to="/blog/tags"
        className="inline-flex items-center text-sm font-semibold text-[#1B2A4A] hover:underline transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Tags
      </Link>

      <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 md:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">TAG NAME</Label>
                <Input
                  placeholder="e.g. Beach Holidays"
                  value={form.name}
                  onChange={handleNameChange}
                  required
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">URL SLUG</Label>
                <Input
                  placeholder="e.g. beach-holidays"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
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
                {saving ? "Saving..." : isEditing ? "Update Tag" : "Create Tag"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
