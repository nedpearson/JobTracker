"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";

function isAuthRoute(pathname: string) {
  return pathname === "/signin" || pathname === "/signup";
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const auth = isAuthRoute(pathname);

  if (auth) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10">
          <main className="mx-auto w-full max-w-md">
            <div className="mb-6 text-center">
              <Link href="/" className="inline-block">
                <div className="text-xs font-medium text-white/50">Job Tracker</div>
                <div className="text-2xl font-semibold tracking-tight">Your personal headhunter</div>
              </Link>
              <div className="mt-2 text-sm text-white/60">
                Track jobs, score fit, and follow up with confidence.
              </div>
            </div>
            {children}
            <div className="mt-6 text-center text-xs text-white/40">
              Built for job seekers • Keep your data private • Shareable deployment
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-4 px-4 py-4">
        <Sidebar />
        <main className="flex-1">
          <div className="glass rounded-2xl p-5 outline-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white/50">Job Tracker</div>
                <div className="text-lg font-semibold">Your personal headhunter</div>
              </div>
              <div className="text-xs text-white/50">v0.1 • App Router • Postgres</div>
            </div>
            {children}
          </div>
          <div className="mt-3 text-center text-xs text-white/40">
            Built for job seekers • Keep your data private • Shareable deployment
          </div>
        </main>
      </div>
    </div>
  );
}

