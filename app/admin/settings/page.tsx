"use client";

import { useEffect, useState } from "react";
import Nav from "@/app/components/Nav";

type Settings = {
  basicPrice: number;
  proPrice: number;
  currency: string;
  razorpayBasicPlanId: string | null;
  razorpayProPlanId: string | null;
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState<Settings>({
    basicPrice: 999,
    proPrice: 1999,
    currency: "INR",
    razorpayBasicPlanId: "",
    razorpayProPlanId: ""
  });

  async function load() {
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/admin/settings");
    const data = await res.json();

    if (!res.ok) {
      setMsg(data?.error || "Failed to load settings (are you signed in as admin?)");
      setLoading(false);
      return;
    }

    setForm({
      basicPrice: data.basicPrice ?? 999,
      proPrice: data.proPrice ?? 1999,
      currency: data.currency ?? "INR",
      razorpayBasicPlanId: data.razorpayBasicPlanId ?? "",
      razorpayProPlanId: data.razorpayProPlanId ?? ""
    });

    setLoading(false);
  }

  async function save() {
    setSaving(true);
    setMsg("");

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        basicPrice: form.basicPrice,
        proPrice: form.proPrice,
        currency: form.currency,
        razorpayBasicPlanId: form.razorpayBasicPlanId,
        razorpayProPlanId: form.razorpayProPlanId
      })
    });

    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Save failed");
      setSaving(false);
      return;
    }

    setMsg("Saved ✅");
    setSaving(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <Nav />
      <div className="container">
        <div className="card" style={{padding:24}}>
          <h1 style={{marginTop:0}}>Membership Pricing</h1>
          <p className="muted">Phase 6 uses these plan IDs for Razorpay subscriptions.</p>

          {loading ? (
            <div className="muted" style={{padding:14, border:"1px solid rgba(255,255,255,.10)", borderRadius:14, background:"rgba(0,0,0,.25)"}}>
              Loading...
            </div>
          ) : (
            <div style={{display:"grid", gap:12}}>
              <Row label="Basic / month" value={String(form.basicPrice)} onChange={(v)=>setForm(s=>({...s, basicPrice:Number(v||0)}))} />
              <Row label="Pro / month" value={String(form.proPrice)} onChange={(v)=>setForm(s=>({...s, proPrice:Number(v||0)}))} />
              <Row label="Currency" value={form.currency} onChange={(v)=>setForm(s=>({...s, currency:v.toUpperCase()}))} />
              <Row label="Razorpay BASIC plan_id" value={form.razorpayBasicPlanId ?? ""} onChange={(v)=>setForm(s=>({...s, razorpayBasicPlanId:v}))} />
              <Row label="Razorpay PRO plan_id" value={form.razorpayProPlanId ?? ""} onChange={(v)=>setForm(s=>({...s, razorpayProPlanId:v}))} />

              <button className={"btn btnPrimary"} onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>

              {msg ? <div className="muted">{msg}</div> : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="row">
      <input className="input" value={value} onChange={(e)=>onChange(e.target.value)} />
      <div className="pill" style={{textAlign:"right"}}>{label}</div>
    </div>
  );
}
