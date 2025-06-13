import { Mistral } from "@mistralai/mistralai";
import { imageToBase64 } from '../utils/imageUtils';
import { MISTRAL_OCR_API_KEY } from '@env';

// OCR Result type
export interface OCRResult {
  id: string;
  imageUri: string;
  recognizedText: string;
  timestamp: number;
  confidence?: number;
  language?: string;
}

interface OCRConfig {
  language?: string;
  modelVersion?: string;
  enhanceResults?: boolean;
  timeout?: number;
}

const DEFAULT_CONFIG: OCRConfig = {
  language: 'auto',
  modelVersion: 'mistral/mistral-ocr-latest',
  enhanceResults: true,
  timeout: 30000, // 30 seconds
};

// Initialize Mistral client
const getMistralClient = () => {
  if (!MISTRAL_OCR_API_KEY) {
    throw new Error("MISTRAL_OCR_API_KEY environment variable is not set.");
  }
  return new Mistral({ apiKey: MISTRAL_OCR_API_KEY });
};

/**
 * Processes an image with OCR to extract text using Mistral's API
 * 
 * @param imageUri - URI of the image to process
 * @param config - Optional configuration for OCR processing
 * @returns Promise<string> - Extracted text from the image
 */
export const processImageWithOCR = async (
  imageUri: string, 
  config: OCRConfig = DEFAULT_CONFIG
): Promise<string> => {
  try {
    const mistral = getMistralClient();
    const base64Image = await imageToBase64(imageUri);
    const documentUrl = `data:image/jpeg;base64,${base64Image}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const ocrResponse = await mistral.ocr.process({
        model: config.modelVersion ?? 'mistral/mistral-ocr-latest',
        document: {
          type: "document_url",
          documentUrl: documentUrl
        }
      });

      clearTimeout(timeoutId);

      // Type guard to ensure ocrResponse has the expected structure
      if (ocrResponse && typeof ocrResponse === 'object' && 'content' in ocrResponse) {
        return ocrResponse.content as string || '';
      }

      throw new Error('OCR failed: Invalid response format');
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('OCR request timed out');
        }

        // Type guard for API errors
        if (error && typeof error === 'object' && 'code' in error) {
          const apiError = error as { code: number; message?: string };
          throw new Error(`API Error (${apiError.code}): ${apiError.message || 'Unknown API error'}`);
        }

        throw error;
      }
      throw new Error('Unknown error during OCR processing');
    }
  } catch (error) {
    console.error('Error in OCR processing:', error);
    throw error;
  }
};

/**
 * Validates an OCR API key by attempting to initialize the client
 * 
 * @param apiKey - The API key to validate
 * @returns Promise<boolean> - Whether the key is valid
 */
export const validateOCRApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const mistral = new Mistral({ apiKey });
    // Try to list models to verify the API key works
    await mistral.models.list();
    return true;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};

/**
 * Registers an OCR API key for the service
 * 
 * @param apiKey - The API key to register
 * @param provider - The OCR provider ('mistral', 'google', etc.)
 * @returns Promise<boolean> - Whether the key was registered successfully
 */
export const registerOCRApiKey = async (
  apiKey: string, 
  provider: 'mistral' | 'google' | 'other'
): Promise<boolean> => {
  try {
    if (provider !== 'mistral') {
      throw new Error('Only Mistral provider is currently supported');
    }
    
    const isValid = await validateOCRApiKey(apiKey);
    if (!isValid) {
      throw new Error('Invalid API key');
    }
    // In a real app, you would securely store the API key
    return true;
  } catch (error) {
    console.error('Error registering API key:', error);
    throw error;
  }
};