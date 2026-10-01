"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { IconUpload, IconCheck, IconLoader2, IconX, IconFileText } from "@tabler/icons-react";

type DocKey = "companyCert" | "vatCert" | "authId" | "addressProof";

const DOCS: Array<{ key: DocKey; label: string; hint: string; required: boolean; existing: "companyCertUrl" | "vatCertUrl" | "authIdUrl" | "addressProofUrl" }> = [
  { key: "companyCert", label: "Company Registration Certificate", hint: "Official certificate of incorporation / trade licence", required: true, existing: "companyCertUrl" },
  { key: "authId", label: "Authorized Person ID", hint: "Passport, national ID or driving licence of the person registering", required: true, existing: "authIdUrl" },
  { key: "vatCert", label: "VAT Certificate", hint: "Only if your company is VAT registered", required: false, existing: "vatCertUrl" },
  { key: "addressProof", label: "Proof of Business Address", hint: "Optional - utility bill, bank statement or lease agreement", required: false, existing: "addressProofUrl" },
];

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export function KycDocumentsForm({ onUploaded }: { onUploaded: () => void }) {
  const { user, uploadDocuments } = useAuth();
  const [files, setFiles] = useState<Partial<Record<DocKey, File>>>({});
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const inputs = useRef<Partial<Record<DocKey, HTMLInputElement | null>>>({});

  const pick = (key: DocKey, file?: File) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only PDF, JPG, PNG or WEBP files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Each file must be under 5MB.");
      return;
    }
    setFiles((f) => ({ ...f, [key]: file }));
  };

  const remove = (key: DocKey) => {
    setFiles((f) => {
      const next = { ...f };
      delete next[key];
      return next;
    });
    const input = inputs.current[key];
    if (input) input.value = "";
  };

  const missingRequired = DOCS.filter((d) => d.required && !files[d.key] && !user?.[d.existing]);

  const submit = async () => {
    if (submitting.current) return;
    if (missingRequired.length > 0) {
      toast.error(`Please upload: ${missingRequired.map((d) => d.label).join(", ")}`);
      return;
    }
    submitting.current = true;
    setLoading(true);
    try {
      const form = new FormData();
      for (const d of DOCS) {
        const f = files[d.key];
        if (f) form.append(d.key, f);
      }
      await uploadDocuments(form);
      toast.success("Documents uploaded! Verification completes within 12-24 hours.");
      onUploaded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Document upload failed");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {DOCS.map((d) => {
        const file = files[d.key];
        const alreadyOnFile = !file && !!user?.[d.existing];
        return (
          <div key={d.key} className="rounded-2xl border border-gray-200 p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black text-navy">
                  {d.label}{" "}
                  <span className={d.required ? "text-red-500" : "text-gray-400 font-semibold"}>{d.required ? "*" : "(optional)"}</span>
                </p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">{d.hint}</p>
                {file && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 truncate">
                    <IconFileText className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{file.name}</span>
                  </p>
                )}
                {alreadyOnFile && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-blue-700">
                    <IconCheck className="h-3.5 w-3.5" /> Already uploaded - choose a file only to replace it
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-start">
                <input
                  ref={(el) => { inputs.current[d.key] = el; }}
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => pick(d.key, e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => inputs.current[d.key]?.click()}
                  className="inline-flex items-center gap-1 rounded-lg border border-gold/50 bg-gold/10 px-2.5 py-1.5 text-[11px] font-black text-navy hover:bg-gold/20 cursor-pointer"
                >
                  <IconUpload className="h-3.5 w-3.5" /> {file ? "Change" : "Upload"}
                </button>
                {file && (
                  <button type="button" onClick={() => remove(d.key)} className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 cursor-pointer" aria-label="Remove file">
                    <IconX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-gray-400 font-medium">PDF, JPG, PNG or WEBP, up to 5MB each. Your documents are used only to verify your business.</p>

      <Button
        disabled={loading}
        onClick={submit}
        className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <IconLoader2 className="h-4 w-4 animate-spin" /> Uploading Documents...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <IconCheck className="h-4 w-4" /> Submit Documents for Verification
          </span>
        )}
      </Button>
    </div>
  );
}
