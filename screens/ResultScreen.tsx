import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Share, Modal, Pressable, Alert, ViewStyle } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootDrawerParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import CustomButton from '../components/CustomButton';
import * as FileSystem from 'expo-file-system';

type ResultScreenRouteProp = RouteProp<RootDrawerParamList, 'Result'>;

const ResultScreen = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const { colors } = useTheme();
  const { imageUri, recognizedText } = route.params;
  const [exportModalVisible, setExportModalVisible] = useState(false);

  // Define ViewStyle objects for buttons
  const shareButtonStyle: ViewStyle = {
    ...styles.actionButton,
    backgroundColor: colors.secondary,
    marginRight: SPACING.sm
  };

  const exportButtonStyle: ViewStyle = {
    ...styles.actionButton,
    backgroundColor: colors.primary
  };

  // Safely get the recognized text
  const getDisplayText = () => {
    if (!recognizedText) return 'No text recognized';
    if (typeof recognizedText === 'string') return recognizedText;
    if (typeof recognizedText === 'object') {
      const result = recognizedText as { recognizedText?: string };
      return result.recognizedText || 'No text recognized';
    }
    return 'No text recognized';
  };

  const displayText = getDisplayText();

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(displayText);
      Alert.alert('Copied', 'Text copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy text to clipboard.');
    }
  };

  const shareText = async () => {
    try {
      await Share.share({
        message: displayText,
      });
    } catch (error) {
      console.error('Error sharing text:', error);
      Alert.alert('Error', 'Failed to share text.');
    }
  };

  const exportAsTxt = async () => {
    try {
      const fileName = `ocr_result_${Date.now()}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, displayText);
      Alert.alert('Exported', `Text file saved as: ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export as TXT.');
    }
  };

  const exportAsPdf = async () => {
    Alert.alert('Coming Soon', 'PDF export will be available in a future update.');
  };

  const exportAsDocx = async () => {
    Alert.alert('Coming Soon', 'DOCX export will be available in a future update.');
  };

  // Render text with proper line breaks
  const renderText = () => {
    if (!displayText || displayText === 'No text recognized') {
      return (
        <Text style={[styles.recognizedText, { color: colors.text, fontStyle: 'italic' }]}>
          No text recognized
        </Text>
      );
    }

    return (
      <Text style={[styles.recognizedText, { color: colors.text }]}>
        {displayText}
      </Text>
    );
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
          <ScrollView nestedScrollEnabled={true}>
            {renderText()}
          </ScrollView>
        </View>

        <View style={styles.actionsContainer}>
          <CustomButton 
            title="Share"
            icon="share-outline"
            onPress={shareText}
            style={shareButtonStyle}
          />
          <CustomButton 
            title="Export"
            icon="download-outline"
            onPress={() => setExportModalVisible(true)}
            style={exportButtonStyle}
          />
        </View>
      </View>

      {/* Export Modal */}
      <Modal
        visible={exportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setExportModalVisible(false)}
        >
          <Pressable 
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Export as...
            </Text>
            
            <CustomButton 
              title="TXT File" 
              icon="document-text-outline" 
              onPress={() => { 
                setExportModalVisible(false); 
                exportAsTxt(); 
              }} 
              style={{ ...styles.modalButton, backgroundColor: colors.primary }}
            />
            
            <CustomButton 
              title="PDF Document" 
              icon="document-outline" 
              onPress={() => { 
                setExportModalVisible(false); 
                exportAsPdf(); 
              }} 
              style={{ ...styles.modalButton, backgroundColor: colors.primary }}
            />
            
            <CustomButton 
              title="MS Word (DOCX)" 
              icon="document-attach-outline" 
              onPress={() => { 
                setExportModalVisible(false); 
                exportAsDocx(); 
              }} 
              style={{ ...styles.modalButton, backgroundColor: colors.primary }}
            />

            <CustomButton 
              title="Cancel" 
              icon="close-outline" 
              onPress={() => setExportModalVisible(false)} 
              style={{ ...styles.modalButton, backgroundColor: colors.error }}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
    minHeight: 200,
    maxHeight: 400,
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
    minWidth: 100,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    marginBottom: 12,
  },
});

export default ResultScreen;