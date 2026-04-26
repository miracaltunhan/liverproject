import * as Notifications from 'expo-notifications';

// ── Bildirim kanalı ayarları (Android) ────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Bildirim izinlerini iste
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const {status: existingStatus} = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Günlük tekrarlayan ilaç hatırlatıcısı oluştur
 * @param medicineId - İlaç ID'si (bildirim tanımlayıcı olarak kullanılır)
 * @param medicineName - İlaç adı
 * @param hour - Saat (0-23)
 * @param minute - Dakika (0-59)
 * @param dosageInfo - Dozaj bilgisi
 */
export async function scheduleMedicineReminder(
  medicineId: string,
  medicineName: string,
  hour: number,
  minute: number,
  dosageInfo: string,
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Önceki hatırlatıcıyı iptal et (aynı ilaç için)
    await cancelMedicineReminder(medicineId);

    // Yeni günlük tekrarlayan bildirim oluştur
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 ${medicineName} — İlaç Zamanı!`,
        body: `${dosageInfo}\n${medicineName} ilacınızı almayı unutmayın.`,
        data: {medicineId, type: 'medicine_reminder'},
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return id;
  } catch (error) {
    console.error('Hatırlatıcı oluşturulamadı:', error);
    return null;
  }
}

/**
 * Belirli bir ilaç hatırlatıcısını iptal et
 */
export async function cancelMedicineReminder(medicineId: string): Promise<void> {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (
        notification.content.data &&
        (notification.content.data as any).medicineId === medicineId
      ) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        );
      }
    }
  } catch (error) {
    console.error('Hatırlatıcı iptal edilemedi:', error);
  }
}

/**
 * Tüm ilaç hatırlatıcılarını iptal et
 */
export async function cancelAllMedicineReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Hatırlatıcılar iptal edilemedi:', error);
  }
}
