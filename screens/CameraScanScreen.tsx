import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImageManipulator from 'expo-image-manipulator';
import { RootStackParamList } from '../navigation/AppNavigator';
import ROUTES from '../constants/routes';
import CustomButton from '../components/CustomButton';
import { processImageWithOCR } from '../services/ocrService';
import { optimizeImageForOCR } from '../utils/imageUtils';

type CameraScanScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  typeof ROUTES.CAMERA_SCAN
>;

export default function CameraScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<any>(null);
  const navigation = useNavigation<CameraScanScreenNavigationProp>();

  useEffect(() => {
    requestPermission();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
        
        // Optimize image for OCR processing
        const optimizedImage = await optimizeImageForOCR(photo.uri);
        
        // Process the image with OCR
        const recognizedText = await processImageWithOCR(optimizedImage);
        
        // Navigate to result screen with data
        navigation.navigate(ROUTES.RESULT, {
          imageUri: optimizedImage,
          recognizedText,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error capturing image:', error);
        Alert.alert(
          'Capture Failed', 
          'There was a problem capturing the image. Please try again.'
        );
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const flipCamera = () => {
    setType(type === 'back' ? 'front' : 'back');
  };

  if (!permission) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubtext}>
          Camera permission is required to use this feature.
        </Text>
        <CustomButton
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef} 
        style={styles.camera} 
        facing={type}
        ratio="4:3"
      />
      
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.instructionText}>
          Position document within the frame
        </Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <CustomButton
          title="Flip Camera"
          icon="camera-reverse"
          onPress={flipCamera}
          style={styles.flipButton}
        />
        
        <CustomButton
          title={isCapturing ? "Processing..." : "Capture Document"}
          icon={isCapturing ? "hourglass" : "scan"}
          onPress={takePicture}
          disabled={isCapturing}
          style={styles.captureButton}
        />
        
        <CustomButton
          title="Cancel"
          icon="close-circle"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '80%',
    height: '50%',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  instructionText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    backgroundColor: '#3498db',
    width: 250,
    marginBottom: 15,
  },
  flipButton: {
    backgroundColor: '#9b59b6',
    width: 150,
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    width: 150,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#3498db',
    width: 150,
  },
});