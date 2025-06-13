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

// Environment variables - Use your actual environment variable names
const OCR_SPACE_API_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY;
const MISTRAL_API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY;

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

interface TextBlock {
  text: string;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'unknown';
  indent: number;
}

/**
 * Enhanced text cleaning and structure detection
 */
const cleanText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  // Split text into blocks for analysis
  const blocks = text
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(block => block.length > 0);

  // Process each block
  const processedBlocks = blocks.map(block => {
    const textBlock = analyzeTextBlock(block);
    return formatTextBlock(textBlock);
  });

  return processedBlocks.join('\n\n');
};

/**
 * Analyze text block to determine its type and structure
 */
const analyzeTextBlock = (block: string): TextBlock => {
  const lines = block.split('\n');
  const indent = getIndentation(block);
  
  // Detect headings
  if (lines.length === 1 && (
    lines[0].match(/^[A-Z0-9][\w\s-]{0,50}$/) || // All caps or numbered
    lines[0].length <= 50 && !lines[0].endsWith('.') // Short line without period
  )) {
    return { text: block, type: 'heading', indent };
  }

  // Detect lists
  if (lines.some(line => line.match(/^[\s]*[-•*]\s|^\d+\.\s/))) {
    return { text: block, type: 'list', indent };
  }

  // Detect tables (simplified)
  if (lines.some(line => line.includes('\t') || line.match(/\s{3,}/))) {
    return { text: block, type: 'table', indent };
  }

  // Default to paragraph
  return { text: block, type: 'paragraph', indent };
};

/**
 * Format text block based on its type
 */
const formatTextBlock = (block: TextBlock): string => {
  let formattedText = block.text;

  switch (block.type) {
    case 'heading':
      // Preserve heading format
      formattedText = block.text.trim();
      break;

    case 'paragraph':
      // Clean up paragraphs while preserving intentional line breaks
      formattedText = block.text
        .replace(/[ \t]+/g, ' ')
        .replace(/[ \t]*\n[ \t]*/g, '\n')
        .trim();
      break;

    case 'list':
      // Preserve list formatting and indentation
      formattedText = block.text
        .split('\n')
        .map(line => line.trim())
        .join('\n');
      break;

    case 'table':
      // Preserve table structure
      formattedText = block.text
        .split('\n')
        .map(line => line.replace(/\t/g, '    '))
        .join('\n');
      break;
  }

  // Apply indentation
  if (block.indent > 0) {
    formattedText = formattedText
      .split('\n')
      .map(line => ' '.repeat(block.indent) + line)
      .join('\n');
  }

  return formattedText;
};

/**
 * Calculate the indentation level of a text block
 */
const getIndentation = (text: string): number => {
  const lines = text.split('\n');
  const indents = lines
    .map(line => {
      const indent = line.match(/^[\s]*/)?.[0].length || 0;
      return indent < line.length ? indent : 0;
    })
    .filter(indent => indent > 0);
  
  return indents.length > 0 ? Math.min(...indents) : 0;
};

/**
 * OCR using OCR.space API (Free tier: 1MB limit, 25,000 requests/month)
 */
const processWithOCRSpace = async (base64Image: string, language: string = 'eng'): Promise<string> => {
  try {
    const formData = new FormData();
    
    // Determine image format from base64
    let mimeType = 'image/jpeg';
    if (base64Image.startsWith('/9j/')) mimeType = 'image/jpeg';
    else if (base64Image.startsWith('iVBORw0KGgo')) mimeType = 'image/png';
    else if (base64Image.startsWith('R0lGOD')) mimeType = 'image/gif';
    
    formData.append('base64Image', `data:${mimeType};base64,${base64Image}`);
    formData.append('language', language);
    formData.append('isOverlayRequired', 'true');
    formData.append('OCREngine', '2');
    formData.append('detectOrientation', 'true');
    formData.append('isTable', 'true');
    
    // Don't use scale parameter as it's causing issues
    // Instead, we'll handle image optimization before sending
    
    // Add API key if available
    if (OCR_SPACE_API_KEY) {
      formData.append('apikey', OCR_SPACE_API_KEY);
    }
    formData.append('scale', 'true'); // Scale image for better OCR
    formData.append('isCreateSearchablePdf', 'false');
    
    // Add API key if available, otherwise use free tier
    if (OCR_SPACE_API_KEY) {
      formData.append('apikey', OCR_SPACE_API_KEY);
    }

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let FormData set it
      },
    });

    if (!response.ok) {
      throw new Error(`OCR.space API Error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.IsErroredOnProcessing) {
      throw new Error(`OCR.space Processing Error: ${result.ErrorMessage || 'Unknown error'}`);
    }

    if (result.ParsedResults && result.ParsedResults.length > 0) {
      const extractedText = result.ParsedResults[0].ParsedText || '';
      return cleanText(extractedText);
    }
    
    return '';
  } catch (error) {
    console.error('OCR.space error:', error);
    throw error;
  }
};

/**
 * OCR using Mistral AI (via vision capabilities) - Better for documents and large files
 */
const processWithMistral = async (base64Image: string, isDocument: boolean = false): Promise<string> => {
  if (!MISTRAL_API_KEY) {
    throw new Error("Mistral API key not configured");
  }

  try {
    const systemPrompt = isDocument 
      ? `You are an expert OCR system specialized in document structure preservation.
         Guidelines for text extraction:
         1. Preserve all headings and their hierarchy
         2. Maintain paragraph breaks and indentation
         3. Keep list formatting (bullets, numbers)
         4. Preserve table structures and alignments
         5. Retain any special formatting (e.g., columns)
         6. Maintain original line breaks when meaningful
         Extract ALL text from the document exactly as it appears, keeping the original structure.
         Return ONLY the extracted text without any commentary or markdown.`
      : `Extract all text from this image preserving:
         - Original line breaks and spacing
         - Text alignment and indentation
         - Any visible structure or formatting
         Return only the extracted text without additional formatting or explanation.`;

    // Determine image format
    let mimeType = 'image/jpeg';
    if (base64Image.startsWith('/9j/')) mimeType = 'image/jpeg';
    else if (base64Image.startsWith('iVBORw0KGgo')) mimeType = 'image/png';
    else if (base64Image.startsWith('R0lGOD')) mimeType = 'image/gif';

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
                  url: `data:${mimeType};base64,${base64Image}`,
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
      const errorText = await response.text();
      console.error('Mistral API Error Response:', errorText);
      throw new Error(`Mistral API Error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    const extractedText = result.choices?.[0]?.message?.content || '';
    return cleanText(extractedText);
  } catch (error) {
    console.error('Mistral error:', error);
    throw error;
  }
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
    console.log('Starting OCR processing for:', imageUri);
    
    const base64Image = await imageToBase64(imageUri);
    const fileSize = getBase64FileSize(base64Image);
    
    console.log(`File size: ${Math.round(fileSize / 1024)}KB`);
    
    let recognizedText = '';
    let provider: 'ocrspace' | 'mistral';
    
    // Smart provider selection
    if (config.provider === 'auto') {
      provider = selectProvider(fileSize, imageUri);
    } else {
      provider = config.provider as 'ocrspace' | 'mistral';
    }

    console.log(`Selected provider: ${provider}`);

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
        try {
          recognizedText = await processWithMistral(base64Image, isDocumentType(imageUri));
          provider = 'mistral';
        } catch (fallbackError) {
          console.error('Mistral fallback also failed:', fallbackError);
          throw error; // Throw original error
        }
      } else if (provider === 'mistral' && fileSize <= (config.maxFileSize || DEFAULT_CONFIG.maxFileSize!)) {
        console.log('Falling back to OCR.space...');
        try {
          recognizedText = await processWithOCRSpace(base64Image, config.language || 'eng');
          provider = 'ocrspace';
        } catch (fallbackError) {
          console.error('OCR.space fallback also failed:', fallbackError);
          throw error; // Throw original error
        }
      } else {
        throw error;
      }
    }

    // Final text cleaning
    recognizedText = cleanText(recognizedText);

    const result: OCRResult = {
      id: `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUri,
      recognizedText,
      timestamp: Date.now(),
      provider,
      fileSize,
      language: config.language,
    };

    console.log('OCR processing completed successfully');
    return result;
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
  getOCRServiceStatus,
};