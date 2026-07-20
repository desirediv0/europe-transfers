import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Upload, X, Image } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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
      toast.success("Image uploaded");
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

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group rounded-lg border overflow-hidden">
          <img src={value} alt="Uploaded" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 text-sm bg-white rounded-md font-medium hover:bg-gray-100"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 bg-white rounded-md hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            dragActive ? "border-[#1B2A4A] bg-[#1B2A4A]/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          {uploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-[#1B2A4A]" />
          ) : (
            <>
              <Image className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WEBP up to 5MB</p>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
}
