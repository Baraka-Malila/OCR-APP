import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ROUTES from '../constants/routes';
import CustomButton from '../components/CustomButton';
import { getAllOCRResults, deleteOCRResult, OCRResult } from '../services/storageService';

type HistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  typeof ROUTES.HISTORY
>;

export default function HistoryScreen() {
  const [historyItems, setHistoryItems] = useState<OCRResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<HistoryScreenNavigationProp>();

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

  const renderItem = ({ item }: { item: OCRResult }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => handleItemPress(item)}
    >
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      
      <View style={styles.itemContent}>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.textPreview} numberOfLines={2}>
          {item.recognizedText.substring(0, 100)}
          {item.recognizedText.length > 100 ? '...' : ''}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(item.id)}
      >
        <Text style={styles.deleteIcon}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No scan history found</Text>
      <Text style={styles.emptySubtext}>
        Your scanned documents will appear here
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
    <View style={styles.container}>
      <FlatList
        data={historyItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
  },
  itemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  textPreview: {
    fontSize: 14,
    color: '#333',
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
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
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