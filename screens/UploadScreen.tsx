import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ROUTES from '../constants/routes';
import CustomButton from '../components/CustomButton';
import { processImageWithOCR } from '../services/ocrService';
import { optimizeImageForOCR } from '../utils/imageUtils';

type UploadScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  typeof ROUTES.UPLOAD
>;

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigation = useNavigation<UploadScreenNavigationProp>();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;
    
    try {
      setIsProcessing(true);
      
      // Optimize image for OCR processing
      const optimizedImage = await optimizeImageForOCR(selectedImage);
      
      // Process the image with OCR
      const recognizedText = await processImageWithOCR(optimizedImage);
      
      // Navigate to result screen with data
      navigation.navigate(ROUTES.RESULT, {
        imageUri: optimizedImage,
        recognizedText,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert(
        'Processing Failed', 
        'There was a problem processing the image. Please try again with a different image.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      ) : (
        <>
          <View style={styles.imageContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>No image selected</Text>
                <Text style={styles.placeholderSubtext}>
                  Select an image from your gallery to extract text
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title={selectedImage ? "Change Image" : "Select Image"}
              icon="image"
              onPress={pickImage}
              style={styles.selectButton}
            />
            
            {selectedImage && (
              <CustomButton
                title="Process Image"
                icon="scan"
                onPress={processImage}
                style={styles.processButton}
              />
            )}
            
            <CustomButton
              title="Cancel"
              icon="arrow-back"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderContainer: {
    padding: 20,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#3498db',
    marginBottom: 15,
  },
  processButton: {
    backgroundColor: '#2ecc71',
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
});