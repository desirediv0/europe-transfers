import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { BlogCategory } from "@/lib/types";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

export default function BlogCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<BlogCategory[]>("/blog/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load blog categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.del(`/blog/categories/${deleteTarget.id}`);
      toast.success("Category deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog categories.</p>
        </div>
        <Button
          onClick={() => navigate("/blog/categories/new")}
          className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Category
        </Button>
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 border-b border-gray-100">
              <TableRow>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6">
                  NAME & SLUG
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-center">
                  POSTS
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-right pr-6">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-5 w-40 mb-1" /><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                    <TableCell className="pr-6 text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-gray-500">
                    No categories found. Click "Create New Category" to add one.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
                    <TableCell className="py-4 pl-6">
                      <div className="font-semibold text-gray-900">{cat.name}</div>
                      <a
                        href={`http://localhost:3000/blog/category/${cat.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#1B2A4A] hover:underline font-medium mt-0.5 block"
                      >
                        /blog/category/{cat.slug}
                      </a>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {cat.postsCount || 0} posts
                      </span>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`http://localhost:3000/blog/category/${cat.slug}`, "_blank")}
                          className="text-gray-400 hover:text-[#1B2A4A] hover:bg-slate-100 h-8 w-8 rounded-lg"
                          title="Preview Category"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/blog/categories/edit/${cat.id}`)}
                          className="text-gray-400 hover:text-amber-600 hover:bg-amber-50 h-8 w-8 rounded-lg"
                          title="Edit Category"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                          title="Delete Category"
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
            <h3 className="text-lg font-bold text-gray-900">Delete Category</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong className="text-gray-900">{deleteTarget.name}</strong>? Associated posts will be unlinked.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-medium" onClick={confirmDelete}>
                Delete Category
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
