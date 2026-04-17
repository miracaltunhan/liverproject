import Constants from 'expo-constants';

/**
 * Expo Go içinde çalışıp çalışmadığını kontrol eder.
 *
 * - Expo Go   → appOwnership === 'expo'   → ViroReact YOKTUR → MockAR çalışır
 * - Dev/Prod build → appOwnership === null → ViroReact VAR    → Gerçek AR çalışır
 */
export const isExpoGo: boolean = Constants.appOwnership === 'expo';
