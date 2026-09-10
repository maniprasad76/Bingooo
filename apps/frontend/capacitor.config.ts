import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bingooo.fashion',
  appName: 'Bingooo',
  webDir: 'dist',
  backgroundColor: '#FAF8F5',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#FAF8F5',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#171717',
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: '#FAF8F5',
  },
};

export default config;
