"use client";

import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function MediaUploader({ value, onChange, label = "Media URL" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ text: data?.error || "Upload failed", ok: false });
      } else {
        onChange(data.url);
        setMsg({ text: data.warning ? `Uploaded (dev mode) ⚠️` : "Uploaded ✓", ok: !data.warning });
      }
    } catch (err: any) {
      setMsg({ text: err?.message || "Upload failed", ok: false });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label className="small muted">{label}</label>

      {/* External URL input */}
      <input
        className="input"
        placeholder="Paste URL (YouTube, Vimeo, Cloudinary, etc.)"
        value={value}
        onChange={e => onChange(e.target.value)}
      />

      <div className="dividerText">or upload a file</div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          className="btn btnSm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Choose file"}
        </button>
        <span className="small muted">Images up to 10MB</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/mp4,video/webm"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </div>

      {msg && (
        <div className={msg.ok ? "successBox" : "errorBox"} style={{ padding: "8px 12px" }}>
          <div className="small">{msg.text}</div>
        </div>
      )}

      {value && (
        <div className="notice" style={{ padding: "8px 12px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className="small muted">Preview:</span>
          {value.startsWith("data:image") || /\.(jpe?g|png|gif|webp)$/i.test(value)
            ? <img src={value} alt="preview" style={{ height: 48, borderRadius: 6, objectFit: "cover" }} />
            : <span className="small mono" style={{ wordBreak: "break-all", flex: 1 }}>{value.substring(0, 80)}{value.length > 80 ? "…" : ""}</span>
          }
        </div>
      )}
    </div>
  );
}
