import { imageToBase64, saveImageToFileSystem } from '../utils/imageUtils';
import { GOOGLE_CLOUD_VISION_API_KEY } from '@env';

// OCR Result type
export interface OCRResult {
  id: string;
  imageUri: string;
  recognizedText: string;
  timestamp: number;
}

/**
 * Processes an image with OCR to extract text.
 * This function can be modified to use different OCR providers.
 * 
 * @param imageUri - URI of the image to process
 * @returns Promise<string> - Extracted text from the image
 */
export const processImageWithOCR = async (imageUri: string): Promise<string> => {
  try {
    const base64Image = await imageToBase64(imageUri);
    const requestPayload = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };
    console.log('OCR Request Payload:', JSON.stringify(requestPayload).slice(0, 500)); // Truncate for log safety
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      }
    );
    console.log('OCR Response Status:', response.status);
    const data = await response.json();
    console.log('OCR Response Data:', JSON.stringify(data).slice(0, 1000)); // Truncate for log safety
    if (
      data.responses &&
      data.responses[0] &&
      data.responses[0].fullTextAnnotation &&
      data.responses[0].fullTextAnnotation.text
    ) {
      return data.responses[0].fullTextAnnotation.text;
    } else {
      return 'No text detected';
    }
  } catch (error) {
    console.error('Error in OCR processing:', error);
    return 'Failed to process image with OCR';
  }
};

/**
 * Registers an OCR API key for the service
 * 
 * @param apiKey - The API key to register
 * @param provider - The OCR provider ('google', 'microsoft', etc.)
 * @returns Promise<boolean> - Whether the key was registered successfully
 */
export const registerOCRApiKey = async (
  apiKey: string, 
  provider: 'google' | 'microsoft' | 'other'
): Promise<boolean> => {
  try {
    // In a real app, you would securely store the API key
    // For development, we'll just return success
    console.log(`API key registered for ${provider}`);
    return true;
  } catch (error) {
    console.error('Error registering API key:', error);
    return false;
  }
};