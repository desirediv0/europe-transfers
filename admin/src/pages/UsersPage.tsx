import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { User, Pagination } from "@/lib/types";
import { Eye, CheckCircle, XCircle } from "lucide-react";

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

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: User[]; pagination: Pagination }>(`/admin/users?page=${page}&limit=20`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load users"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const verifyDoc = async (id: string, status: "VERIFIED" | "REJECTED") => {
    try {
      await api.put(`/admin/users/${id}/verify`, { status });
      toast.success(`User ${status.toLowerCase()}`);
      load(pagination.page);
    } catch { toast.error("Failed to update"); }
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
                <TableHead className="w-40">Actions</TableHead>
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
                      {item.idDocumentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.isEmailVerified ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.idDocumentUrl && (
                        <Button variant="ghost" size="icon" onClick={() => setViewUser(item)}><Eye className="h-4 w-4" /></Button>
                      )}
                      {item.idDocumentStatus === "PENDING" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => verifyDoc(item.id, "VERIFIED")}><CheckCircle className="h-4 w-4 text-emerald-500" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => verifyDoc(item.id, "REJECTED")}><XCircle className="h-4 w-4 text-destructive" /></Button>
                        </>
                      )}
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

      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>ID Document — {viewUser?.name}</DialogTitle></DialogHeader>
          {viewUser?.idDocumentUrl && (
            <div className="flex justify-center">
              <img src={viewUser.idDocumentUrl} alt="ID Document" className="max-h-[60vh] rounded border" />
            </div>
          )}
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setViewUser(null)}>Close</Button>
            {viewUser?.idDocumentStatus === "PENDING" && (
              <>
                <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => { verifyDoc(viewUser.id, "VERIFIED"); setViewUser(null); }}>Verify</Button>
                <Button variant="destructive" onClick={() => { verifyDoc(viewUser.id, "REJECTED"); setViewUser(null); }}>Reject</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
