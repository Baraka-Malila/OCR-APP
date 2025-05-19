export type RootStackParamList = {
  Onboarding: {
    initialSlide?: number;
  };
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
  Privacy: {
    fromOnboarding?: boolean;
  };
  Terms: {
    fromOnboarding?: boolean;
  };
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