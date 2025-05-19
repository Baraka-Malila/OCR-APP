import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ROUTES from '../constants/routes';
import { ScreenTemplate } from '../components/ScreenTemplate';
import CustomButton from '../components/CustomButton';
import { getAllOCRResults, deleteOCRResult, OCRResult } from '../services/storageService';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

type HistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  typeof ROUTES.HISTORY
>;

const HistoryScreen = () => {
  const { colors } = useTheme();
  const [history, setHistory] = useState<OCRResult[]>([]);
  const navigation = useNavigation<HistoryScreenNavigationProp>();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const results = await getAllOCRResults();
    setHistory(results.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteOCRResult(id);
            loadHistory();
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: OCRResult }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: colors.background }]}
      onPress={() => navigation.navigate('Result', {
        imageUri: item.imageUri,
        recognizedText: item.text,
        timestamp: item.timestamp,
      })}
    >
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      <View style={styles.itemContent}>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        <Text 
          style={[styles.preview, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.text}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={24} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScreenTemplate title="View History" isStandalone>
      {history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No scan history yet
          </Text>
        </View>
      )}
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: SPACING.md,
  },
  historyItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
  },
  timestamp: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  preview: {
    fontSize: FONT_SIZES.md,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
  },
});

export default HistoryScreen;