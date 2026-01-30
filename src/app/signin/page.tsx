import { signIn } from "@/auth";
import Link from "next/link";
import { headers } from "next/headers";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : "/";
  const error = typeof sp.error === "string" ? sp.error : "";
  const created = typeof sp.created === "string" ? sp.created : "";
  const emailPrefill = typeof sp.email === "string" ? sp.email : "";

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;
  const redirectTo = new URL(callbackUrl, origin).toString();

  async function signInWithPassword(formData: FormData) {
    "use server";
    // Auth.js v5 handles Credentials best via FormData.
    // Include redirectTo so the browser doesn't land on /api/auth/callback/credentials.
    formData.set("redirectTo", redirectTo);
    formData.set("remember", formData.get("remember") ? "on" : "off");
    await signIn("credentials", formData);
  }

  async function signInDemo(formData: FormData) {
    "use server";
    formData.set("demo", "on");
    formData.set("remember", "on");
    formData.set("redirectTo", redirectTo);
    await signIn("credentials", formData);
  }

  return (
    <Card title="Sign in" description="Use your email and password to access your workspace.">
      {created === "1" ? (
        <div className="mt-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200 ring-1 ring-emerald-500/20">
          Account created. Sign in to continue.
        </div>
      ) : null}
      {error ? (
        <div className="mt-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-200 ring-1 ring-red-500/20">
          {error === "CredentialsSignin" ? "Invalid email or password." : `Sign-in error: ${error}`}
        </div>
      ) : null}

      <form action={signInDemo} className="mt-3">
        <Button className="w-full" variant="secondary" type="submit">
          Try the demo (no account needed)
        </Button>
      </form>

      <form action={signInWithPassword} className="mt-3 space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/70">Email</label>
          <Input
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            autoComplete="email"
            defaultValue={emailPrefill}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/70">Password</label>
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              name="remember"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-white/20 bg-white/5"
            />
            Remember me
          </label>
          <div className="text-xs text-white/60">Redirect to: {callbackUrl}</div>
        </div>
        <Button className="w-full" type="submit">
          Sign in
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-white/70">
        New here?{" "}
        <Link className="underline decoration-white/20 underline-offset-4" href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
          Create an account
        </Link>
      </div>
    </Card>
  );
}

