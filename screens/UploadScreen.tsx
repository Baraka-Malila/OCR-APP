import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

const UploadScreen = () => {
  const { colors } = useTheme();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      // Handle the selected image
      console.log('Selected image:', result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.uploadButton, { backgroundColor: colors.surface }]}
        onPress={pickImage}
      >
        <View style={styles.uploadContent}>
          <Ionicons
            name="cloud-upload-outline"
            size={48}
            color={colors.primary}
          />
          <Text style={[styles.uploadText, { color: colors.text }]}>
            Select an Image
          </Text>
          <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>
            Tap to choose a photo from your gallery
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  uploadButton: {
    borderRadius: 16,
    padding: SPACING.xl,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  uploadSubtext: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
});

export default UploadScreen;