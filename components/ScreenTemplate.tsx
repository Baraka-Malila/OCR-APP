import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type ScreenTemplateProps = {
  title: string;
  children?: React.ReactNode;
  isStandalone?: boolean;
  onBack?: () => void;
};

export const ScreenTemplate: React.FC<ScreenTemplateProps> = ({
  title,
  children,
  isStandalone = false,
  onBack,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[
        styles.header,
        isStandalone && styles.standaloneHeader
      ]}>
        {isStandalone ? (
          <>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          </>
        )}
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'transparent',
  },
  standaloneHeader: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + SPACING.xl : SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  menuButton: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    flex: 1,
  },
}); 