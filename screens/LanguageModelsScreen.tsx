import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const LANGUAGE_MODELS = [
  { code: 'eng', name: 'English' },
  { code: 'swa', name: 'Swahili' },
  { code: 'fra', name: 'French' },
  { code: 'spa', name: 'Spanish' },
];

const LanguageModelsScreen = () => {
  const { colors } = useTheme();

  const handleDownload = (model: string) => {
    Alert.alert('Download', `Downloading model: ${model}`);
  };

  const handleDelete = (model: string) => {
    Alert.alert('Delete', `Deleting model: ${model}`);
  };

  return (
    <ScreenTemplate title="Language Models" isStandalone>
      <FlatList
        data={LANGUAGE_MODELS}
        keyExtractor={item => item.code}
        renderItem={({ item }) => (
          <View style={[styles.modelRow, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.modelName, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDownload(item.name)}>
                <Ionicons name="cloud-download-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.name)}>
                <Ionicons name="trash-outline" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modelName: {
    fontSize: 18,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
});

export default LanguageModelsScreen; 