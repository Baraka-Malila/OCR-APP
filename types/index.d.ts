// Define OCR related types
export interface OCRResult {
    id: string;
    imageUri: string;
    recognizedText: string;
    timestamp: number;
  }
  
  // Define navigation parameters for typed navigation
  declare global {
    // Add any global type declarations here
  }
  
  // Define Camera type extensions
  declare module 'expo-camera' {
    import { ViewProps } from 'react-native';
    
    interface CameraProps extends ViewProps {
      type: any;
      ratio?: string;
    }

    export const Camera: React.ComponentType<CameraProps> & {
      requestCameraPermissionsAsync(): Promise<{ status: string }>;
    };

    export type CameraType = 'front' | 'back';
  }