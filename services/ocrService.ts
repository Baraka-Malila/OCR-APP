import { imageToBase64 } from '../utils/imageUtils';

// OCR Result type
export interface OCRResult {
  id: string;
  imageUri: string;
  recognizedText: string;
  timestamp: number;
  confidence?: number;
  language?: string;
  provider: string;
  fileSize?: number;
}

interface OCRConfig {
  language?: string;
  provider?: 'ocrspace' | 'mistral' | 'auto';
  enhanceResults?: boolean;
  timeout?: number;
  maxFileSize?: number; // in bytes
}

const DEFAULT_CONFIG: OCRConfig = {
  language: 'eng',
  provider: 'auto', // Auto-select based on file size and type
  enhanceResults: true,
  timeout: 30000,
  maxFileSize: 1024 * 1024, // 1MB limit for OCR.space free tier
};

// Environment variables
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

/**
 * Get file size from base64 string
 */
const getBase64FileSize = (base64String: string): number => {
  const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
  return Math.floor((base64String.length * 3) / 4) - padding;
};

/**
 * Check if file is a document type that works better with Mistral
 */
const isDocumentType = (imageUri: string): boolean => {
  const docExtensions = ['.pdf', '.doc', '.docx', '.txt'];
  const lowerUri = imageUri.toLowerCase();
  return docExtensions.some(ext => lowerUri.includes(ext));
};

/**
 * OCR using OCR.space API (Free tier: 1MB limit, 25,000 requests/month)
 */
const processWithOCRSpace = async (base64Image: string, language: string = 'eng'): Promise<string> => {
  const formData = new FormData();
  formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
  formData.append('language', language);
  formData.append('isOverlayRequired', 'false');
  formData.append('OCREngine', '2'); // Use OCR Engine 2 for better accuracy
  formData.append('isTable', 'true'); // Better for documents with tables
  
  // Add API key if available, otherwise use free tier
  if (OCR_SPACE_API_KEY) {
    formData.append('apikey', OCR_SPACE_API_KEY);
  }

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OCR.space API Error: ${response.status} - ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.IsErroredOnProcessing) {
    throw new Error(`OCR.space Processing Error: ${result.ErrorMessage || 'Unknown error'}`);
  }

  if (result.ParsedResults && result.ParsedResults.length > 0) {
    return result.ParsedResults[0].ParsedText || '';
  }
  
  return '';
};

/**
 * OCR using Mistral AI (via vision capabilities) - Better for documents and large files
 */
const processWithMistral = async (base64Image: string, isDocument: boolean = false): Promise<string> => {
  if (!MISTRAL_API_KEY) {
    throw new Error("Mistral API key not configured");
  }

  const systemPrompt = isDocument 
    ? 'You are an expert OCR system. Extract ALL text from this document image, preserving formatting, structure, and layout as much as possible. Include headings, paragraphs, lists, and any other text elements. Return only the extracted text without any additional commentary.'
    : 'Extract all text from this image. Return only the extracted text without any additional formatting or explanation.';

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: isDocument ? 'Please extract all text from this document:' : 'Extract text from this image:',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1, // Low temperature for consistent OCR results
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mistral API Error: ${error.message || response.statusText}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content?.trim() || '';
};

/**
 * Smart provider selection based on file characteristics
 */
const selectProvider = (
  fileSize: number, 
  imageUri: string, 
  preferredProvider?: string
): 'ocrspace' | 'mistral' => {
  if (preferredProvider === 'ocrspace' || preferredProvider === 'mistral') {
    return preferredProvider;
  }

  // Use Mistral for documents or large files
  if (isDocumentType(imageUri) || fileSize > DEFAULT_CONFIG.maxFileSize!) {
    return 'mistral';
  }

  // Use OCR.space for small images (free tier)
  return 'ocrspace';
};

/**
 * Processes an image with OCR to extract text
 */
export const processImageWithOCR = async (
  imageUri: string,
  config: OCRConfig = DEFAULT_CONFIG
): Promise<OCRResult> => {
  try {
    const base64Image = await imageToBase64(imageUri);
    const fileSize = getBase64FileSize(base64Image);
    
    let recognizedText = '';
    let provider: 'ocrspace' | 'mistral';
    
    // Smart provider selection
    if (config.provider === 'auto') {
      provider = selectProvider(fileSize, imageUri);
    } else {
      provider = config.provider as 'ocrspace' | 'mistral';
    }

    // Validate file size for OCR.space
    if (provider === 'ocrspace' && fileSize > (config.maxFileSize || DEFAULT_CONFIG.maxFileSize!)) {
      console.warn(`File size (${Math.round(fileSize / 1024)}KB) exceeds OCR.space limit. Switching to Mistral.`);
      if (!MISTRAL_API_KEY) {
        throw new Error(`File too large for OCR.space (${Math.round(fileSize / 1024)}KB > 1MB) and Mistral API key not configured`);
      }
      provider = 'mistral';
    }

    // Process with selected provider
    try {
      switch (provider) {
        case 'ocrspace':
          recognizedText = await processWithOCRSpace(base64Image, config.language || 'eng');
          break;
        case 'mistral':
          recognizedText = await processWithMistral(base64Image, isDocumentType(imageUri));
          break;
      }
    } catch (error) {
      console.error(`${provider} failed:`, error);
      
      // Fallback logic
      if (provider === 'ocrspace' && MISTRAL_API_KEY) {
        console.log('Falling back to Mistral...');
        recognizedText = await processWithMistral(base64Image, isDocumentType(imageUri));
        provider = 'mistral';
      } else if (provider === 'mistral' && fileSize <= (config.maxFileSize || DEFAULT_CONFIG.maxFileSize!)) {
        console.log('Falling back to OCR.space...');
        recognizedText = await processWithOCRSpace(base64Image, config.language || 'eng');
        provider = 'ocrspace';
      } else {
        throw error;
      }
    }

    return {
      id: `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUri,
      recognizedText: recognizedText.trim(),
      timestamp: Date.now(),
      provider,
      fileSize,
      language: config.language,
    };
  } catch (error) {
    console.error('Error in OCR processing:', error);
    throw error instanceof Error ? error : new Error('Unknown error during OCR processing');
  }
};

/**
 * Validates an API key for a specific provider
 */
export const validateOCRApiKey = async (
  apiKey: string,
  provider: 'ocrspace' | 'mistral'
): Promise<boolean> => {
  try {
    switch (provider) {
      case 'mistral':
        const mistralResponse = await fetch('https://api.mistral.ai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        return mistralResponse.ok;

      case 'ocrspace':
        // OCR.space validation with a minimal test image
        const formData = new FormData();
        formData.append('base64Image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
        formData.append('apikey', apiKey);
        
        const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          body: formData,
        });
        const result = await ocrResponse.json();
        return ocrResponse.ok && !result.IsErroredOnProcessing;

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error validating ${provider} API key:`, error);
    return false;
  }
};

/**
 * Get available OCR providers based on configured API keys
 */
export const getAvailableProviders = (): { provider: string; description: string; limits: string }[] => {
  const providers = [
    {
      provider: 'ocrspace',
      description: 'OCR.space - Good for images up to 1MB',
      limits: OCR_SPACE_API_KEY ? 'Pro account limits' : 'Free: 25K requests/month, 1MB max file size'
    }
  ];
  
  if (MISTRAL_API_KEY) {
    providers.push({
      provider: 'mistral',
      description: 'Mistral AI - Best for documents and large files',
      limits: 'Based on your Mistral API plan'
    });
  }
  
  return providers;
};

/**
 * Process multiple images in batch with smart provider selection
 */
export const processBatchOCR = async (
  imageUris: string[],
  config: OCRConfig = DEFAULT_CONFIG
): Promise<OCRResult[]> => {
  const results: OCRResult[] = [];
  
  // Process sequentially to avoid rate limits
  for (const uri of imageUris) {
    try {
      const result = await processImageWithOCR(uri, config);
      results.push(result);
      
      // Small delay between requests to be respectful to APIs
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to process ${uri}:`, error);
      // Continue with other images even if one fails
      results.push({
        id: `ocr_error_${Date.now()}`,
        imageUri: uri,
        recognizedText: '',
        timestamp: Date.now(),
        provider: 'error',
      });
    }
  }
  
  return results;
};

/**
 * Get OCR service status and configuration
 */
export const getOCRServiceStatus = () => {
  return {
    ocrSpaceConfigured: !!OCR_SPACE_API_KEY,
    mistralConfigured: !!MISTRAL_API_KEY,
    availableProviders: getAvailableProviders(),
    maxFileSizeOCRSpace: '1MB',
    recommendedProvider: MISTRAL_API_KEY ? 'auto' : 'ocrspace',
  };
};

export default {
  processImageWithOCR,
  validateOCRApiKey,
  getAvailableProviders,
  processBatchOCR,
  getOCRServiceStatus,
};