import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { SeoPage, Pagination } from "@/lib/types";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";

export default function SeoPagesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SeoPage[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async (page = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const data = await api.get<{ items: SeoPage[]; pagination: Pagination }>(
        `/seo-pages?page=${page}&limit=50&search=${encodeURIComponent(searchQuery)}`
      );
      setItems(data?.items || (Array.isArray(data) ? data : []));
      if (data?.pagination) setPagination(data.pagination);
    } catch {
      toast.error("Failed to load SEO pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1, search);
  }, [load, search]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.del(`/seo-pages/${deleteTarget.id}`);
      toast.success("SEO page deleted successfully");
      setDeleteTarget(null);
      load(pagination.page, search);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete SEO page");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Dynamic Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your regional SEO landing pages.</p>
        </div>
        <Button
          onClick={() => navigate("/seo-pages/new")}
          className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Page
        </Button>
      </div>

      <div className="flex items-center space-x-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search title, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 border-b border-gray-100">
              <TableRow>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6">
                  TITLE & SLUG
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                  LINKED CATEGORY
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                  STATUS
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-right pr-6">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-5 w-48 mb-1" /><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="pr-6 text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                    No SEO pages found. Click "Create New Page" to add one.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
                    <TableCell className="py-4 pl-6">
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <a
                        href={`http://localhost:3000/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#1B2A4A] hover:underline font-medium mt-0.5 block"
                      >
                        /{item.slug}
                      </a>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 uppercase tracking-wider">
                        {item.linkedCategory || "EUROPE PACKAGE"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`http://localhost:3000/${item.slug}`, "_blank")}
                          className="text-gray-400 hover:text-[#1B2A4A] hover:bg-slate-100 h-8 w-8 rounded-lg"
                          title="Preview Page"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/seo-pages/edit/${item.id}`)}
                          className="text-gray-400 hover:text-amber-600 hover:bg-amber-50 h-8 w-8 rounded-lg"
                          title="Edit Page"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget({ id: item.id, name: item.title })}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                          title="Delete Page"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-gray-900">Delete SEO Page</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong className="text-gray-900">{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-medium" onClick={confirmDelete}>
                Delete Page
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
