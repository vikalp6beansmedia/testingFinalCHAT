import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata = { title: "Terms of Service – CreatorFarm" };

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ maxWidth: 720, paddingTop: 24 }}>
        <div className="card" style={{ padding: 32 }}>
          <div className="small muted" style={{ marginBottom: 6 }}><Link href="/">← Back to home</Link></div>
          <h1 style={{ marginTop: 8, fontSize: 28 }}>Terms of Service</h1>
          <div className="small muted" style={{ marginBottom: 28 }}>Last updated: February 2026</div>

          {[
            ["1. Acceptance", "By creating an account or purchasing a membership on CreatorFarm, you agree to these Terms. You must be at least 18 years old to use this service."],
            ["2. Memberships & Payments", "CreatorFarm offers recurring subscription memberships (Basic and Pro) processed via Razorpay. By subscribing, you authorise us to charge your payment method on a recurring basis. Subscriptions auto-renew unless cancelled before the renewal date. All prices are in Indian Rupees (INR) inclusive of applicable taxes."],
            ["3. Cancellations & Refunds", "You may cancel your subscription at any time. Upon cancellation, access continues until the end of the current billing period. We do not offer pro-rated refunds for unused subscription time."],
            ["4. Content Access", "Membership grants a personal, non-transferable licence to access member-only content. You may not redistribute, re-sell, or share access credentials with others."],
            ["5. Prohibited Conduct", "You agree not to: share login credentials; bypass access controls; scrape content in bulk; harass other users or the creator; or use the platform for any unlawful purpose."],
            ["6. Intellectual Property", "All content remains the property of the creator. Nothing in these Terms transfers intellectual property rights to you."],
            ["7. Disclaimer", "The platform is provided \"as is\" without warranties. We do not guarantee uninterrupted access or error-free service."],
            ["8. Limitation of Liability", "To the maximum extent permitted by law, CreatorFarm shall not be liable for indirect, incidental, or consequential damages."],
            ["9. Changes", "We may update these Terms at any time. Material changes will be notified via email or platform notice. Continued use constitutes acceptance."],
            ["10. Contact", "For questions, contact us through the in-app support chat."],
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
          <Link href="/privacy" className="footerLink">Privacy Policy</Link>
          <Link href="/" className="footerLink">Home</Link>
        </div>
      </footer>
    </>
  );
}
