import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.entsnap.app',
  appName: 'entsnap',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1008724758735-brrcb0261t1sbvl54t10issa13mcri20.apps.googleusercontent.com',
      androidClientId: '24422883865-m66365o94mr6bcn9spicvqi424cnsj1s.apps.googleusercontent.com',
      clientId: "1008724758735-brrcb0261t1sbvl54t10issa13mcri20.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
