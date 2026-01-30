import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar/Sidebar";

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Track jobs, score fit, research companies, and send outreach."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
                  <div className="text-xs text-white/50">v0.1 • App Router • SQLite</div>
                </div>
                {children}
              </div>
              <div className="mt-3 text-center text-xs text-white/40">
                Built for job seekers • Keep your data private • Shareable deployment
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

