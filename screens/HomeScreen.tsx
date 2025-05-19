import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions, NavigationProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';
import { RootDrawerParamList, RootStackParamList, RootNavigationParamList } from '../types/navigation';
import { processImageWithOCR } from '../services/ocrService';
import { optimizeImageForOCR } from '../utils/imageUtils';
import ScanIllustration from '../assets/scan-illustration.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = NavigationProp<RootNavigationParamList>;

const HomeScreen = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme();

  const handleImageProcessing = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      const optimizedImage = await optimizeImageForOCR(imageUri);
      const recognizedText = await processImageWithOCR(optimizedImage);
      
      navigation.navigate('Result', {
        imageUri: optimizedImage,
        recognizedText,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
      setShowOptions(false);
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      await handleImageProcessing(result.assets[0].uri);
    }
  };

  const handleCameraLaunch = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setShowOptions(false);
      navigation.navigate('CameraScan');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ScanIllustration
          width="100%"
          height={300}
          style={styles.illustration}
        />
        
        <Text style={[styles.instructionText, { color: colors.text }]}>
          Please select an image using the button{'\n'}below to recognize the text.
        </Text>
      </View>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <Text style={[styles.processingText, { color: colors.text }]}>
            Processing image...
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowOptions(true)}
        disabled={isProcessing}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>NEW</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={async () => {
          try {
            await AsyncStorage.removeItem('hasSeenOnboarding');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
              })
            );
          } catch (error) {
            console.error('Error clearing onboarding state:', error);
          }
        }}
      >
        <View style={styles.refreshDot} />
      </TouchableOpacity>

      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.primary }]}
              onPress={handleCameraLaunch}
            >
              <Ionicons name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.optionText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.primary }]}
              onPress={handleImagePick}
            >
              <Ionicons name="images" size={24} color="#FFFFFF" />
              <Text style={styles.optionText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  illustration: {
    marginBottom: SPACING.xl,
  },
  instructionText: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 100,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    padding: SPACING.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: SPACING.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  refreshButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  refreshDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
});

export default HomeScreen;