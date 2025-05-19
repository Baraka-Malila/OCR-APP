import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Linking } from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootDrawerParamList, RootStackParamList } from '../types/navigation';
import { CompositeNavigationProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { StackNavigationProp } from '@react-navigation/stack';

type PrivacyScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<RootDrawerParamList, 'Privacy'>,
  StackNavigationProp<RootStackParamList, 'MainApp' | 'Onboarding'>
>;

type PrivacyScreenRouteProp = RouteProp<RootDrawerParamList, 'Privacy'>;

const PrivacyScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<PrivacyScreenNavigationProp>();
  const route = useRoute<PrivacyScreenRouteProp>();
  const fromOnboarding = route.params?.fromOnboarding;

  const openPrivacyPolicy = () => {
    Linking.openURL('https://baraka-malila.github.io/OCR-APP-LEGAL/privacy-policy');
  };

  const handleBack = () => {
    if (fromOnboarding) {
      // Navigate back to Onboarding and trigger scroll to last slide
      navigation.getParent()?.navigate('Onboarding', {
        initialSlide: 3  // Index of the "Ready to Start?" slide
      });
    } else {
      // Normal back navigation for regular app usage
      navigation.goBack();
    }
  };

  return (
    <ScreenTemplate 
      title="Privacy Policy" 
      isStandalone
      onBack={handleBack}
    >
      <View style={styles.container}>
        <Text style={[styles.description, { color: colors.text }]}>
          Read our Privacy Policy to understand how we collect, use, and protect your data.
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={openPrivacyPolicy}
        >
          <Ionicons name="open-outline" size={24} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>View Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  icon: {
    marginRight: SPACING.md,
  },
});

export default PrivacyScreen; 