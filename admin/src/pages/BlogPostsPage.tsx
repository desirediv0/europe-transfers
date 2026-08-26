import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import env from "@/config/env.config";
import type { BlogPost, Pagination } from "@/lib/types";
import { Plus, Eye, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function BlogPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async (page = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const data = await api.get<{ items: BlogPost[]; pagination: Pagination }>(
        `/blog/posts?page=${page}&limit=20&search=${encodeURIComponent(searchQuery)}`
      );
      setPosts(data?.items || (Array.isArray(data) ? data : []));
      if (data?.pagination) setPagination(data.pagination);
    } catch {
      toast.error("Failed to load blog posts");
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
      await api.del(`/blog/posts/${deleteTarget.id}`);
      toast.success("Blog post deleted successfully");
      setDeleteTarget(null);
      load(pagination.page, search);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete blog post");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your blog posts.</p>
        </div>
        <Button
          onClick={() => navigate("/blog/posts/new")}
          className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Post
        </Button>
      </div>

      <div className="flex items-center space-x-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search post title..."
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
                  CATEGORY
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                  STATUS
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                  PUBLISHED DATE
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-right pr-6">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-5 w-56 mb-1" /><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="pr-6 text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    No blog posts found. Click "Create New Post" to add one.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
                    <TableCell className="py-4 pl-6">
                      <div className="font-semibold text-gray-900">{post.title}</div>
                      <a
                        href={`${env.CLIENT_URL}/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#1B2A4A] hover:underline font-medium mt-0.5 block"
                      >
                        /blog/{post.slug}
                      </a>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 uppercase tracking-wider">
                        {post.category?.name || "UNCATEGORIZED"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          post.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {post.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-xs font-medium text-gray-600">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`${env.CLIENT_URL}/blog/${post.slug}`, "_blank")}
                          className="text-gray-400 hover:text-[#1B2A4A] hover:bg-slate-100 h-8 w-8 rounded-lg"
                          title="Preview Post"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/blog/posts/edit/${post.id}`)}
                          className="text-gray-400 hover:text-amber-600 hover:bg-amber-50 h-8 w-8 rounded-lg"
                          title="Edit Post"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget({ id: post.id, name: post.title })}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                          title="Delete Post"
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-4 border-t border-gray-100 bg-gray-50/30">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => load(pagination.page - 1, search)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(pagination.pages, 10) }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => load(pageNum, search)}
                    className={`h-8 w-8 p-0 text-xs rounded-full ${
                      pagination.page === pageNum ? "bg-[#1B2A4A] text-white font-bold" : "text-gray-600"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => load(pagination.page + 1, search)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-gray-900">Delete Blog Post</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong className="text-gray-900">{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-medium" onClick={confirmDelete}>
                Delete Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
