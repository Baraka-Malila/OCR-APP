import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Share, Modal, Pressable, Alert } from 'react-native';
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

  const exportAsTxt = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + `ocr_result_${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, recognizedText);
      Alert.alert('Exported', `Text file saved to: ${fileUri}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export as TXT.');
    }
  };

  const exportAsPdf = async () => {
    Alert.alert('Coming Soon', 'PDF export will be available in a future update.');
  };

  const exportAsDocx = async () => {
    Alert.alert('Coming Soon', 'DOCX export will be available in a future update.');
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
            title="Export"
            icon="download-outline"
            onPress={() => setExportModalVisible(true)}
            style={{ ...styles.actionButton, backgroundColor: colors.primary }}
          />
        </View>
      </View>
      <Modal
        visible={exportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setExportModalVisible(false)}>
          <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, backgroundColor: colors.surface, borderRadius: 12, margin: 24, padding: 24 }}>
            <Text style={{ fontSize: FONT_SIZES.lg, fontWeight: '600', marginBottom: 16, color: colors.text }}>Export as...</Text>
            <CustomButton title="TXT" icon="document-text-outline" onPress={() => { setExportModalVisible(false); exportAsTxt(); }} style={{ marginBottom: 12 }} />
            <CustomButton title="PDF" icon="document-outline" onPress={() => { setExportModalVisible(false); exportAsPdf(); }} style={{ marginBottom: 12 }} />
            <CustomButton title="MS Word (DOCX)" icon="document-attach-outline" onPress={() => { setExportModalVisible(false); exportAsDocx(); }} />
          </View>
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