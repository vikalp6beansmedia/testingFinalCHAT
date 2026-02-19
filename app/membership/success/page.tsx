import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata = { title: "Payment Successful – CreatorFarm" };

export default function SuccessPage() {
  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ paddingTop: 40, maxWidth: 520 }}>
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h1 style={{ marginTop: 0, fontSize: 26 }}>You're in!</h1>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            Your payment was successful. Your membership is now active — it may take a minute to reflect on your account.
          </p>
          <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
            <Link href="/" className="btn btnPrimary full">Browse exclusive posts</Link>
            <Link href="/membership/chat" className="btn full">Open member chat</Link>
          </div>
          <div className="small muted" style={{ marginTop: 20 }}>
            Didn't get access? Refresh the page or <Link href="/membership/chat"><b>contact support</b></Link>.
          </div>
        </div>
      </main>
    </>
  );
}
