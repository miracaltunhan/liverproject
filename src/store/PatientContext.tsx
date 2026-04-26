import React, {createContext, useContext, useEffect, useReducer, useState, ReactNode} from 'react';
import {loadPatientState, savePatientState} from '../utils/storage';

// ─── State Types ────────────────────────────────────────────────────────────
export interface MedicationEntry {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dose: string;
  time: string; // "08:00"
  taken: boolean;
}

export interface PatientState {
  name: string;
  surgeryType: string;
  surgeryDate: string; // ISO string
  medications: MedicationEntry[];
  waterIntakeMl: number;        // günlük içilen su (ml)
  waterGoalMl: number;          // hedef (ml)
  bagChecklist: BagItem[];
  lastSyncedAt: string | null;
}

export interface BagItem {
  id: string;
  label: string;
  packed: boolean;
  critical: boolean;
}

// ─── Actions ────────────────────────────────────────────────────────────────
type Action =
  | {type: 'SET_PATIENT'; payload: Partial<PatientState>}
  | {type: 'SET_MEDICATIONS'; payload: MedicationEntry[]}
  | {type: 'MARK_MEDICATION_TAKEN'; payload: string}
  | {type: 'ADD_WATER'; payload: number}
  | {type: 'RESET_WATER'}
  | {type: 'TOGGLE_BAG_ITEM'; payload: string}
  | {type: 'ADD_BAG_ITEM'; payload: BagItem}
  | {type: 'REMOVE_BAG_ITEM'; payload: string};

// ─── Initial State ───────────────────────────────────────────────────────────
// Karaciğer nakli hastaları için varsayılan ilaç listesi
const defaultMedications: MedicationEntry[] = [
  {id: 'prograf', name: 'Prograf', genericName: 'Takrolimus', category: 'İmmün Baskılayıcı', dose: 'Doktor dozunda', time: '08:00', taken: false},
  {id: 'prograf-2', name: 'Prograf', genericName: 'Takrolimus', category: 'İmmün Baskılayıcı', dose: 'Doktor dozunda', time: '20:00', taken: false},
  {id: 'cellcept', name: 'CellCept', genericName: 'Mikofenolat Mofetil', category: 'İmmün Baskılayıcı', dose: 'Doktor dozunda', time: '08:00', taken: false},
  {id: 'cellcept-2', name: 'CellCept', genericName: 'Mikofenolat Mofetil', category: 'İmmün Baskılayıcı', dose: 'Doktor dozunda', time: '20:00', taken: false},
  {id: 'medrol', name: 'Medrol', genericName: 'Metilprednizolon', category: 'Kortikosteroid', dose: 'Doktor dozunda', time: '08:00', taken: false},
  {id: 'ursofalk', name: 'Ursofalk', genericName: 'Ursodeoksikolik Asit', category: 'Safra Düzenleyici', dose: 'Doktor dozunda', time: '08:00', taken: false},
  {id: 'duphalac', name: 'Duphalac', genericName: 'Laktuloz', category: 'Laksatif', dose: '15–30 ml', time: '08:00', taken: false},
  {id: 'aldactone', name: 'Aldactone', genericName: 'Spironolakton', category: 'Diüretik', dose: 'Doktor dozunda', time: '08:00', taken: false},
  {id: 'lasix', name: 'Lasix', genericName: 'Furosemid', category: 'Diüretik', dose: 'Doktor dozunda', time: '08:00', taken: false},
  {id: 'nexium', name: 'Nexium', genericName: 'Esomeprazol', category: 'Mide Koruyucu', dose: 'Doktor dozunda', time: '07:30', taken: false},
  {id: 'bactrim', name: 'Bactrim', genericName: 'TMP-SMX', category: 'Antibiyotik', dose: 'Doktor dozunda', time: '08:00', taken: false},
];

const initialState: PatientState = {
  name: '',
  surgeryType: 'Karaciğer Nakli',
  surgeryDate: '',
  medications: defaultMedications,
  waterIntakeMl: 0,
  waterGoalMl: 2500,
  bagChecklist: [],
  lastSyncedAt: null,
};

// ─── Reducer ────────────────────────────────────────────────────────────────
function patientReducer(state: PatientState, action: Action): PatientState {
  switch (action.type) {
    case 'SET_PATIENT':
      return {...state, ...action.payload};

    case 'SET_MEDICATIONS':
      return {...state, medications: action.payload};

    case 'MARK_MEDICATION_TAKEN':
      return {
        ...state,
        medications: state.medications.map(m =>
          m.id === action.payload ? {...m, taken: true} : m,
        ),
      };

    case 'ADD_WATER':
      return {
        ...state,
        waterIntakeMl: Math.min(
          state.waterIntakeMl + action.payload,
          state.waterGoalMl,
        ),
      };

    case 'RESET_WATER':
      return {...state, waterIntakeMl: 0};

    case 'TOGGLE_BAG_ITEM':
      return {
        ...state,
        bagChecklist: state.bagChecklist.map(item =>
          item.id === action.payload
            ? {...item, packed: !item.packed}
            : item,
        ),
      };

    case 'ADD_BAG_ITEM':
      return {
        ...state,
        bagChecklist: [...state.bagChecklist, action.payload],
      };

    case 'REMOVE_BAG_ITEM':
      return {
        ...state,
        bagChecklist: state.bagChecklist.filter(i => i.id !== action.payload),
      };

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────
interface PatientContextValue {
  state: PatientState;
  dispatch: React.Dispatch<Action>;
  isHydrated: boolean;
}

const PatientContext = createContext<PatientContextValue | undefined>(undefined);

export const PatientProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(patientReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Uygulama açılışında kayıtlı veriyi yükle
  useEffect(() => {
    loadPatientState()
      .then(saved => {
        if (saved) {
          dispatch({type: 'SET_PATIENT', payload: saved});
        }
      })
      .catch(() => {/* depolama erişim hatası — varsayılan state kullan */})
      .finally(() => setIsHydrated(true));
  }, []);

  // State her değiştiğinde kaydet (yükleme bitmeden kaydetme)
  useEffect(() => {
    if (!isHydrated) return;
    savePatientState(state).catch(() => {/* sessiz hata */});
  }, [state, isHydrated]);

  return (
    <PatientContext.Provider value={{state, dispatch, isHydrated}}>
      {children}
    </PatientContext.Provider>
  );
};

export function usePatient(): PatientContextValue {
  const ctx = useContext(PatientContext);
  if (!ctx) {
    throw new Error('usePatient must be used inside PatientProvider');
  }
  return ctx;
}
