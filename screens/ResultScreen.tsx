import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Share } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ROUTES from '../constants/routes';
import CustomButton from '../components/CustomButton';
import { saveOCRResult } from '../services/storageService';

type ResultScreenRouteProp = RouteProp<RootStackParamList, typeof ROUTES.RESULT>;
type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, typeof ROUTES.RESULT>;

export default function ResultScreen() {
  const route = useRoute<ResultScreenRouteProp>();
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const { imageUri, recognizedText, timestamp } = route.params;

  // Function to format a timestamp as a readable date string
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Function to save the current result to storage
  const saveResult = async () => {
    try {
      await saveOCRResult({
        id: `ocr_${timestamp}`,
        imageUri,
        recognizedText,
        timestamp,
      });
      
      // Show save confirmation visually (could use react-native-toast or similar)
      alert('Result saved successfully!');
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Failed to save result');
    }
  };

  // Function to share the recognized text
  const shareText = async () => {
    try {
      await Share.share({
        message: recognizedText,
        title: 'OCR Result',
      });
    } catch (error) {
      console.error('Error sharing text:', error);
      alert('Failed to share text');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
        
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Recognized Text</Text>
            <Text style={styles.timestamp}>{formatDate(timestamp)}</Text>
          </View>
          
          <View style={styles.textContainer}>
            <ScrollView style={styles.textScroll}>
              <Text style={styles.recognizedText}>{recognizedText}</Text>
            </ScrollView>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <CustomButton 
            title="Save Result"
            icon="save"
            onPress={saveResult}
            style={styles.saveButton}
          />
          
          <CustomButton 
            title="Share Text"
            icon="share"
            onPress={shareText}
            style={styles.shareButton}
          />
          
          <CustomButton 
            title="New Scan"
            icon="camera"
            onPress={() => navigation.navigate(ROUTES.HOME)}
            style={styles.newScanButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    backgroundColor: '#f0f0f0',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  textContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    maxHeight: 300,
  },
  textScroll: {
    flex: 1,
  },
  recognizedText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actionsContainer: {
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3498db',
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: '#9b59b6',
    marginBottom: 12,
  },
  newScanButton: {
    backgroundColor: '#2ecc71',
  },
});