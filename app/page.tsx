"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

  return (
    <div className="mx-auto w-full max-w-[420px] px-4 pt-4 pb-24">

      <div className="rounded-[24px] border border-white/10 bg-white/5 overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,.55)]">

        {/* Banner */}
        <div className="relative h-[140px] bg-white/10">
          {profile?.bannerUrl ? (
            <img
              src={profile.bannerUrl}
              className="h-full w-full object-cover"
              alt="banner"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-white/10 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>

        {/* Body */}
        <div className="px-4 pb-4">

          {/* Avatar */}
          <div className="-mt-9 flex items-end gap-3">
            <div className="h-[72px] w-[72px] rounded-[18px] border-[3px] border-black/40 overflow-hidden bg-white/10">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  className="h-full w-full object-cover"
                  alt="avatar"
                />
              ) : null}
            </div>

            <div className="pb-1">
              <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[12px] text-white/80">
                Tier: Basic
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="mt-3">
            <div className="text-[24px] font-semibold text-white leading-tight">
              {profile?.displayName || "Preet Kohli Uncensored"}
            </div>
            <div className="mt-1 text-[14px] text-white/75 leading-snug max-w-[34ch]">
              {profile?.tagline || "Exclusive drops • behind-the-scenes • member-only chat"}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-3 flex gap-2">
            {["Posts", "About", "Perks"].map((tab) => (
              <button
                key={tab}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] text-white/80"
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Members Chip */}
          <div className="mt-3">
            <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[12px] text-white/75 inline-block">
              120+ paid members
            </div>
          </div>

          {/* CTA Row */}
          <div className="mt-4 flex gap-3">
            <button className="h-[44px] flex-1 rounded-full bg-white text-black text-[14px] font-semibold">
              Unlock access
            </button>

            <button className="h-[44px] flex-1 rounded-full border border-white/15 bg-white/5 text-white text-[14px] font-semibold">
              Membership
            </button>
          </div>

          <div className="mt-2 text-[12px] text-white/55">
            Subscribe to Basic / Pro to unlock posts + chat.
          </div>

        </div>
      </div>
    </div>
  );
}
