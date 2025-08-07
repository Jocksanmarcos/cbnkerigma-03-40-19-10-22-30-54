import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ba2153e9aa8c4f068f8a01f550aa65df',
  appName: 'KerigmaApp',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://ba2153e9-aa8c-4f06-8f8a-01f550aa65df.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};

export default config;