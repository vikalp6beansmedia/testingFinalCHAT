"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = to / 60;
      const tick = () => {
        start = Math.min(start + step, to);
        setVal(Math.floor(start));
        if (start < to) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Creator card for featured section ────────────────────────────────────────
function CreatorCard({ name, category, avatar, gradient, slug }: {
  name: string; category: string; avatar: string; gradient: string; slug: string;
}) {
  return (
    <Link href={`/${slug}`} className="cfCreatorCard">
      <div className="cfCreatorAvatar" style={{ background: gradient }}>
        <span style={{ fontSize: 32 }}>{avatar}</span>
      </div>
      <div className="cfCreatorName">{name}</div>
      <div className="cfCreatorCat">{category}</div>
      <div className="cfCreatorJoin">View →</div>
    </Link>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────
function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="cfStep">
      <div className="cfStepNum">{n}</div>
      <div className="cfStepTitle">{title}</div>
      <div className="cfStepDesc">{desc}</div>
    </div>
  );
}

export default function LandingPage() {
  const [creatorUrl, setCreatorUrl] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Fetch creator's username to build link
    fetch("/api/profile").then(r => r.json()).then(d => {
      const slug = d?.profile?.username || "creator";
      setCreatorUrl(`/${slug}`);
    }).catch(() => setCreatorUrl("/creator"));

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="cfLanding">

      {/* ── Topbar ── */}
      <header className={`cfTopbar ${scrolled ? "cfTopbarScrolled" : ""}`}>
        <div className="cfTopbarInner">
          <Link href="/" className="cfBrand">
            <div className="cfBrandIcon">CF</div>
            <span className="cfBrandName">CreatorFarm</span>
          </Link>
          <nav className="cfTopNav">
            <Link href="/signin" className="cfTopLink">Log in</Link>
            <Link href="/signup" className="cfTopCTA">Get started</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="cfHero">
        {/* Animated mesh background */}
        <div className="cfHeroMesh">
          <div className="cfMeshOrb cfMeshOrb1" />
          <div className="cfMeshOrb cfMeshOrb2" />
          <div className="cfMeshOrb cfMeshOrb3" />
        </div>
        <div className="cfHeroNoise" />

        <div className="cfHeroContent">
          <div className="cfHeroBadge">🌾 Built for Indian creators</div>
          <h1 className="cfHeroTitle">
            Your audience.<br />
            <span className="cfHeroAccent">Your income.</span><br />
            Your terms.
          </h1>
          <p className="cfHeroSub">
            Launch your membership in minutes. Share exclusive content, chat directly with fans, and get paid — all in one place.
          </p>
          <div className="cfHeroCTAs">
            <Link href="/signup" className="cfHeroPrimary">
              Start for free →
            </Link>
            {creatorUrl && (
              <Link href={creatorUrl} className="cfHeroSecondary">
                Browse a creator
              </Link>
            )}
          </div>
          <p className="cfHeroNote">No credit card required · Takes 5 minutes · Razorpay payments</p>
        </div>

        {/* Floating preview card */}
        <div className="cfHeroCard">
          <div className="cfHeroCardBanner" />
          <div className="cfHeroCardBody">
            <div className="cfHeroCardAvatar">🎬</div>
            <div className="cfHeroCardName">Honey Kohli</div>
            <div className="cfHeroCardTag">Professional Print Model</div>
            <div className="cfHeroCardStats">
              <span>✦ Exclusive drops</span>
              <span>💬 Member chat</span>
            </div>
            <div className="cfHeroCardBtn">⭐ Become a member</div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="cfStats">
        <div className="cfStatsInner">
          {[
            { val: 500, suffix: "+", label: "Creators" },
            { val: 12000, suffix: "+", label: "Active fans" },
            { val: 98, suffix: "%", label: "Payout rate" },
            { val: 5, suffix: " min", label: "Setup time" },
          ].map(s => (
            <div key={s.label} className="cfStatItem">
              <div className="cfStatVal"><Counter to={s.val} suffix={s.suffix} /></div>
              <div className="cfStatLabel">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="cfSection">
        <div className="cfSectionInner">
          <div className="cfSectionLabel">How it works</div>
          <h2 className="cfSectionTitle">Live in three steps</h2>
          <div className="cfSteps">
            <Step n="01" title="Create your page" desc="Set your name, banner, and write a short tagline. Your page is live instantly." />
            <Step n="02" title="Publish content" desc="Upload videos, images, or written posts. Set them as free, Basic, or Pro." />
            <Step n="03" title="Get paid" desc="Fans subscribe via Razorpay. Money lands in your account every month." />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="cfSection cfSectionAlt">
        <div className="cfSectionInner">
          <div className="cfSectionLabel">Everything you need</div>
          <h2 className="cfSectionTitle">Built for creators who mean business</h2>
          <div className="cfFeatures">
            {[
              { icon: "🎬", title: "Video & image posts", desc: "Embed YouTube, Vimeo, Google Drive or upload directly. Locked content blurs with a preview." },
              { icon: "💬", title: "1:1 Member chat", desc: "Paying fans can message you directly. You reply from your admin dashboard." },
              { icon: "🔐", title: "Tiered access", desc: "Free, Basic, and Pro tiers. Each post can be set to a different access level." },
              { icon: "💸", title: "Razorpay built in", desc: "Indian payment rails. UPI, cards, net banking. Subscriptions handled automatically." },
              { icon: "📱", title: "Mobile first", desc: "Looks great on every phone. Install as a home screen app with zero downloads." },
              { icon: "🎨", title: "Your brand", desc: "Custom banner, avatar, tagline, and colour theme. Looks like your page, not ours." },
            ].map(f => (
              <div key={f.title} className="cfFeatureCard">
                <div className="cfFeatureIcon">{f.icon}</div>
                <div className="cfFeatureTitle">{f.title}</div>
                <div className="cfFeatureDesc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="cfSection">
        <div className="cfSectionInner" style={{ maxWidth: 640 }}>
          <div className="cfSectionLabel">Pricing</div>
          <h2 className="cfSectionTitle">Simple. Honest. Free to start.</h2>
          <div className="cfPricingCard">
            <div className="cfPricingTop">
              <div>
                <div className="cfPricingPlan">CreatorFarm</div>
                <div className="cfPricingPrice">₹0 <span className="cfPricingPer">to launch</span></div>
              </div>
              <div className="cfPricingBadge">Beta — free</div>
            </div>
            <div className="cfPricingDivider" />
            <div className="cfPricingFeatures">
              {[
                "Unlimited posts",
                "Unlimited fans",
                "Basic + Pro membership tiers",
                "Direct member chat",
                "Razorpay subscriptions",
                "Custom page URL",
                "Mobile-ready design",
                "Analytics dashboard (coming soon)",
              ].map(f => (
                <div key={f} className="cfPricingFeature">
                  <span className="cfPricingCheck">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/signup" className="cfPricingCTA">Create your page →</Link>
          </div>
          <p className="cfPricingNote">We take 0% during beta. Standard platform fee after launch will be announced with advance notice.</p>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="cfCTABanner">
        <div className="cfCTAMesh" />
        <div className="cfCTAContent">
          <h2 className="cfCTATitle">Ready to build your audience?</h2>
          <p className="cfCTASub">Join creators already earning on CreatorFarm.</p>
          <Link href="/signup" className="cfHeroPrimary" style={{ margin: "0 auto" }}>
            Start for free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="cfFooter">
        <div className="cfFooterInner">
          <div className="cfFooterBrand">
            <div className="cfBrandIcon" style={{ width: 32, height: 32, fontSize: 13 }}>CF</div>
            <span className="cfBrandName">CreatorFarm</span>
          </div>
          <div className="cfFooterLinks">
            <Link href="/terms" className="cfFooterLink">Terms</Link>
            <Link href="/privacy" className="cfFooterLink">Privacy</Link>
            <Link href="/signin" className="cfFooterLink">Sign in</Link>
            <Link href="/signup" className="cfFooterLink">Join</Link>
            {creatorUrl && <Link href={creatorUrl} className="cfFooterLink">Browse creator</Link>}
          </div>
          <div className="cfFooterCopy">© {new Date().getFullYear()} CreatorFarm. Made with ❤️ in India.</div>
        </div>
      </footer>
    </div>
  );
}
