import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata = { title: "Privacy Policy – CreatorFarm" };

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ maxWidth: 720, paddingTop: 24 }}>
        <div className="card" style={{ padding: 32 }}>
          <div className="small muted" style={{ marginBottom: 6 }}><Link href="/">← Back to home</Link></div>
          <h1 style={{ marginTop: 8, fontSize: 28 }}>Privacy Policy</h1>
          <div className="small muted" style={{ marginBottom: 28 }}>Last updated: February 2026</div>

          {[
            ["1. What We Collect", "When you sign up, we collect your name, email, and hashed password. Google sign-in shares your name and email. Payments are processed by Razorpay — we store your subscription tier and status, but never your card details. Chat messages are stored so you and the creator can review history."],
            ["2. How We Use It", "We use your information to provide your membership, process payments, send transactional emails (magic links, password resets), and respond to support messages. We do not sell your data to third parties."],
            ["3. Data Retention", "We retain account data while your account is active. Request deletion via in-app chat and we'll remove your data within 30 days, except where legally required to retain it."],
            ["4. Cookies & Storage", "NextAuth uses secure HTTP-only cookies to maintain your session. We use browser localStorage only to track chat notification state."],
            ["5. Third-Party Services", "Razorpay (payments), Google (optional OAuth), and your configured SMTP provider (emails) may process your data. Each has their own privacy policy."],
            ["6. Security", "Passwords are hashed with bcrypt. All traffic uses HTTPS. However, no system is completely secure."],
            ["7. Your Rights", "You may access, correct, or delete your personal data by contacting us through the in-app chat."],
            ["8. Children", "CreatorFarm is not intended for users under 18. We do not knowingly collect data from minors."],
            ["9. Changes", "We may update this policy. Material changes will be notified via email or platform notice."],
            ["10. Contact", "For privacy inquiries, use the in-app chat support."],
          ].map(([heading, body]) => (
            <section key={heading} style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{heading}</h2>
              <p className="small muted" style={{ lineHeight: 1.7, margin: 0 }}>{body}</p>
            </section>
          ))}
        </div>
      </main>
      <footer className="siteFooter">
        <span className="small muted">© {new Date().getFullYear()} CreatorFarm</span>
        <div className="footerLinks">
          <Link href="/terms" className="footerLink">Terms of Service</Link>
          <Link href="/" className="footerLink">Home</Link>
        </div>
      </footer>
    </>
  );
}
