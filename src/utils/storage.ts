import * as SecureStore from 'expo-secure-store';
import type {PatientState} from '../store/PatientContext';

// expo-secure-store has a ~2 KB per-key limit, so we split the state
// into two keys: scalar fields (core) and array fields (lists).
const KEY_CORE = 'patient_core_v1';
const KEY_LISTS = 'patient_lists_v1';
const KEY_NOTIF = 'notif_settings_v1';

type CoreState = Pick<
  PatientState,
  'name' | 'surgeryType' | 'surgeryDate' | 'waterIntakeMl' | 'waterGoalMl' | 'lastSyncedAt'
>;
type ListsState = Pick<PatientState, 'medications' | 'bagChecklist'>;

export interface NotificationSettings {
  remindersOn: boolean;
  reminderInterval: number; // saat
}

export async function savePatientState(state: PatientState): Promise<void> {
  const core: CoreState = {
    name: state.name,
    surgeryType: state.surgeryType,
    surgeryDate: state.surgeryDate,
    waterIntakeMl: state.waterIntakeMl,
    waterGoalMl: state.waterGoalMl,
    lastSyncedAt: state.lastSyncedAt,
  };
  const lists: ListsState = {
    medications: state.medications,
    bagChecklist: state.bagChecklist,
  };
  await Promise.all([
    SecureStore.setItemAsync(KEY_CORE, JSON.stringify(core)),
    SecureStore.setItemAsync(KEY_LISTS, JSON.stringify(lists)),
  ]);
}

export async function loadPatientState(): Promise<Partial<PatientState> | null> {
  const [rawCore, rawLists] = await Promise.all([
    SecureStore.getItemAsync(KEY_CORE),
    SecureStore.getItemAsync(KEY_LISTS),
  ]);
  if (!rawCore && !rawLists) return null;
  const core: Partial<CoreState> = rawCore ? JSON.parse(rawCore) : {};
  const lists: ListsState = rawLists
    ? JSON.parse(rawLists)
    : {medications: [], bagChecklist: []};
  return {...core, ...lists};
}

export async function clearPatientState(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEY_CORE),
    SecureStore.deleteItemAsync(KEY_LISTS),
  ]);
}

export async function saveNotificationSettings(
  settings: NotificationSettings,
): Promise<void> {
  await SecureStore.setItemAsync(KEY_NOTIF, JSON.stringify(settings));
}

export async function loadNotificationSettings(): Promise<NotificationSettings | null> {
  const raw = await SecureStore.getItemAsync(KEY_NOTIF);
  if (!raw) return null;
  return JSON.parse(raw) as NotificationSettings;
}
