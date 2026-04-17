/**
 * Ameliyata kaç tam gün kaldığını döner.
 * Negatif: ameliyat geçmiş. 0: bugün.
 */
export function daysUntilSurgery(surgeryDateISO: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const surgDate = new Date(surgeryDateISO);
  surgDate.setHours(0, 0, 0, 0);
  return Math.round((surgDate.getTime() - now.getTime()) / 86_400_000);
}

/**
 * "08:00" formatındaki saatin bugün geçip geçmediğini kontrol eder.
 */
export function isTimePassedToday(timeStr: string): boolean {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  return (
    now.getHours() > hours ||
    (now.getHours() === hours && now.getMinutes() >= minutes)
  );
}

/**
 * Bugünün tarihini "DD Ay YYYY" formatında döner.
 */
export function formatDateTurkish(date: Date = new Date()): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
