import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#040612", color: "#e7eaff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <div style={{ fontSize: 72, marginBottom: 8 }}>404</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 10px" }}>Page not found</h1>
          <p style={{ color: "rgba(255,255,255,.6)", marginBottom: 24 }}>This page doesn't exist or was moved.</p>
          <Link href="/" style={{ display: "inline-block", padding: "12px 24px", background: "#fff", color: "#0b0f1d", borderRadius: 999, fontWeight: 700, textDecoration: "none" }}>
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
