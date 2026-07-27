import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { User, Pagination } from "@/lib/types";
import { Eye, CheckCircle, XCircle, Clock, Trash2, Download } from "lucide-react";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "destructive",
};

export default function UsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogUser, setRejectDialogUser] = useState<User | null>(null);
  const [deleteDialogUser, setDeleteDialogUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: User[]; pagination: Pagination }>(`/admin/users?page=${page}&limit=20`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load users"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const verifyDoc = async (id: string, status: "VERIFIED" | "REJECTED", reason?: string) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${id}/verify`, { status, reason });
      toast.success(`User ${status.toLowerCase()}`);
      load(pagination.page);
    } catch { toast.error("Failed to update"); } finally { setActionLoading(false); }
  };

  const deleteUser = async (id: string) => {
    setActionLoading(true);
    try {
      await api.del(`/admin/users/${id}`);
      toast.success("User deleted successfully");
      setDeleteDialogUser(null);
      load(pagination.page);
    } catch { toast.error("Failed to delete user"); } finally { setActionLoading(false); }
  };

  const handleReject = () => {
    if (!rejectDialogUser) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    verifyDoc(rejectDialogUser.id, "REJECTED", rejectReason.trim());
    setRejectDialogUser(null);
    setRejectReason("");
  };

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>ID Document</TableHead>
                <TableHead>Email Verified</TableHead>
                <TableHead className="w-48">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
              )) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[item.idDocumentStatus] || "default"}>
                      {item.idDocumentStatus === "PENDING" && <Clock className="mr-1 h-3 w-3" />}
                      {item.idDocumentStatus}
                    </Badge>
                    {item.idDocumentStatus === "REJECTED" && item.rejectionReason && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={item.rejectionReason}>
                        {item.rejectionReason}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{item.isEmailVerified ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.idDocumentUrl && (
                        <Button variant="ghost" size="icon" onClick={() => setViewUser(item)}><Eye className="h-4 w-4" /></Button>
                      )}
                      {item.idDocumentStatus === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => verifyDoc(item.id, "VERIFIED")}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setRejectDialogUser(item); setRejectReason(""); }}
                            disabled={actionLoading}
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialogUser(item)}
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* View ID Document Dialog */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>ID Document — {viewUser?.name}</DialogTitle></DialogHeader>
          {viewUser?.idDocumentUrl ? (
            <div className="flex justify-center bg-gray-100 rounded-lg p-4">
              <img
                src={viewUser.idDocumentUrl}
                alt="ID Document"
                className="max-h-[50vh] w-auto rounded shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div className="hidden flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">Image could not be loaded</p>
                <a
                  href={viewUser.idDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-blue-500 underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No document uploaded</div>
          )}
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setViewUser(null)}>Close</Button>
            {viewUser?.idDocumentUrl && (
              <Button
                variant="outline"
                onClick={() => downloadFile(viewUser.idDocumentUrl!, `id-${viewUser.name}.png`)}
              >
                <Download className="mr-1 h-4 w-4" /> Download
              </Button>
            )}
            {viewUser?.idDocumentStatus === "PENDING" && (
              <>
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => { verifyDoc(viewUser.id, "VERIFIED"); setViewUser(null); }}
                  disabled={actionLoading}
                >
                  Verify
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => { setRejectDialogUser(viewUser); setViewUser(null); setRejectReason(""); }}
                  disabled={actionLoading}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject with Reason Dialog */}
      <Dialog open={!!rejectDialogUser} onOpenChange={() => { setRejectDialogUser(null); setRejectReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject ID — {rejectDialogUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this ID document. The user will receive this reason via email.
            </p>
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Rejection Reason *</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Image is blurry, ID is expired, document type not accepted..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRejectDialogUser(null); setRejectReason(""); }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
              >
                {actionLoading ? "Rejecting..." : "Reject ID"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deleteDialogUser} onOpenChange={() => setDeleteDialogUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteDialogUser && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm">
                  <p className="font-semibold text-red-800">{deleteDialogUser.name}</p>
                  <p className="text-red-600">{deleteDialogUser.email}</p>
                  <p className="text-red-600">{deleteDialogUser.phone}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This will permanently delete the user account, their ID document, and all related data.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteDialogUser(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteUser(deleteDialogUser.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Deleting..." : "Delete User"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
