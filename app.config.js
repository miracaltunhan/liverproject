export default {
  expo: {
    name: 'Ameliyat Öncesi AR',
    slug: 'ameliyat-oncesi-ar',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'ameliyatar',
    userInterfaceStyle: 'dark',
    platforms: ['ios', 'android'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.example.ameliyatoncesiar',
      infoPlist: {
        NSCameraUsageDescription:
          'AR modüllerini kullanmak için kamera erişimi gereklidir.',
      },
    },
    android: {
      package: 'com.example.ameliyatoncesiar',
      adaptiveIcon: {
        backgroundColor: '#0D1B2A',
      },
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.SCHEDULE_EXACT_ALARM',
      ],
    },
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission:
            'AR özelliklerini kullanmak için kamera erişimi gereklidir.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#1976D2',
          sounds: [],
        },
      ],
      'expo-secure-store',
    ],
    extra: {
      eas: {
        projectId: 'your-eas-project-id',
      },
    },
  },
};
