import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

const SettingsScreen = () => {
  const { colors, colorScheme, toggleColorScheme } = useTheme();

  return (
    <ScreenTemplate title="Settings">
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Dark Mode
          </Text>
          <Switch
            value={colorScheme === 'dark'}
            onValueChange={toggleColorScheme}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={colorScheme === 'dark' ? colors.secondary : '#f4f3f4'}
          />
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.xl,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
});

export default SettingsScreen; 