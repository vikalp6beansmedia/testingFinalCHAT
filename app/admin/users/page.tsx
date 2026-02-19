"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

type User = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  tier: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  _count?: { subscriptions: number };
};

function niceDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = { ADMIN: "#f43f5e", CREATOR: "#a855f7", USER: "#6c8eff" };
  return (
    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: `${colors[role] || "#666"}22`, color: colors[role] || "#aaa", border: `1px solid ${colors[role] || "#666"}44` }}>
      {role}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = { PRO: "#f97316", BASIC: "#22c55e", NONE: "#666" };
  return (
    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: `${colors[tier] || "#666"}22`, color: colors[tier] || "#888", border: `1px solid ${colors[tier] || "#666"}44` }}>
      {tier}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) { setError(data?.error || "Forbidden"); setLoading(false); return; }
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  async function toggleActive(userId: string, current: boolean) {
    setActionLoading(userId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg({ text: `User ${!current ? "activated" : "deactivated"} ✓`, ok: true });
      setUsers(u => u.map(x => x.id === userId ? { ...x, isActive: !current } : x));
    } else {
      setMsg({ text: data?.error || "Failed", ok: false });
    }
    setActionLoading(null);
  }

  async function changeRole(userId: string, newRole: string) {
    setActionLoading(userId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg({ text: `Role updated to ${newRole} ✓`, ok: true });
      setUsers(u => u.map(x => x.id === userId ? { ...x, role: newRole } : x));
    } else {
      setMsg({ text: data?.error || "Failed", ok: false });
    }
    setActionLoading(null);
  }

  async function deleteUser(userId: string, email: string | null) {
    if (!confirm(`Permanently delete ${email || userId}? This cannot be undone.`)) return;
    setActionLoading(userId);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      setMsg({ text: "User deleted ✓", ok: true });
      setUsers(u => u.filter(x => x.id !== userId));
    } else {
      setMsg({ text: "Delete failed", ok: false });
    }
    setActionLoading(null);
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.email || "").includes(search.toLowerCase()) || (u.name || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    paid: users.filter(u => u.tier !== "NONE").length,
    admins: users.filter(u => u.role === "ADMIN" || u.role === "CREATOR").length,
  };

  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ paddingTop: 24 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>User Management</h1>
            <div className="small muted" style={{ marginTop: 4 }}>Monitor, manage and control all platform users</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/posts" className="btn btnSm">← Posts</Link>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total users", val: stats.total, icon: "👥" },
            { label: "Active", val: stats.active, icon: "✅" },
            { label: "Paid members", val: stats.paid, icon: "💎" },
            { label: "Admins/Creators", val: stats.admins, icon: "🔑" },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 950, lineHeight: 1 }}>{s.val}</div>
              <div className="small muted" style={{ marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <input
            className="input"
            placeholder="Search by email or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select className="input" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ width: "auto" }}>
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CREATOR">Creator</option>
            <option value="USER">User</option>
          </select>
          <button className="btn btnSm" onClick={loadUsers}>↺ Refresh</button>
        </div>

        {msg && (
          <div className={msg.ok ? "successBox" : "errorBox"} style={{ padding: "8px 14px", marginBottom: 12 }}>
            <div className="small">{msg.text}</div>
          </div>
        )}

        {error && <div className="errorBox" style={{ padding: 16, marginBottom: 12 }}>{error}</div>}

        {/* Users table */}
        {loading ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div className="small muted">Loading users…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div className="small muted">No users found</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {filtered.map(user => (
              <div
                key={user.id}
                className="card"
                style={{
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                  opacity: user.isActive ? 1 : 0.55,
                  borderColor: !user.isActive ? "rgba(255,80,80,.2)" : undefined,
                }}
              >
                {/* Avatar */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,rgba(108,142,255,.4),rgba(60,80,200,.3))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name || <span className="muted">No name</span>}</div>
                  <div className="small muted" style={{ marginTop: 2 }}>{user.email || "No email"}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                    <RoleBadge role={user.role} />
                    <TierBadge tier={user.tier} />
                    {!user.isActive && <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "rgba(255,80,80,.15)", color: "#ff6060", border: "1px solid rgba(255,80,80,.3)" }}>DEACTIVATED</span>}
                  </div>
                </div>

                {/* Dates */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="small muted">Joined {niceDate(user.createdAt)}</div>
                  <div className="small muted">Last seen {niceDate(user.lastLoginAt)}</div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                  {/* Role selector */}
                  <select
                    className="input"
                    style={{ padding: "4px 8px", fontSize: 12, height: 30, width: "auto" }}
                    value={user.role}
                    onChange={e => changeRole(user.id, e.target.value)}
                    disabled={actionLoading === user.id}
                  >
                    <option value="USER">User</option>
                    <option value="CREATOR">Creator</option>
                    <option value="ADMIN">Admin</option>
                  </select>

                  <button
                    className={`btn btnSm ${user.isActive ? "" : "btnPrimary"}`}
                    onClick={() => toggleActive(user.id, user.isActive)}
                    disabled={actionLoading === user.id}
                    style={{ minWidth: 90 }}
                  >
                    {actionLoading === user.id ? "…" : user.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    className="btn btnSm btnDanger"
                    onClick={() => deleteUser(user.id, user.email)}
                    disabled={actionLoading === user.id}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
