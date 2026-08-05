import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { SeoPage, BlogCategory, FaqItem } from "@/lib/types";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function SeoPageFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    linkedCategory: "Europe Package",
    pageDescription: "",
    cityContent: "",
    additionalSeoContent: "",
    faqs: [] as FaqItem[],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  useEffect(() => {
    // Load categories for dropdown
    api.get<BlogCategory[]>("/blog/categories").then(setCategories).catch(() => { });

    if (isEditing && id) {
      setLoading(true);
      api.get<SeoPage>(`/seo-pages/${id}`)
        .then((data) => {
          setForm({
            title: data.title || "",
            slug: data.slug || "",
            linkedCategory: data.linkedCategory || "Europe Package",
            pageDescription: data.pageDescription || "",
            cityContent: data.cityContent || "",
            additionalSeoContent: data.additionalSeoContent || "",
            faqs: Array.isArray(data.faqs) ? data.faqs : [],
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
            metaKeywords: data.metaKeywords || "",
            status: data.status || "ACTIVE",
          });
        })
        .catch(() => toast.error("Failed to load SEO page details"))
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

  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    setForm((prev) => {
      const newFaqs = [...prev.faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return { ...prev, faqs: newFaqs };
    });
  };

  const removeFaq = (index: number) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) {
      toast.error("Page Title and URL Slug are required");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        await api.put(`/seo-pages/${id}`, form);
        toast.success("SEO Page updated successfully");
      } else {
        await api.post("/seo-pages", form);
        toast.success("SEO Page created successfully");
      }
      navigate("/seo-pages");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save SEO page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading page details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link
        to="/seo-pages"
        className="inline-flex items-center text-sm font-semibold text-[#1B2A4A] hover:underline transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Pages
      </Link>

      <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 md:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">PAGE TITLE</Label>
                <Input
                  placeholder="e.g. Europe B2B DMC in Chennai"
                  value={form.title}
                  onChange={handleTitleChange}
                  required
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">URL SLUG</Label>
                <Input
                  placeholder="e.g. europe-dmc-in-chennai"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">LINKED CATEGORY</Label>
              <Select
                value={form.linkedCategory}
                onValueChange={(val) => setForm({ ...form, linkedCategory: val })}
              >
                <SelectTrigger className="bg-gray-50/50 border-gray-200">
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent
                >
                  <SelectItem value="select" disabled>Select Category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">PAGE DESCRIPTION</Label>
              <Textarea
                placeholder="Tell us about your services in this region..."
                rows={4}
                value={form.pageDescription}
                onChange={(e) => setForm({ ...form, pageDescription: e.target.value })}
                className="bg-gray-50/50 border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CITY-SPECIFIC CONTENT</Label>
              <Textarea
                placeholder="Unique content about why travel agents in this city choose Europe Transfers..."

                rows={4}
                value={form.cityContent}
                onChange={(e) => setForm({ ...form, cityContent: e.target.value })}
                className="bg-gray-50/50 border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ADDITIONAL SEO CONTENT</Label>
              <Textarea
                placeholder="Extra content for SEO depth..."
                rows={4}
                value={form.additionalSeoContent}
                onChange={(e) => setForm({ ...form, additionalSeoContent: e.target.value })}
                className="bg-gray-50/50 border-gray-200"
              />
            </div>

            {/* FAQ Section */}
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider block">FAQ SECTION</Label>
              <div className="space-y-3">
                {form.faqs.map((faq, index) => (
                  <div key={index} className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">FAQ #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFaq(index)}
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Question..."
                      value={faq.question}
                      onChange={(e) => updateFaq(index, "question", e.target.value)}
                      className="bg-white"
                    />
                    <Textarea
                      placeholder="Answer..."
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, "answer", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addFaq}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-[#1B2A4A] hover:text-[#1B2A4A] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add FAQ
                </button>
              </div>
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
                      toast.error("Please enter a Page Title first");
                      return;
                    }
                    const generatedTitle = `${form.title} - Europe Transfers | B2B Europe Travel Partner`;
                    const generatedDesc = form.pageDescription
                      ? form.pageDescription.substring(0, 155)
                      : `Book ${form.title} with Europe Transfers. Trusted B2B Europe transfers & DMC services.`;
                    const generatedKw = [form.title, form.linkedCategory, "Europe DMC", "B2B Travel", "Europe Transfers"]
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
                  placeholder="e.g. Best Europe DMC in Dubai - Europe Transfers"

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
                  placeholder="Meta description for search engines..."
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
                {saving ? "Saving..." : isEditing ? "Update SEO Page" : "Create SEO Page"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
