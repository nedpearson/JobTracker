import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Welcome back</h1>
              <Badge>Agency mode</Badge>
            </div>
            <p className="text-muted mt-1 text-sm">
              Track opportunities, research companies, and send outreach that sounds human.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/jobs">Find jobs</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/profile">Update profile</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/outreach">Write outreach</Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="What you can do now" description="Core workflow: import → score → apply → follow up.">
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <span className="font-medium">Import jobs</span>{" "}
              <span className="text-muted">(public APIs + paste-a-link parser)</span>
            </li>
            <li>
              <span className="font-medium">Score your match</span>{" "}
              <span className="text-muted">(skills coverage + AI deep dive optional)</span>
            </li>
            <li>
              <span className="font-medium">Research company</span>{" "}
              <span className="text-muted">(what they do + how you help)</span>
            </li>
            <li>
              <span className="font-medium">Send Gmail outreach</span>{" "}
              <span className="text-muted">(Google OAuth + templates)</span>
            </li>
          </ul>
        </Card>

        <Card title="Next steps" description="Once you install deps, you’ll see live pages.">
          <div className="mt-2 space-y-2 text-sm text-white/80">
            <div className="flex items-center justify-between">
              <span className="text-muted">Jobs</span>
              <Link className="underline decoration-white/20 underline-offset-4" href="/jobs">
                Open
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Applications</span>
              <Link className="underline decoration-white/20 underline-offset-4" href="/applications">
                Open
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Outreach</span>
              <Link className="underline decoration-white/20 underline-offset-4" href="/outreach">
                Open
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Settings</span>
              <Link className="underline decoration-white/20 underline-offset-4" href="/settings">
                Open
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

