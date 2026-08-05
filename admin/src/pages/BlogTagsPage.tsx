import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { BlogTag } from "@/lib/types";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

export default function BlogTagsPage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<BlogTag[]>("/blog/tags");
      setTags(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load blog tags");
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
      await api.del(`/blog/tags/${deleteTarget.id}`);
      toast.success("Tag deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete tag");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Tags</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog tags.</p>
        </div>
        <Button
          onClick={() => navigate("/blog/tags/new")}
          className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Tag
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
              ) : tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-gray-500">
                    No tags found. Click "Create New Tag" to add one.
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag) => (
                  <TableRow key={tag.id} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
                    <TableCell className="py-4 pl-6">
                      <div className="font-semibold text-gray-900">{tag.name}</div>
                      <a
                        href={`http://localhost:3000/blog/tag/${tag.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#1B2A4A] hover:underline font-medium mt-0.5 block"
                      >
                        /blog/tag/{tag.slug}
                      </a>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {tag.postsCount || 0} posts
                      </span>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`http://localhost:3000/blog/tag/${tag.slug}`, "_blank")}
                          className="text-gray-400 hover:text-[#1B2A4A] hover:bg-slate-100 h-8 w-8 rounded-lg"
                          title="Preview Tag Archive"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/blog/tags/edit/${tag.id}`)}
                          className="text-gray-400 hover:text-amber-600 hover:bg-amber-50 h-8 w-8 rounded-lg"
                          title="Edit Tag"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget({ id: tag.id, name: tag.name })}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                          title="Delete Tag"
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
            <h3 className="text-lg font-bold text-gray-900">Delete Tag</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong className="text-gray-900">{deleteTarget.name}</strong>?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-medium" onClick={confirmDelete}>
                Delete Tag
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
