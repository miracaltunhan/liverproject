import * as SecureStore from 'expo-secure-store';
import {PatientState} from '../store/PatientContext';

const STORAGE_KEY = 'patient_state_v1';

export async function savePatientState(state: PatientState): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(state));
}

export async function loadPatientState(): Promise<PatientState | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as PatientState;
}

export async function clearPatientState(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
