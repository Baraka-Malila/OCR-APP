import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

const PrivacyScreen = () => {
  const { colors } = useTheme();

  return (
    <ScreenTemplate title="Privacy Policy">
      <Text style={[styles.paragraph, { color: colors.text }]}>
        Last updated: May 2024
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        1. Information We Collect
      </Text>
      <Text style={[styles.paragraph, { color: colors.text }]}>
        We collect information that you provide directly to us when using the OCR app,
        including scanned documents and images. We do not store your scanned content
        on our servers unless you explicitly choose to use our cloud storage feature.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        2. How We Use Your Information
      </Text>
      <Text style={[styles.paragraph, { color: colors.text }]}>
        We use the information we collect to provide and improve our OCR services,
        develop new features, and protect our users. Your data is processed locally
        on your device unless you opt to use cloud features.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        3. Data Security
      </Text>
      <Text style={[styles.paragraph, { color: colors.text }]}>
        We implement appropriate technical and organizational measures to protect
        your personal information against unauthorized or unlawful processing,
        accidental loss, destruction, or damage.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        4. Your Rights
      </Text>
      <Text style={[styles.paragraph, { color: colors.text }]}>
        You have the right to access, correct, or delete your personal information.
        You can also choose to opt out of certain data collection features through
        the app settings.
      </Text>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  paragraph: {
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
});

export default PrivacyScreen; 