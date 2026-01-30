import Link from "next/link";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/network", label: "Network" },
  { href: "/outreach", label: "Outreach" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" }
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-shrink-0 md:block">
      <div className="glass sticky top-4 rounded-2xl p-4 outline-soft">
        <div className="mb-3">
          <div className="text-xs font-medium text-white/50">Job Tracker</div>
          <div className="text-base font-semibold">Headhunter console</div>
          <div className="text-muted mt-1 text-xs">
            Import • Score • Apply • Follow up
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white ring-1 ring-transparent hover:ring-white/10 transition",
                item.href === "/" ? "font-medium" : ""
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/10">
          <div className="text-xs font-semibold">Pro tip</div>
          <div className="text-muted mt-1 text-xs">
            Keep 3 versions of outreach: warm, neutral, and direct. This app will generate all three.
          </div>
        </div>
      </div>
    </aside>
  );
}

