export type RootStackParamList = {
  Home: undefined;
  Medicine: undefined;
  WaterTracker: undefined;
  Nutrition: undefined;
  BagChecklist: undefined;
  ObjectScan: undefined;
  PatientProfile: undefined;
};

// AR ekran parametre tipleri
export type ARScreenParams = {
  moduleType: 'medicine' | 'water' | 'nutrition' | 'bag' | 'object';
};
