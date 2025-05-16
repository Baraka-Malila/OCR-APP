import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

/**
 * Optimizes an image for OCR processing by:
 * - Resizing to reasonable dimensions
 * - Adjusting contrast if needed
 * - Compressing while maintaining quality
 * 
 * @param imageUri - The URI of the original image
 * @returns Promise<string> - The URI of the optimized image
 */
export const optimizeImageForOCR = async (imageUri: string): Promise<string> => {
  try {
    // Step 1: Resize the image to reasonable dimensions for processing
    // OCR works best with images that aren't too large
    const resizeResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1200 } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    // Step 2: Get the new image metadata
    const fileInfo = await FileSystem.getInfoAsync(resizeResult.uri);
    
    // Step 3: If image is still large, compress further
    // Using type assertion to handle the FileInfo type issue
    const fileInfoWithSize = fileInfo as FileSystem.FileInfo & { size?: number };
    
    if (fileInfoWithSize.size && fileInfoWithSize.size > 1000000) { // If larger than ~1MB
      return ImageManipulator.manipulateAsync(
        resizeResult.uri,
        [],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
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
    return await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
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