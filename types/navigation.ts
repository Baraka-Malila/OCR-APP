export type RootStackParamList = {
  Onboarding: undefined;
  MainApp: {
    screen?: keyof RootDrawerParamList;
    params?: {
      fromOnboarding?: boolean;
    };
  };
};

export type RootDrawerParamList = {
  Home: undefined;
  CameraScan: undefined;
  Result: {
    imageUri: string;
    recognizedText: string;
    timestamp: number;
  };
  Upload: undefined;
  History: undefined;
  Settings: undefined;
  Premium: {
    fromOnboarding?: boolean;
  };
  Privacy: undefined;
  Terms: undefined;
  Licenses: undefined;
};

// Combined navigation param list for nested navigation
export type RootNavigationParamList = RootStackParamList & RootDrawerParamList;

export type OCRResult = {
  id: string;
  title: string;
  timestamp: Date;
  type: 'scan' | 'upload';
  imageUri: string;
  recognizedText: string;
}; 