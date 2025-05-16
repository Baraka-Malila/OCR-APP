import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { saveImageToFileSystem } from '../utils/imageUtils';

// Storage keys
const STORAGE_KEY_OCR_RESULTS = 'ocr_app_results';
const STORAGE_KEY_OCR_SETTINGS = 'ocr_app_settings';

// OCR Result type
export interface OCRResult {
  id: string;
  imageUri: string;
  recognizedText: string;
  timestamp: number;
}

// App settings type
export interface OCRAppSettings {
  apiKey?: string;
  ocrProvider?: string;
  saveResults: boolean;
  defaultLanguage: string;
}

// Default app settings
const DEFAULT_SETTINGS: OCRAppSettings = {
  saveResults: true,
  defaultLanguage: 'en',
};

/**
 * Save OCR result to storage
 * 
 * @param result - OCR result object to save
 * @returns Promise<void>
 */
export const saveOCRResult = async (result: OCRResult): Promise<void> => {
  try {
    // Make sure image is saved to app's documents directory for persistence
    const savedImageUri = await ensureImageIsSaved(result.imageUri);
    
    // Get existing results
    const existingResults = await getAllOCRResults();
    
    // Update the result with saved image path
    const updatedResult = { ...result, imageUri: savedImageUri };
    
    // Add new result and save back to storage
    const newResults = [...existingResults, updatedResult];
    await AsyncStorage.setItem(STORAGE_KEY_OCR_RESULTS, JSON.stringify(newResults));
  } catch (error) {
    console.error('Error saving OCR result:', error);
    throw error;
  }
};

/**
 * Get all saved OCR results
 * 
 * @returns Promise<OCRResult[]> - Array of OCR results
 */
export const getAllOCRResults = async (): Promise<OCRResult[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_OCR_RESULTS);
    if (jsonValue === null) return [];
    
    const results: OCRResult[] = JSON.parse(jsonValue);
    
    // Filter out results with missing images
    const validResults = await filterValidResults(results);
    
    // Save back the filtered list if it's different from original
    if (validResults.length !== results.length) {
      await AsyncStorage.setItem(STORAGE_KEY_OCR_RESULTS, JSON.stringify(validResults));
    }
    
    return validResults;
  } catch (error) {
    console.error('Error getting OCR results:', error);
    return [];
  }
};

/**
 * Delete a specific OCR result
 * 
 * @param id - ID of the result to delete
 * @returns Promise<boolean> - Whether deletion was successful
 */
export const deleteOCRResult = async (id: string): Promise<boolean> => {
  try {
    const results = await getAllOCRResults();
    const resultToDelete = results.find(result => result.id === id);
    
    // Remove the associated image file if possible
    if (resultToDelete && resultToDelete.imageUri.startsWith(FileSystem.documentDirectory || '')) {
      try {
        await FileSystem.deleteAsync(resultToDelete.imageUri);
      } catch (fileError) {
        console.warn('Could not delete image file:', fileError);
      }
    }
    
    // Remove the result from storage
    const newResults = results.filter(result => result.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY_OCR_RESULTS, JSON.stringify(newResults));
    
    return true;
  } catch (error) {
    console.error('Error deleting OCR result:', error);
    return false;
  }
};

/**
 * Get app settings
 * 
 * @returns Promise<OCRAppSettings> - App settings
 */
export const getAppSettings = async (): Promise<OCRAppSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_OCR_SETTINGS);
    if (jsonValue === null) return DEFAULT_SETTINGS;
    
    return { ...DEFAULT_SETTINGS, ...JSON.parse(jsonValue) };
  } catch (error) {
    console.error('Error getting app settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Save app settings
 * 
 * @param settings - Settings to save
 * @returns Promise<boolean> - Whether save was successful
 */
export const saveAppSettings = async (settings: Partial<OCRAppSettings>): Promise<boolean> => {
  try {
    const currentSettings = await getAppSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(STORAGE_KEY_OCR_SETTINGS, JSON.stringify(updatedSettings));
    return true;
  } catch (error) {
    console.error('Error saving app settings:', error);
    return false;
  }
};

/**
 * Clear all OCR results and settings
 * 
 * @returns Promise<boolean> - Whether clear was successful
 */
export const clearAllData = async (): Promise<boolean> => {
  try {
    // Get all results to find images to delete
    const results = await getAllOCRResults();
    
    // Delete all saved image files
    for (const result of results) {
      if (result.imageUri.startsWith(FileSystem.documentDirectory || '')) {
        try {
          await FileSystem.deleteAsync(result.imageUri);
        } catch (fileError) {
          console.warn('Could not delete image file:', fileError);
        }
      }
    }
    
    // Clear all AsyncStorage data for this app
    await AsyncStorage.multiRemove([STORAGE_KEY_OCR_RESULTS, STORAGE_KEY_OCR_SETTINGS]);
    
    return true;
  } catch (error) {
    console.error('Error clearing app data:', error);
    return false;
  }
};

// Helper function to ensure image is saved to app's documents directory
const ensureImageIsSaved = async (imageUri: string): Promise<string> => {
  // If image is already in the app's document directory, just return it
  if (imageUri.startsWith(FileSystem.documentDirectory || '')) {
    return imageUri;
  }
  
  // Otherwise, save the image to the app's document directory
  return await saveImageToFileSystem(imageUri);
};

// Helper function to filter out OCR results with missing image files
const filterValidResults = async (results: OCRResult[]): Promise<OCRResult[]> => {
  const validResults: OCRResult[] = [];
  
  for (const result of results) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(result.imageUri);
      if (fileInfo.exists) {
        validResults.push(result);
      }
    } catch (error) {
      // Skip this result if there's an error checking the file
      console.warn('Error checking file existence:', error);
    }
  }
  
  return validResults;
};