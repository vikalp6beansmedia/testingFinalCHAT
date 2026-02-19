import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: `File type not allowed. Allowed: ${Object.keys(ALLOWED_TYPES).join(", ")}` }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB). For videos, use an external URL (YouTube, Vimeo, etc.)" }, { status: 400 });
    }

    // --- Cloudinary upload (if configured) ---
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      const bytes = await file.arrayBuffer();
      const b64 = Buffer.from(bytes).toString("base64");
      const dataUri = `data:${file.type};base64,${b64}`;

      const fd = new FormData();
      fd.append("file", dataUri);
      fd.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default");
      fd.append("api_key", apiKey);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.secure_url) {
        console.error("Cloudinary error:", data);
        return NextResponse.json({ error: data?.error?.message || "Cloudinary upload failed" }, { status: 500 });
      }

      return NextResponse.json({ ok: true, url: data.secure_url });
    }

    // --- Local fallback (dev only, returns base64 data URL) ---
    // NOTE: This works locally but is NOT suitable for production on Vercel
    // because Vercel's filesystem is ephemeral. Add Cloudinary env vars for production.
    const bytes = await file.arrayBuffer();
    const b64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${b64}`;

    return NextResponse.json({
      ok: true,
      url: dataUrl,
      warning: "No Cloudinary configured – using base64 data URL (dev only, not for production)",
    });

  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}
