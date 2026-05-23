import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.echo.app',
  appName: '回声 Echo',
  webDir: 'client/dist',
  server: {
    // Allow mixed content (HTTP API calls from HTTPS context)
    androidAllowMixedContent: true,
    // During dev, uncomment to load from Vite dev server:
    // url: 'http://10.0.2.2:3000',
    // cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
