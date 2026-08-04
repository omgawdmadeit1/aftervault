export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

let deferredInstall: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(e: BeforeInstallPromptEvent | null) => void>();

function notify() {
  for (const fn of listeners) fn(deferredInstall);
}

export function getDeferredInstallPrompt() {
  return deferredInstall;
}

export function subscribeInstallPrompt(fn: (e: BeforeInstallPromptEvent | null) => void) {
  listeners.add(fn);
  fn(deferredInstall);
  return () => listeners.delete(fn);
}

export function clearDeferredInstallPrompt() {
  deferredInstall = null;
  notify();
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || iosStandalone;
}

async function unregisterAllServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("aftervault-")).map((k) => caches.delete(k)));
  }
}

/**
 * Register the PWA service worker only in production builds.
 * Vite HMR + a controlling SW in the live preview commonly blanks the app
 * (stale HTML / wrong MIME on modules).
 */
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // Install prompt can still be collected in prod; harmless elsewhere
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstall = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstall = null;
    notify();
  });

  if (!import.meta.env.PROD) {
    // Dev / live preview: ensure no leftover SW owns the page
    void unregisterAllServiceWorkers();
    return;
  }

  const register = () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            void reg.update();
          }
        });
      })
      .catch(() => {
        // Progressive enhancement — never block the app
      });
  };

  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}
