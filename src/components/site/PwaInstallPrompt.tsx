import { useEffect, useState } from "react";
import { Download, Music2, Share } from "lucide-react";

import { usePlayer } from "@/lib/player";

type InstallChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

const DISMISSED_AT_KEY = "dany-beats-install-dismissed-at";
const DISMISS_DURATION = 30 * 24 * 60 * 60 * 1000;

function wasDismissedRecently() {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY));
    return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_DURATION;
  } catch {
    return false;
  }
}

function dismissForNow() {
  try {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
  } catch {
    // The prompt remains dismissible for this visit when storage is unavailable.
  }
}

function isRunningAsApp() {
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    standaloneNavigator.standalone === true
  );
}

function isAppleMobileDevice() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function PwaInstallPrompt() {
  const { current } = usePlayer();
  const [visible, setVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [installError, setInstallError] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [appleDevice, setAppleDevice] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
        console.error("Impossible d'enregistrer le service worker PWA.", error);
      });
    }

    if (isRunningAsApp()) return;
    setAppleDevice(isAppleMobileDevice());

    const showTimer = window.setTimeout(() => {
      if (!wasDismissedRecently()) setVisible(true);
    }, 1200);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onAppInstalled = () => {
      setVisible(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const onDismiss = () => {
    dismissForNow();
    setVisible(false);
    setHelpVisible(false);
  };

  const onInstall = async () => {
    if (!installPrompt) {
      setHelpVisible(true);
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === "accepted") setVisible(false);
      else onDismiss();
    } catch (error) {
      console.error("La demande d'installation PWA n'a pas pu être lancée.", error);
      setInstallError(true);
      setHelpVisible(true);
      setInstallPrompt(null);
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Installation de l'application Dany Beats"
      className={`fixed inset-x-3 z-[60] mx-auto max-w-lg sm:inset-x-auto sm:right-6 sm:w-[26rem] ${
        current ? "bottom-44 sm:bottom-6" : "bottom-4 sm:bottom-6"
      }`}
    >
      <div className="rounded-2xl border border-border bg-surface/95 p-4 shadow-2xl shadow-black/30 ring-1 ring-white/5 backdrop-blur-xl sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Music2 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold">Dany Beats, partout avec vous</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Installez notre application sur votre téléphone et retrouvez vos beats en un geste.
            </p>
          </div>
        </div>

        {helpVisible ? (
          <div className="mt-4 rounded-xl bg-surface-2/70 p-3 text-xs leading-relaxed text-muted-foreground">
            {appleDevice ? (
              <p>
                Dans Safari, touchez Partager. Dans un autre navigateur, ouvrez son menu de partage.
                Choisissez <Share className="mx-0.5 inline size-3.5" aria-label="Partager" />, puis{" "}
                <strong className="text-foreground">« Sur l’écran d’accueil »</strong> et confirmez
                avec <strong className="text-foreground">« Ajouter »</strong>.
              </p>
            ) : (
              <p>
                Ouvrez le menu de votre navigateur (⋮ ou ⋯), puis choisissez{" "}
                <strong className="text-foreground">« Installer l’application »</strong> ou{" "}
                <strong className="text-foreground">« Ajouter à l’écran d’accueil »</strong>.
              </p>
            )}
            {installError ? (
              <p className="mt-2 text-destructive">
                L’installation directe n’est pas disponible ici. Vous pouvez suivre ces étapes
                manuelles.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Plus tard
          </button>
          <button
            type="button"
            onClick={() => void onInstall()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="size-3.5" aria-hidden="true" />
            Installer
          </button>
        </div>
      </div>
    </aside>
  );
}
