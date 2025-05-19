import React from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

type LicenseItemProps = {
  name: string;
  version: string;
  license: string;
};

const LicenseItem: React.FC<LicenseItemProps> = ({ name, version, license }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.licenseItem, { borderColor: colors.border }]}>
      <Text style={[styles.packageName, { color: colors.text }]}>
        {name} ({version})
      </Text>
      <Text style={[styles.licenseType, { color: colors.textSecondary }]}>
        {license}
      </Text>
    </View>
  );
};

const LicensesScreen = () => {
  const { colors } = useTheme();

  return (
    <ScreenTemplate title="Open Source Licenses" isStandalone>
      <ScrollView style={styles.container}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          This app is built using open source software. We are grateful to the
          developers who have made their work available to the community.
        </Text>

        <LicenseItem
          name="react-native"
          version="0.79.2"
          license="MIT License"
        />
        <LicenseItem
          name="@react-navigation/native"
          version="7.1.9"
          license="MIT License"
        />
        <LicenseItem
          name="@react-navigation/drawer"
          version="7.3.2"
          license="MIT License"
        />
        <LicenseItem
          name="expo"
          version="53.0.9"
          license="MIT License"
        />
        <LicenseItem
          name="expo-camera"
          version="16.1.6"
          license="MIT License"
        />
        <LicenseItem
          name="@expo/vector-icons"
          version="14.1.0"
          license="MIT License"
        />
        <LicenseItem
          name="react-native-reanimated"
          version="3.8.0"
          license="MIT License"
        />
      </ScrollView>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  licenseItem: {
    borderBottomWidth: 1,
    paddingVertical: SPACING.md,
  },
  packageName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  licenseType: {
    fontSize: FONT_SIZES.sm,
  },
});

export default LicensesScreen; 