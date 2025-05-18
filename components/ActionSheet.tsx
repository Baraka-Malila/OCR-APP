import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';

type ActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: 'scan' | 'upload' | 'history') => void;
};

type ActionOptionProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

const ActionOption: React.FC<ActionOptionProps> = ({ label, icon, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.option, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={[styles.optionText, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
  const { colors, colorScheme } = useTheme();
  const shadows = SHADOWS[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              ...shadows.md,
            },
          ]}
        >
          <View style={styles.handle} />
          <Text style={[styles.title, { color: colors.text }]}>
            Choose an Action
          </Text>
          <ActionOption
            label="Scan Document"
            icon="scan-outline"
            onPress={() => {
              onSelectOption('scan');
              onClose();
            }}
          />
          <ActionOption
            label="Upload Image"
            icon="image-outline"
            onPress={() => {
              onSelectOption('upload');
              onClose();
            }}
          />
          <ActionOption
            label="View History"
            icon="time-outline"
            onPress={() => {
              onSelectOption('history');
              onClose();
            }}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    width: '100%',
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.md,
    fontWeight: '500',
  },
}); 