import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

const TermsScreen = () => {
  const { colors } = useTheme();

  return (
    <ScreenTemplate title="Terms of Service">
      <Text style={[styles.paragraph, { color: colors.text }]}>
        Last updated: May 2024
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        1. Acceptance of Terms
      </Text>
      <Text style={[styles.paragraph, { color: colors.text }]}>
        By accessing or using the OCR app, you agree to be bound by these Terms of
        Service and all applicable laws and regulations. If you do not agree with
        any of these terms, you are prohibited from using the app.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        2. Use License
      </Text>
      <Text style={[styles.paragraph, { color: colors.text }]}>
        We grant you a limited, non-exclusive, non-transferable license to use the
        OCR app for personal or business purposes. This license does not include
        the right to modify, distribute, or create derivative works of the app.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        3. Limitations
      </Text>
      <Text style={[styles.paragraph, { color: colors.text }]}>
        You may not use the app for any illegal purposes or to violate any laws in
        your jurisdiction. You may not use the app to infringe upon any
        intellectual property rights or privacy rights of others.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        4. Premium Features
      </Text>
      <Text style={[styles.paragraph, { color: colors.text }]}>
        Some features of the app are available only to premium subscribers.
        Premium subscriptions are billed on a recurring basis. You can cancel
        your subscription at any time through your app store account settings.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        5. Disclaimer
      </Text>
      <Text style={[styles.paragraph, { color: colors.text }]}>
        The app is provided "as is" without any warranties, expressed or implied.
        We do not guarantee the accuracy of OCR results and are not responsible
        for any errors or omissions in the recognized text.
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

export default TermsScreen; 