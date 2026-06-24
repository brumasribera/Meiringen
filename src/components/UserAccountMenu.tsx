"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "@/i18n/routing";
import { actionButtonClass } from "@/lib/button-styles";
import { getRelaxingGradient } from "@/lib/relaxing-gradient";

type UserAccountMenuProps = {
  user: User;
  isAdmin: boolean;
  labels: {
    account: string;
    admin: string;
    logout: string;
  };
  onLogout: () => void;
  className?: string;
};

function getAvatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const url = meta.avatar_url ?? meta.picture;
  return typeof url === "string" && url.length > 0 ? url : null;
}

function getInitials(user: User): string {
  const name = user.user_metadata?.full_name;
  if (typeof name === "string" && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return (user.email?.[0] ?? "?").toUpperCase();
}

export function UserAccountMenu({
  user,
  isAdmin,
  labels,
  onLogout,
  className = "",
}: UserAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const avatarUrl = getAvatarUrl(user);
  const initials = getInitials(user);
  const gradientStyle = getRelaxingGradient(user.id || user.email || initials);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full p-0.5 ring-1 ring-border transition hover:ring-[#111111]/30"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={labels.account}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={36}
            height={36}
            unoptimized={avatarUrl.startsWith("http")}
            referrerPolicy="no-referrer"
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ring-1 ring-white/45"
            style={gradientStyle}
          >
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          <Link
            href="/account/newsletter"
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[#F4C430]/20"
            onClick={() => setOpen(false)}
          >
            {labels.account}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              className="block px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[#F4C430]/20"
              onClick={() => setOpen(false)}
            >
              {labels.admin}
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            className={`mx-2 mb-2 block w-[calc(100%-1rem)] ${actionButtonClass} py-2 text-center text-sm`}
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            {labels.logout}
          </button>
        </div>
      )}
    </div>
  );
}
