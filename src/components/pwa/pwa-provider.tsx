import { useEffect, useState } from "react";
import { Download, WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clearDeferredInstallPrompt,
  isStandaloneDisplay,
  registerServiceWorker,
  subscribeInstallPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/register";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "aftervault-install-dismissed";

export function PwaProvider() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <>
      <OfflineBanner />
      <InstallBanner />
    </>
  );
}

function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-[var(--grok-banner-h,0px)] z-[90] border-b border-warn/30 bg-warn-soft px-3 py-2 text-center text-xs font-medium text-warn sm:text-sm"
    >
      <span className="inline-flex items-center gap-1.5">
        <WifiOff className="size-3.5 shrink-0" aria-hidden />
        You're offline — vault data on this device still works; sync needs a connection.
      </span>
    </div>
  );
}

function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) return;

    const dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = isIos && /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);

    const unsub = subscribeInstallPrompt((e) => {
      setPromptEvent(e);
      if (e && !dismissed) setVisible(true);
    });

    if (!dismissed && isSafari && !isStandaloneDisplay()) {
      // iOS has no beforeinstallprompt — show Share → Add to Home Screen tip after a beat
      const t = window.setTimeout(() => setIosHint(true), 2500);
      return () => {
        unsub();
        window.clearTimeout(t);
      };
    }

    return unsub;
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setIosHint(false);
  }

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    clearDeferredInstallPrompt();
    setPromptEvent(null);
    setVisible(false);
  }

  if (!visible && !iosHint) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-3 z-[85] mx-auto max-w-md rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-3 shadow-[var(--shadow-card)]",
        "bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-4",
      )}
      role="dialog"
      aria-label="Install AfterVault"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-primary text-primary-fg">
          <Download className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight">Install AfterVault</p>
          <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
            {iosHint && !promptEvent
              ? "On iPhone: tap Share, then “Add to Home Screen” for full-screen access."
              : "Add to your home screen for quick, app-like access — works great on phone."}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {promptEvent ? (
              <Button size="sm" onClick={() => void install()}>
                Install
              </Button>
            ) : null}
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] text-fg-subtle hover:bg-bg-subtle hover:text-fg"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
