import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { JobApplication, Pagination } from "@/lib/types";
import { RefreshCw, Eye, Trash2, FileText } from "lucide-react";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  PENDING: "warning",
  REVIEWED: "default",
  SHORTLISTED: "success",
  REJECTED: "destructive",
  HIRED: "success",
};

export default function JobApplicantsPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || "";

  const [items, setItems] = useState<JobApplication[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewApp, setViewApp] = useState<JobApplication | null>(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (jobId) params.set("jobId", jobId);
      if (statusFilter) params.set("status", statusFilter);
      const data = await api.get<{ items: JobApplication[]; pagination: Pagination }>(`/jobs/admin/applications?${params}`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load applicants"); } finally { setLoading(false); }
  }, [jobId, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/jobs/admin/applications/${id}`, { status });
      toast.success("Status updated");
      load(pagination.page);
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application? The uploaded CV will be permanently removed from storage.")) return;
    try {
      await api.del(`/jobs/admin/applications/${id}`);
      toast.success("Application deleted");
      setViewApp(null);
      load(pagination.page);
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Careers — Applicants</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {jobId ? "Showing applicants for the selected job" : "All job applications"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(pagination.page)} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVIEWED">Reviewed</SelectItem>
            <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="HIRED">Hired</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{pagination.total} applicants</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No applicants found</TableCell></TableRow>
              ) : (
                items.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell className="text-sm">{app.job?.title}</TableCell>
                    <TableCell>
                      <p className="text-sm">{app.email}</p>
                      <p className="text-xs text-muted-foreground">{app.phone}</p>
                    </TableCell>
                    <TableCell><Badge variant={statusColors[app.status] || "secondary"}>{app.status}</Badge></TableCell>
                    <TableCell className="text-xs">{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewApp(app)}><Eye className="h-4 w-4" /></Button>
                        <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="REVIEWED">Reviewed</SelectItem>
                            <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="HIRED">Hired</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <Button key={i} variant={pagination.page === i + 1 ? "default" : "outline"} size="sm" onClick={() => load(i + 1)}>{i + 1}</Button>
          ))}
        </div>
      )}

      <Dialog open={!!viewApp} onOpenChange={() => setViewApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Application — {viewApp?.name}</DialogTitle></DialogHeader>
          {viewApp && (
            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Job:</span> {viewApp.job?.title}</p>
                <p><span className="text-muted-foreground">Email:</span> {viewApp.email}</p>
                <p><span className="text-muted-foreground">Phone:</span> {viewApp.phone}</p>
                {viewApp.coverNote && <p><span className="text-muted-foreground">Cover Note:</span> {viewApp.coverNote}</p>}
              </div>
              <a
                href={viewApp.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                <FileText className="h-4 w-4" /> View / Download CV
              </a>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setViewApp(null)}>Close</Button>
                <Button variant="destructive" onClick={() => handleDelete(viewApp.id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Delete Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
