import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ROUTES from '../constants/routes';
import CustomButton from '../components/CustomButton';
import { getAllOCRResults, deleteOCRResult, OCRResult } from '../services/storageService';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

type HistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  typeof ROUTES.HISTORY
>;

export default function HistoryScreen() {
  const [historyItems, setHistoryItems] = useState<OCRResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { colors } = useTheme();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const results = await getAllOCRResults();
      // Sort by timestamp (newest first)
      results.sort((a, b) => b.timestamp - a.timestamp);
      setHistoryItems(results);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load scan history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString() + ' ' + 
           new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleItemPress = (item: OCRResult) => {
    navigation.navigate(ROUTES.RESULT, {
      imageUri: item.imageUri,
      recognizedText: item.recognizedText,
      timestamp: item.timestamp
    });
  };

  const handleDeleteItem = async (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOCRResult(id);
              setHistoryItems(historyItems.filter(item => item.id !== id));
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: OCRResult }) => {
    const icon = item.type === 'scan' ? 'scan-outline' : 'image-outline';
    
    return (
      <TouchableOpacity
        style={[styles.historyItem, { backgroundColor: colors.surface }]}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.itemContent}>
          <Ionicons name={icon} size={24} color={colors.primary} />
          <View style={styles.itemDetails}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.itemTime, { color: colors.textSecondary }]}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item.id)}
          >
            <Text style={styles.deleteIcon}>×</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="document-text-outline"
        size={48}
        color={colors.textSecondary}
      />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No scan history yet
      </Text>
      <CustomButton
        title="New Scan"
        icon="camera"
        onPress={() => navigation.navigate(ROUTES.CAMERA_SCAN)}
        style={styles.scanButton}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={historyItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={isLoading ? null : renderEmptyList()}
      />
      
      {historyItems.length > 0 && (
        <View style={styles.buttonContainer}>
          <CustomButton
            title="New Scan"
            icon="add-circle"
            onPress={() => navigation.navigate(ROUTES.CAMERA_SCAN)}
            style={styles.newScanButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  historyItem: {
    borderRadius: 12,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  itemTime: {
    fontSize: FONT_SIZES.sm,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 24,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    marginTop: SPACING.md,
  },
  scanButton: {
    backgroundColor: '#3498db',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  newScanButton: {
    backgroundColor: '#3498db',
  },
});