import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

/**
 * Optimizes an image for OCR processing by:
 * - Resizing to optimal dimensions
 * - Using high-quality JPEG format
 * - Applying minimal compression
 * 
 * @param imageUri - The URI of the original image
 * @returns Promise<string> - The URI of the optimized image
 */
export const optimizeImageForOCR = async (imageUri: string): Promise<string> => {
  try {
    // Always use JPEG for OCR
    const format = ImageManipulator.SaveFormat.JPEG;

    // Step 1: Resize to optimal dimensions for OCR processing
    const resizeResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Resize to a width that provides good detail for OCR
        { resize: { width: 2048 } }
      ],
      { compress: 0.95, format }  // High quality for better OCR results
    );
    
    // Step 2: Get the new image metadata
    const fileInfo = await FileSystem.getInfoAsync(resizeResult.uri);
    
    // Step 3: If image is still too large, apply minimal compression
    const fileInfoWithSize = fileInfo as FileSystem.FileInfo & { size?: number };
    
    if (fileInfoWithSize.size && fileInfoWithSize.size > 1000000) {
      return ImageManipulator.manipulateAsync(
        resizeResult.uri,
        [],
        { compress: 0.8, format }  // Slightly more compression but still maintain quality
      ).then(result => result.uri);
    }
    
    return resizeResult.uri;
  } catch (error) {
    console.error('Error optimizing image:', error);
    // If optimization fails, return the original image
    return imageUri;
  }
};

/**
 * Generates a base64 representation of an image for API transmission
 * 
 * @param imageUri - The URI of the image
 * @returns Promise<string> - Base64 encoded image string
 */
export const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    // First, optimize the image
    const optimizedUri = await optimizeImageForOCR(imageUri);
    
    // Read the file content
    const base64 = await FileSystem.readAsStringAsync(optimizedUri, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Return raw base64 without data URI scheme
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
};

/**
 * Creates a unique filename for saving images
 * 
 * @returns string - Unique filename with timestamp
 */
export const generateUniqueImageName = (): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `ocr_image_${timestamp}_${randomString}.jpg`;
};

/**
 * Saves an image to the app's file system
 * 
 * @param imageUri - Source image URI
 * @returns Promise<string> - Saved image URI
 */
export const saveImageToFileSystem = async (imageUri: string): Promise<string> => {
  try {
    const fileName = generateUniqueImageName();
    const destinationUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.copyAsync({
      from: imageUri,
      to: destinationUri
    });
    
    return destinationUri;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};