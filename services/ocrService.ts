import { imageToBase64 } from '../utils/imageUtils';
import { MISTRAL_OCR_API_KEY } from '@env';

// OCR Result type
export interface OCRResult {
  id: string;
  imageUri: string;
  recognizedText: string;
  timestamp: number;
}

/**
 * Processes an image with OCR to extract text using Mistral's API
 * 
 * @param imageUri - URI of the image to process
 * @returns Promise<string> - Extracted text from the image
 */
export const processImageWithOCR = async (imageUri: string): Promise<string> => {
  try {
    const base64Image = await imageToBase64(imageUri);
    
    const requestPayload = {
      model: "mistral-large-vision", // Using Mistral's vision-capable model
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract and return all text from this image. Return only the extracted text, nothing else."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ]
    };

    console.log('OCR Request Payload:', JSON.stringify(requestPayload).slice(0, 500)); // Truncate for log safety

    const response = await fetch(
      'https://api.mistral.ai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_OCR_API_KEY}`
        },
        body: JSON.stringify(requestPayload),
      }
    );

    console.log('OCR Response Status:', response.status);
    const data = await response.json();
    console.log('OCR Response Data:', JSON.stringify(data).slice(0, 1000)); // Truncate for log safety

    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error('No text detected in the image');
    }
  } catch (error) {
    console.error('Error in OCR processing:', error);
    throw error;
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
    // In a real app, you would securely store the API key
    // For development, we'll just return success
    console.log(`API key registered for ${provider}`);
    return true;
  } catch (error) {
    console.error('Error registering API key:', error);
    return false;
  }
};