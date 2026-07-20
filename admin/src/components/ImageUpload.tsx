import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconUpload, IconX, IconPhoto, IconTrash, IconRefresh, IconLink } from "@tabler/icons-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Cover Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setUploading(true);
    try {
      const data = await api.upload<{ url: string }>("/upload", file);
      onChange(data.url);
      setUrlValue(data.url);
      toast.success("Image uploaded to R2");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }, [upload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }, [upload]);

  const handleUrlApply = () => {
    onChange(urlValue);
    setShowUrlInput(false);
  };

  const handleRemove = () => {
    onChange("");
    setUrlValue("");
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative group rounded-xl border border-border/50 overflow-hidden bg-muted/30">
          <img src={value} alt="Uploaded preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="gap-1.5"
            >
              <IconRefresh className="h-4 w-4" /> Replace
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="gap-1.5"
            >
              <IconTrash className="h-4 w-4" /> Remove
            </Button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-white/30 border-t-white" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-xs text-white/90 bg-black/50 backdrop-blur-sm rounded-md px-2 py-1 truncate">
              {value}
            </p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            dragActive ? "border-gold bg-gold/5" : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted-foreground/30 border-t-gold" />
              <span className="text-sm font-medium">Uploading to R2...</span>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 mb-3">
                <IconUpload className="h-6 w-6 text-gold" />
              </div>
              <p className="text-sm font-medium text-foreground">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />

      {/* URL Fallback */}
      <div className="flex items-center gap-2">
        {!showUrlInput ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUrlInput(true)}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <IconLink className="h-4 w-4" /> Or paste image URL
          </Button>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <Input
              placeholder="https://..."
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              className="flex-1"
            />
            <Button type="button" size="sm" onClick={handleUrlApply}>Apply</Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => setShowUrlInput(false)}>
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ImageThumbnail({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-md ${className}`}>
        <IconPhoto className="h-5 w-5 text-muted-foreground/50" />
      </div>
    );
  }
  return <img src={src} alt={alt || "Image"} className={`object-cover rounded-md ${className}`} />;
}
