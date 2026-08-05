import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { TipTapEditor } from "@/components/TipTapEditor";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { BlogPost, BlogCategory, BlogTag } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function BlogPostFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    coverImage: "",
    categoryId: "",
    tagIds: [] as string[],
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  useEffect(() => {
    // Load categories & tags for selectors
    api.get<BlogCategory[]>("/blog/categories").then(setCategories).catch(() => {});
    api.get<BlogTag[]>("/blog/tags").then(setTags).catch(() => {});

    if (isEditing && id) {
      setLoading(true);
      api.get<BlogPost>(`/blog/posts/${id}`)
        .then((data) => {
          const selectedTagIds = data.tags ? data.tags.map((t) => t.tagId) : [];
          setForm({
            title: data.title || "",
            slug: data.slug || "",
            content: data.content || "",
            coverImage: data.coverImage || "",
            categoryId: data.categoryId || "",
            tagIds: selectedTagIds,
            status: data.status || "DRAFT",
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
            metaKeywords: data.metaKeywords || "",
          });
        })
        .catch(() => toast.error("Failed to load blog post details"))
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: !isEditing && (!prev.slug || prev.slug === slugify(prev.title)) ? slugify(title) : prev.slug,
    }));
  };

  const toggleTag = (tagId: string) => {
    setForm((prev) => {
      const exists = prev.tagIds.includes(tagId);
      return {
        ...prev,
        tagIds: exists ? prev.tagIds.filter((t) => t !== tagId) : [...prev.tagIds, tagId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) {
      toast.error("Title and URL Slug are required");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        await api.put(`/blog/posts/${id}`, form);
        toast.success("Blog post updated successfully");
      } else {
        await api.post("/blog/posts", form);
        toast.success("Blog post created successfully");
      }
      navigate("/blog/posts");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading blog post details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link
        to="/blog/posts"
        className="inline-flex items-center text-sm font-semibold text-[#1B2A4A] hover:underline transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Posts
      </Link>

      <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 md:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">POST TITLE</Label>
                <Input
                  placeholder="e.g. Best Europe DMC in Gujarat"
                  value={form.title}
                  onChange={handleTitleChange}
                  required
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">URL SLUG</Label>
                <Input
                  placeholder="e.g. best-europe-dmc-in-gujarat"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CATEGORY</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(val) => setForm({ ...form, categoryId: val })}
                >
                  <SelectTrigger className="bg-gray-50/50 border-gray-200">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">STATUS</Label>
                <Select
                  value={form.status}
                  onValueChange={(val: "DRAFT" | "PUBLISHED") => setForm({ ...form, status: val })}
                >
                  <SelectTrigger className="bg-gray-50/50 border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags Selection */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">TAGS</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((t) => {
                    const isSelected = form.tagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">COVER IMAGE</Label>
              <ImageUpload
                value={form.coverImage}
                onChange={(url) => setForm({ ...form, coverImage: url })}
                label="Post Cover Image"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">POST CONTENT</Label>
              <TipTapEditor
                value={form.content}
                onChange={(html) => setForm((prev) => ({ ...prev, content: html }))}
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
                    if (!form.title) {
                      toast.error("Please enter a Post Title first");
                      return;
                    }
                    const generatedTitle = `${form.title} | Europe Transfers Blog`;
                    const rawText = (form.content || "").replace(/<[^>]*>?/gm, "").trim();
                    const generatedDesc = rawText
                      ? rawText.substring(0, 155)
                      : `Read ${form.title} on Europe Transfers blog. Expert Europe travel tips and DMC updates.`;
                    
                    const catObj = categories.find((c) => c.id === form.categoryId);
                    const generatedKw = [form.title, catObj?.name, "Europe Travel", "Europe Transfers", "B2B Transfers"]

                      .filter(Boolean)
                      .join(", ");

                    setForm((prev) => ({
                      ...prev,
                      metaTitle: generatedTitle,
                      metaDescription: generatedDesc,
                      metaKeywords: generatedKw,
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
                  placeholder="Post Meta Title..."
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
                  placeholder="Post Meta Description..."
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">META KEYWORDS</Label>
                <Input
                  placeholder="comma, separated, keywords"
                  value={form.metaKeywords}
                  onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
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
                {saving ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
