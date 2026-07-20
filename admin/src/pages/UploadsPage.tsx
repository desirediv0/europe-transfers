import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { Copy, Check } from "lucide-react";

export default function UploadsPage() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Uploads</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload value={url} onChange={(u) => setUrl(u)} />
          {url && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input readOnly value={url} className="flex-1 rounded border bg-muted px-3 py-1 text-sm" />
                <Button size="sm" variant="outline" onClick={copyUrl}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
