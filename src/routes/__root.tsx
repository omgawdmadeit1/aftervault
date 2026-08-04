import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { CreatedWithGrokBanner } from "@/components/created-with-grok-banner";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { VaultHydration } from "@/components/pwa/vault-hydration";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "AfterVault";
const APP_DESCRIPTION =
  "AfterVault is the operational manual for your life — build it quietly now, guide your people when it matters.";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host
  ? `https://og.grok.me/v1/card.png?host=${encodeURIComponent(host)}&title=${encodeURIComponent(APP_NAME)}`
  : undefined;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "description", content: APP_DESCRIPTION },
      { title: APP_NAME },
      { name: "theme-color", content: "#3d6b5e" },
      { name: "color-scheme", content: "light" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "AfterVault" },
      { name: "application-name", content: "AfterVault" },
      { name: "format-detection", content: "telephone=no" },
      { property: "og:title", content: APP_NAME },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:type", content: "website" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
          ]
        : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/icons/icon-180.png", sizes: "180x180" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-bg text-fg antialiased">
        <CreatedWithGrokBanner />
        <AuthProvider>
          <VaultHydration />
          <Outlet />
          <PwaProvider />
          <Toaster
            position="top-center"
            toastOptions={{
              className: "border border-border bg-bg-elevated text-fg shadow-[var(--shadow-soft)]",
            }}
          />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
