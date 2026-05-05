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
  description?: string; // optional açıklama
  asset?: string; // 3D model asset adı
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

const defaultBagChecklist: BagItem[] = [
  {
    id: 'c1',
    label: 'Tansiyon Aleti',
    description: 'Kan basıncınızı düzenli olarak ölçmek için gereklidir. Ameliyat öncesi ve sonrası takip için önemlidir.',
    asset: 'tansiyon_aleti',
    packed: false,
    critical: true,
  },
  {
    id: 'c2',
    label: 'Göz Bandı',
    description: 'Gözlerinizi korumak ve rahatsız etmemek için kullanılır. Rahat bir uyku için önemlidir.',
    asset: 'goz_bandi',
    packed: false,
    critical: true,
  },
  {
    id: 'c3',
    label: 'Peçete',
    description: 'Hijyen ve temizlik için vazgeçilmez. Yüzünüzü silmek ve ellerinizi temizlemek için kullanabilirsiniz.',
    asset: 'pecete',
    packed: false,
    critical: true,
  },
  {
    id: 'c4',
    label: 'Şarj Kablosu',
    description: 'Telefonunuzun şarjı bitmesin diye yanınızda bulundurun. Hastane içinde prize erişim zor olabilir.',
    asset: 'sarj_kablosu',
    packed: false,
    critical: true,
  },
  {
    id: 'c5',
    label: 'Su',
    description: 'Susuz kalmayın. Küçük bir su şişesi hastane ortamında çok işe yarar.',
    asset: 'su',
    packed: false,
    critical: true,
  },
];

const initialState: PatientState = {
  name: '',
  surgeryType: 'Karaciğer Nakli',
  surgeryDate: '',
  medications: defaultMedications,
  waterIntakeMl: 0,
  waterGoalMl: 2500,
  bagChecklist: defaultBagChecklist,
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
          const bagChecklist = defaultBagChecklist.map(def => {
            const savedItem = saved.bagChecklist?.find(item => item.id === def.id);
            return savedItem ? {...def, ...savedItem} : def;
          });

          dispatch({
            type: 'SET_PATIENT',
            payload: {
              ...saved,
              bagChecklist,
            },
          });
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
