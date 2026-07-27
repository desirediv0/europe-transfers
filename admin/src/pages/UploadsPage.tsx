import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  FolderOpen,
  File,
  Upload,
  Download,
  Trash2,
  ArrowLeft,
  Home,
  FolderPlus,
  Image,
  X,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface R2File {
  name: string;
  type: "file";
  key: string;
  size: number;
  lastModified: string;
  url: string;
}

interface R2Folder {
  name: string;
  type: "folder";
  path: string;
}

interface R2ListResponse {
  folders: R2Folder[];
  files: R2File[];
  prefix: string;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
    return <Image className="h-5 w-5 text-blue-500" />;
  }
  return <File className="h-5 w-5 text-muted-foreground" />;
}

export default function UploadsPage() {
  const [data, setData] = useState<R2ListResponse>({ folders: [], files: [], prefix: "" });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [previewFile, setPreviewFile] = useState<R2File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<R2File | R2Folder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async (prefix = "") => {
    setLoading(true);
    try {
      const result = await api.get<R2ListResponse>(`/upload?prefix=${encodeURIComponent(prefix)}`);
      setData(result);
    } catch {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", currentPath || "uploads");
      await api.post("/upload", form);
      toast.success("File uploaded successfully");
      loadFiles(currentPath);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }
    setActionLoading(true);
    try {
      await api.post("/upload/folder", { name: newFolderName.trim(), parent: currentPath });
      toast.success("Folder created");
      setShowNewFolder(false);
      setNewFolderName("");
      loadFiles(currentPath);
    } catch {
      toast.error("Failed to create folder");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      if (deleteConfirm.type === "file") {
        await api.del("/upload", { key: deleteConfirm.key });
      } else {
        // Delete folder and all contents
        const result = await api.get<R2ListResponse>(`/upload?prefix=${encodeURIComponent(deleteConfirm.path)}`);
        for (const file of result.files) {
          await api.del("/upload", { key: file.key });
        }
        await api.del("/upload", { key: deleteConfirm.path });
      }
      toast.success("Deleted successfully");
      setDeleteConfirm(null);
      loadFiles(currentPath);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };

  const navigateUp = () => {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length ? parts.join("/") + "/" : "");
  };

  const breadcrumbs = currentPath.split("/").filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">File Manager</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewFolder(true)}>
            <FolderPlus className="mr-1 h-4 w-4" /> New Folder
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-1 h-4 w-4" />
            )}
            Upload File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={() => navigateToFolder("")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <Home className="h-4 w-4" /> Root
        </button>
        {breadcrumbs.map((part, i) => {
          const path = breadcrumbs.slice(0, i + 1).join("/") + "/";
          return (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <button
                onClick={() => navigateToFolder(path)}
                className="text-muted-foreground hover:text-foreground"
              >
                {part}
              </button>
            </span>
          );
        })}
      </div>

      {/* Back button */}
      {currentPath && (
        <Button variant="ghost" size="sm" onClick={navigateUp}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      )}

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data.folders.length === 0 && data.files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">No files or folders</p>
              <p className="text-sm">Upload files or create a new folder</p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Folders */}
              {data.folders.map((folder) => (
                <div key={folder.path} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50">
                  <button
                    onClick={() => navigateToFolder(folder.path)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <FolderOpen className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">{folder.name}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirm(folder)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {/* Files */}
              {data.files.map((file) => (
                <div key={file.key} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.name)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(file.size)} · {new Date(file.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <Button variant="ghost" size="icon" onClick={() => setPreviewFile(file)}>
                        <Image className="h-4 w-4 text-blue-500" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(file.url, file.name)}>
                      <Download className="h-4 w-4 text-emerald-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(file)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolder} onOpenChange={() => { setShowNewFolder(false); setNewFolderName(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., images, documents"
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={actionLoading}>
                {actionLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {deleteConfirm?.type === "folder" ? "Folder" : "File"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {deleteConfirm?.type === "folder"
                ? `Are you sure you want to delete "${deleteConfirm.name}" and all its contents?`
                : `Are you sure you want to delete "${deleteConfirm?.name}"?`}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="space-y-4">
              <div className="flex justify-center bg-gray-100 rounded-lg p-4">
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-h-[60vh] w-auto rounded shadow-lg"
                />
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setPreviewFile(null)}>Close</Button>
                <Button onClick={() => handleDownload(previewFile.url, previewFile.name)}>
                  <Download className="mr-1 h-4 w-4" /> Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
