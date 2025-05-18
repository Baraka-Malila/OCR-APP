import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenTemplate } from '../components/ScreenTemplate';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

const PremiumFeature = ({ icon, title, description }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon} size={32} color={colors.primary} />
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const PremiumScreen = () => {
  const { colors } = useTheme();

  return (
    <ScreenTemplate title="OCR Premium">
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Unlock all features with Premium
      </Text>
      
      <View style={styles.featuresContainer}>
        <PremiumFeature
          icon="infinite"
          title="Unlimited Scans"
          description="Scan as many documents as you need"
        />
        <PremiumFeature
          icon="cloud-upload"
          title="Cloud Storage"
          description="Save all your scans securely in the cloud"
        />
        <PremiumFeature
          icon="document"
          title="Batch Processing"
          description="Process multiple pages at once"
        />
        <PremiumFeature
          icon="pencil"
          title="Advanced Editing"
          description="Edit and format recognized text"
        />
      </View>

      <TouchableOpacity
        style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
        onPress={() => {/* Implement upgrade logic */}}
      >
        <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
      </TouchableOpacity>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: FONT_SIZES.lg,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: SPACING.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  featureText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: FONT_SIZES.sm,
  },
  upgradeButton: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});

export default PremiumScreen; 