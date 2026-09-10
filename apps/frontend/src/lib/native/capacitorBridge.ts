import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

let isInitialized = false;
let registeredOverlayCloser: (() => boolean) | null = null;
let registeredNavigator: ((delta: number) => void) | null = null;

export const isNativeApp = (): boolean => Capacitor.isNativePlatform();
export const isAndroidApp = (): boolean => Capacitor.getPlatform() === 'android';

/**
 * Register close handler for active mobile overlays (like Cart Drawer, Filter drawer, Modals).
 * Returns true if an overlay was closed, preventing default back navigation.
 */
export function registerOverlayCloser(fn: () => boolean) {
  registeredOverlayCloser = fn;
}

/**
 * Register router navigation handler for physical back button navigation.
 */
export function registerNavigator(fn: (delta: number) => void) {
  registeredNavigator = fn;
}

/**
 * Initialize Capacitor plugins, status bar colors, splash screen, and Android hardware back button.
 */
export async function initCapacitorBridge() {
  if (isInitialized) return;
  isInitialized = true;

  if (!isNativeApp()) {
    return;
  }

  try {
    // ─── Status Bar Setup ───
    if (Capacitor.isPluginAvailable('StatusBar')) {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#171717' });
    }
  } catch (err) {
    console.debug('StatusBar initialization skipped:', err);
  }

  try {
    // ─── Splash Screen Setup ───
    if (Capacitor.isPluginAvailable('SplashScreen')) {
      // Small timeout to allow initial React render to paint first frame
      setTimeout(async () => {
        await SplashScreen.hide({ fadeOutDuration: 300 });
      }, 350);
    }
  } catch (err) {
    console.debug('SplashScreen initialization skipped:', err);
  }

  try {
    // ─── Android Hardware Back Button Handling ───
    if (Capacitor.isPluginAvailable('App')) {
      await CapApp.addListener('backButton', ({ canGoBack }) => {
        // 1. If any drawer or modal is open, dismiss it first
        if (registeredOverlayCloser && registeredOverlayCloser()) {
          return;
        }

        // 2. If router is not at home root, navigate back
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && registeredNavigator) {
          registeredNavigator(-1);
          return;
        }

        // 3. If canGoBack or at home root
        if (canGoBack && currentPath !== '/') {
          window.history.back();
        } else {
          // Double tap or exit on home screen
          CapApp.exitApp();
        }
      });
    }
  } catch (err) {
    console.debug('App backButton listener setup skipped:', err);
  }
}

/**
 * Tactile Haptic Feedback
 * Works on Native Capacitor Android & falls back to Navigator.vibrate on mobile web.
 */
export async function triggerHaptic(
  type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' = 'light'
) {
  try {
    if (isNativeApp() && Capacitor.isPluginAvailable('Haptics')) {
      if (type === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'medium') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (type === 'heavy') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (type === 'selection') {
        await Haptics.selectionStart();
      } else if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === 'warning') {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (type === 'error') {
        await Haptics.notification({ type: NotificationType.Error });
      }
      return;
    }

    // Web Haptic Fallback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      if (type === 'light' || type === 'selection') {
        navigator.vibrate(10);
      } else if (type === 'medium') {
        navigator.vibrate(25);
      } else if (type === 'heavy') {
        navigator.vibrate(40);
      } else if (type === 'success') {
        navigator.vibrate([15, 60, 20]);
      } else if (type === 'error' || type === 'warning') {
        navigator.vibrate([40, 50, 40]);
      }
    }
  } catch {
    // Ignore haptic errors on unsupported hardware
  }
}
