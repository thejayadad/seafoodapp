// src/app/_components/auth/AuthButton.tsx
"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

type Props = {
  mode: "signin" | "signout";
  className?: string;
};

function UserOutlineIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function AuthButton({ mode, className }: Props) {
  const { pending } = useFormStatus();

  const base =
    "inline-flex items-center gap-2 rounded-btn px-3 py-2 text-sm transition";
  const linky =
    "hover:bg-neutral-100 border border-transparent hover:border-neutral-200";
  const disabled = pending ? "pointer-events-none opacity-80" : "";
  const styles = `${base} ${linky} ${disabled} ${className ?? ""}`;

  if (mode === "signin") {
    return (
      <button type="submit" className={styles} aria-disabled={pending}>
        {pending ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <UserOutlineIcon />
        )}
        <span>{pending ? "Signing in…" : "Log In or Sign Up"}</span>
      </button>
    );
  }

  return (
    <button type="submit" className={styles} aria-disabled={pending}>
      {pending ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <UserOutlineIcon />
      )}
      <span>{pending ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
