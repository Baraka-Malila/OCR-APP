import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_STATUS_KEY = 'premium_status';
const PREMIUM_EXPIRY_KEY = 'premium_expiry';

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'docx_export',
    name: 'DOCX Export',
    description: 'Export your scanned text as Microsoft Word documents',
    icon: 'document-text',
  },
  {
    id: 'pdf_export',
    name: 'PDF Export',
    description: 'Create professional PDF files from your scans',
    icon: 'document',
  },
  {
    id: 'batch_scan',
    name: 'Batch Scanning',
    description: 'Scan multiple pages in one go',
    icon: 'albums',
  },
  {
    id: 'cloud_backup',
    name: 'Cloud Backup',
    description: 'Automatically backup your scans to the cloud',
    icon: 'cloud-upload',
  },
];

export const isPremiumFeature = (featureId: string): boolean => {
  return PREMIUM_FEATURES.some(feature => feature.id === featureId);
};

export const getPremiumStatus = async (): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
    const expiry = await AsyncStorage.getItem(PREMIUM_EXPIRY_KEY);
    
    if (!status || !expiry) return false;
    
    const expiryDate = new Date(expiry);
    const now = new Date();
    
    return status === 'active' && expiryDate > now;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

export const activatePremium = async (durationInDays: number = 365): Promise<void> => {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationInDays);
    
    await AsyncStorage.setItem(PREMIUM_STATUS_KEY, 'active');
    await AsyncStorage.setItem(PREMIUM_EXPIRY_KEY, expiryDate.toISOString());
  } catch (error) {
    console.error('Error activating premium:', error);
    throw new Error('Failed to activate premium status');
  }
};

export const deactivatePremium = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PREMIUM_STATUS_KEY);
    await AsyncStorage.removeItem(PREMIUM_EXPIRY_KEY);
  } catch (error) {
    console.error('Error deactivating premium:', error);
    throw new Error('Failed to deactivate premium status');
  }
};

export const getRemainingPremiumDays = async (): Promise<number> => {
  try {
    const expiry = await AsyncStorage.getItem(PREMIUM_EXPIRY_KEY);
    if (!expiry) return 0;
    
    const expiryDate = new Date(expiry);
    const now = new Date();
    const diffTime = Math.abs(expiryDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Error getting remaining premium days:', error);
    return 0;
  }
}; 