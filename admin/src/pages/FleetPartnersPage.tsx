import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { FleetPartnerApplication, Pagination } from "@/lib/types";
import { RefreshCw, Eye, Trash2, Car } from "lucide-react";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  SUBMITTED: "warning",
  REVIEWED: "default",
  APPROVED: "success",
  REJECTED: "destructive",
};

export default function FleetPartnersPage() {
  const [items, setItems] = useState<FleetPartnerApplication[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewApp, setViewApp] = useState<FleetPartnerApplication | null>(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const data = await api.get<{ items: FleetPartnerApplication[]; pagination: Pagination }>(`/fleet-partners/admin/all?${params}`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load applications"); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/fleet-partners/admin/${id}/status`, { status });
      toast.success("Status updated");
      load(pagination.page);
      if (viewApp?.id === id) setViewApp((prev) => (prev ? { ...prev, status } : prev));
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application? All uploaded vehicle images will be permanently removed from storage.")) return;
    try {
      await api.del(`/fleet-partners/admin/${id}`);
      toast.success("Application deleted");
      setViewApp(null);
      load(pagination.page);
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drive & Fleet Partners</h1>
          <p className="text-sm text-muted-foreground mt-1">Applications submitted via theeuropetransfers.com/fleet-partners</p>
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
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="REVIEWED">Reviewed</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{pagination.total} applications</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No applications found</TableCell></TableRow>
              ) : (
                items.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                      <p className="text-xs text-muted-foreground">{app.phone}</p>
                    </TableCell>
                    <TableCell className="text-sm">{app.city}, {app.country}</TableCell>
                    <TableCell className="text-sm">{app.vehicleType}</TableCell>
                    <TableCell className="text-sm">{app.images.length}</TableCell>
                    <TableCell><Badge variant={statusColors[app.status] || "secondary"}>{app.status}</Badge></TableCell>
                    <TableCell className="text-xs">{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewApp(app)}><Eye className="h-4 w-4" /></Button>
                        <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUBMITTED">Submitted</SelectItem>
                            <SelectItem value="REVIEWED">Reviewed</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Car className="h-5 w-5" /> {viewApp?.name}</DialogTitle></DialogHeader>
          {viewApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <p><span className="text-muted-foreground">Email:</span> {viewApp.email}</p>
                <p><span className="text-muted-foreground">Phone:</span> {viewApp.phone}</p>
                <p><span className="text-muted-foreground">Country:</span> {viewApp.country}</p>
                <p><span className="text-muted-foreground">City:</span> {viewApp.city}</p>
                <p><span className="text-muted-foreground">Vehicle Type:</span> {viewApp.vehicleType}</p>
                <p><span className="text-muted-foreground">Submitted:</span> {new Date(viewApp.createdAt).toLocaleString()}</p>
              </div>
              {viewApp.vehicleDetails && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vehicle Details</p>
                  <p className="text-sm bg-muted rounded-lg p-3">{viewApp.vehicleDetails}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Vehicle Photos ({viewApp.images.length})</p>
                {viewApp.images.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No photos uploaded</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {viewApp.images.map((img) => (
                      <a key={img.key} href={img.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border">
                        <img src={img.url} alt="Vehicle" className="w-full h-24 object-cover hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
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
