import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.omnipulse.fitness',
  appName: 'OmniPulse',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-6842617720697423~7361827026', // Google AdMob App ID
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;

