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
  Premium: undefined;
  Privacy: undefined;
  Terms: undefined;
  Licenses: undefined;
};

export type OCRResult = {
  id: string;
  title: string;
  timestamp: Date;
  type: 'scan' | 'upload';
  imageUri: string;
  recognizedText: string;
}; 