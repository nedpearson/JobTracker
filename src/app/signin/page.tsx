import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { env } from "@/lib/env";
import { signIn } from "@/auth";

export default function SignInPage() {
  async function signInGoogle() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  async function signInDemo(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const name = String(formData.get("name") ?? "");
    await signIn("credentials", { email, name, redirectTo: "/" });
  }

  const googleEnabled = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
  const devDemoEnabled = process.env.NODE_ENV !== "production" && env.ALLOW_DEV_LOGIN === "true";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card title="Sign in" description="Connect Google for Gmail send, or use demo login in dev.">
        <div className="mt-3 space-y-3">
          {googleEnabled ? (
            <form action={signInGoogle}>
              <Button className="w-full" type="submit">
                Continue with Google (Gmail)
              </Button>
            </form>
          ) : (
            <div className="text-muted text-sm">
              Google OAuth isn’t configured yet. Add `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in
              `.env` to enable Gmail integration.
            </div>
          )}

          {devDemoEnabled && (
            <form action={signInDemo} className="space-y-2">
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  className="glass w-full rounded-xl px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/20"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
                <input
                  className="glass w-full rounded-xl px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/20"
                  name="name"
                  type="text"
                  placeholder="Name (optional)"
                />
              </div>
              <Button className="w-full" variant="secondary" type="submit">
                Demo login (dev)
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

