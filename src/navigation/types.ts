export type RootStackParamList = {
  Home: undefined;
  Medicine: undefined;
  MedicineDetail: { medicineId: string; autoPromptReminder?: boolean };
  WaterTracker: undefined;
  Nutrition: undefined;
  BagChecklist: undefined;
  PatientProfile: undefined;
};

// AR ekran parametre tipleri
export type ARScreenParams = {
  moduleType: 'medicine' | 'water' | 'nutrition' | 'bag';
};
