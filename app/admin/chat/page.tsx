"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

type Convo = { id: string; email: string | null; name: string | null; updatedAt: string };
type Msg = { id: string; senderRole: string; text: string; createdAt: string };

function nice(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminChatPage() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [active, setActive] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function loadConvos() {
    setError("");
    const r = await fetch("/api/chat/admin/conversations", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(j?.error || "Forbidden");
      return;
    }
    setConvos(j.conversations || []);
    if (!active && j.conversations?.[0]?.id) setActive(j.conversations[0].id);
  }

  async function loadMessages(conversationId: string) {
    if (!conversationId) return;
    const r = await fetch(`/api/chat/messages?conversationId=${conversationId}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (r.ok) setMessages(j.messages || []);
  }

  async function send() {
    const t = text.trim();
    if (!t || !active) return;
    setLoading(true);
    setText("");
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: active, text: t }),
    });
    await loadMessages(active);
    await loadConvos();
    setLoading(false);
  }

  useEffect(() => {
    loadConvos();
  }, []);

  useEffect(() => {
    if (active) loadMessages(active);
  }, [active]);

  return (
    <>
      <Nav />
      <div className="container mobile-shell pagePad" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: 0 }}>Admin Chat</h1>
              <div className="small muted" style={{ marginTop: 6 }}>
                Reply to members. Conversations update automatically when you send.
              </div>
            </div>
            <button className="btn" onClick={loadConvos}>
              Refresh
            </button>
          </div>

          {error ? <div className="errorBox" style={{ marginTop: 12 }}>{error}</div> : null}

          <div className="hr" />

          <div className="grid2">
            <div className="card" style={{ padding: 14, background: "rgba(255,255,255,.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 900 }}>Conversations</div>
                <span className="pill">{convos.length}</span>
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {convos.length ? (
                  convos.map((c) => (
                    <button
                      key={c.id}
                      className={"rowCard"}
                      style={{
                        cursor: "pointer",
                        textAlign: "left",
                        background: active === c.id ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.18)",
                      }}
                      onClick={() => setActive(c.id)}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.name || c.email || c.id.slice(0, 8)}
                        </div>
                        <div className="small muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.email || "—"}
                        </div>
                      </div>
                      <div className="small muted" style={{ whiteSpace: "nowrap" }}>
                        {nice(c.updatedAt)}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="small muted">No conversations yet.</div>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 14, background: "rgba(255,255,255,.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 900 }}>Messages</div>
                <span className="pill">{active ? "Active" : "Pick one"}</span>
              </div>

              <div
                style={{
                  marginTop: 12,
                  height: 420,
                  overflowY: "auto",
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,.10)",
                  background: "rgba(0,0,0,.18)",
                  padding: 14,
                }}
              >
                {messages.length ? (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        marginBottom: 10,
                        textAlign: m.senderRole === "ADMIN" ? "right" : "left",
                      }}
                    >
                      <div className="chatBubble">
                        <div className="chatMeta">{m.senderRole}</div>
                        <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="small muted">No messages yet.</div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <input
                  className="input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={active ? "Type a reply..." : "Select a conversation first"}
                  disabled={!active || loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <button className="btn btnPrimary" onClick={send} disabled={!active || loading}>
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>

              <div className="small muted" style={{ marginTop: 10 }}>
                Tip: member chat shows a red dot until they open the chat.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
