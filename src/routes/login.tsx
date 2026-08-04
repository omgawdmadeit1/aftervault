import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();

  if (!isPending && user) {
    return <Navigate to="/app" />;
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign in to AfterVault</CardTitle>
            <CardDescription>
              Secure access to your living vault. Your operational manual stays sealed until you
              choose who can open it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isPending ? (
              <div className="space-y-2">
                <div className="h-11 animate-pulse rounded-[var(--radius-md)] bg-bg-subtle" />
                <div className="h-11 animate-pulse rounded-[var(--radius-md)] bg-bg-subtle" />
              </div>
            ) : authEnabled ? (
              GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/app" })}
                >
                  Continue with {p.label}
                </Button>
              ))
            ) : (
              <p className="text-center text-sm text-fg-muted">
                Sign-in is disabled in this environment. Open the app directly.
              </p>
            )}
            <p className="pt-2 text-center text-xs leading-relaxed text-fg-subtle">
              By continuing you agree this tool is for operational planning only and is not legal
              advice.
            </p>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-fg-muted">
          <Link to="/" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
