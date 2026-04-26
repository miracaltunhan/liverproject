import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';

// ─── Bildirim kanalı ve varsayılan davranış ─────────────────────────────────
// Expo Go SDK 53+: push bildirimleri desteklenmiyor — try/catch ile koru
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Expo Go'da sessizce geç
}

// ─── İzin iste ──────────────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const {status: existing} = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const {status} = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('water-reminder', {
        name: 'Su Hatırlatıcı',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#40C4FF',
      });
    }
    return true;
  } catch {
    return false;
  }
}

// ─── Mevcut su hatırlatıcılarını iptal et ───────────────────────────────────
export async function cancelWaterReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Expo Go'da sessizce geç
  }
}

// ─── Su hatırlatıcı bildirimlerini planla ───────────────────────────────────
/**
 * Gündüz saatlerinde (08:00 – 22:00) arasında `intervalHours` saat aralıkla
 * tekrarlayan hatırlatıcılar kurar.
 *
 * @param intervalHours  Hatırlatma aralığı (varsayılan 2 saat)
 * @param dailyGoalMl   Günlük hedef ml (bildirim metninde gösterilir)
 * @param currentMl     Şu ana kadar içilen ml
 */
export async function scheduleWaterReminders(
  intervalHours: number = 2,
  dailyGoalMl: number = 2500,
  currentMl: number = 0,
): Promise<void> {
  try {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Önce eskilerini temizle
  await cancelWaterReminders();

  const remaining = dailyGoalMl - currentMl;
  if (remaining <= 0) {
    // Hedefe zaten ulaşıldı — tebrik bildirimi
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Harika İş!',
        body: `Günlük ${dailyGoalMl} ml su hedefine ulaştın. Karaciğer sağlığın için mükemmel!`,
        sound: 'default',
        data: {type: 'water-goal-reached'},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
    return;
  }

  // ── Motivasyonel mesaj havuzu ─────────────────────────────────────────────
  const messages = [
    {
      title: '💧 Su İçme Vakti!',
      body: `Karaciğer sağlığın için su çok önemli! Hedefe ulaşmana ${remaining} ml kaldı.`,
    },
    {
      title: '🥤 Şişeni Doldur!',
      body: `AR şişeni açıp ilerlemeyi gör! Günlük hedefe ${remaining} ml kaldı.`,
    },
    {
      title: '⏰ Hatırlatma',
      body: `Son su içmenden bu yana ${intervalHours} saat geçti. Bir bardak su iç! 💪`,
    },
    {
      title: '🫧 Hidrasyon Zamanı',
      body: `Ameliyat öncesi hazırlığın için düzenli su tüketimi kritik. Hedef: ${dailyGoalMl} ml`,
    },
  ];

  // Her interval için farklı bir mesaj planla (günde en fazla 8 bildirim)
  const maxNotifications = Math.min(
    Math.floor(14 / intervalHours), // 08:00 – 22:00 → 14 saat
    8,
  );

  for (let i = 0; i < maxNotifications; i++) {
    const msg = messages[i % messages.length];
    const delaySeconds = (i + 1) * intervalHours * 3600;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: 'default',
        data: {type: 'water-reminder', index: i},
        ...(Platform.OS === 'android' && {channelId: 'water-reminder'}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
      },
    });
  }

  } catch {
    // Expo Go SDK 53 — sessizce geç
  }
}

// ─── Anlık test bildirimi (geliştirme amaçlı) ──────────────────────────────
export async function sendTestNotification(): Promise<void> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Bildirimi',
        body: 'Bildirimler çalışıyor!',
        sound: 'default',
        data: {type: 'test'},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      },
    });
  } catch {
    // Expo Go SDK 53 — sessizce geç
  }
}
