import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Share } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootDrawerParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import CustomButton from '../components/CustomButton';

type ResultScreenRouteProp = RouteProp<RootDrawerParamList, 'Result'>;

const ResultScreen = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const { colors } = useTheme();
  const { imageUri, recognizedText } = route.params;

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(recognizedText);
  };

  const shareText = async () => {
    try {
      await Share.share({
        message: recognizedText,
      });
    } catch (error) {
      console.error('Error sharing text:', error);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Image 
        source={{ uri: imageUri }} 
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.resultContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.header, { color: colors.text }]}>
            Recognized Text
          </Text>
          <TouchableOpacity
            style={[styles.copyButton, { backgroundColor: colors.primary }]}
            onPress={copyToClipboard}
          >
            <Ionicons name="copy" size={20} color="#FFFFFF" />
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.textContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.recognizedText, { color: colors.text }]}>
            {recognizedText}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <CustomButton 
            title="Share Text"
            icon="share"
            onPress={shareText}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  resultContainer: {
    flex: 1,
    gap: SPACING.md,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  textContainer: {
    padding: SPACING.md,
    borderRadius: 12,
  },
  recognizedText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  actionButton: {
    minWidth: 120,
  },
});

export default ResultScreen;