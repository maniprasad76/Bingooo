import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // 1. Register Service Worker (Production Only to prevent dev stale cache lock)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (import.meta.env.DEV) {
        // Automatically purge any stale service workers & caches on localhost
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((keys) => {
            keys.forEach((key) => caches.delete(key));
          });
        }
        return;
      }

      if (import.meta.env.MODE !== 'test') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            setSwRegistration(reg);
            // Check for periodic updates
            reg.onupdatefound = () => {
              const installing = reg.installing;
              if (installing) {
                installing.onstatechange = () => {
                  if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                    console.info('[PWA] New version available.');
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('[PWA] Service worker registration failed:', err);
          });
      }
    }
  }, []);

    // Check if already in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }
  }, []);

  // 2. Intercept beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 3. Prompt user to install
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    return outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    isOffline,
    promptInstall,
    swRegistration,
  };
}
