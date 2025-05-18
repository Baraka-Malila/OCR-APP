import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

type DrawerItemProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

const DrawerItem: React.FC<DrawerItemProps> = ({ label, icon, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.drawerItem]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color={colors.text} style={styles.icon} />
      <Text style={[styles.drawerItemText, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export const DrawerContent = (props: any) => {
  const { colors } = useTheme();

  const handleSocialLink = (platform: string) => {
    // Replace with actual social media links
    const links = {
      instagram: 'https://instagram.com/yourapp',
      twitter: 'https://twitter.com/yourapp',
      youtube: 'https://youtube.com/yourapp',
    };
    Linking.openURL(links[platform as keyof typeof links]);
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.drawerContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <DrawerItem
            label="Settings"
            icon="settings-outline"
            onPress={() => props.navigation.navigate('Settings')}
          />
          <DrawerItem
            label="History"
            icon="time-outline"
            onPress={() => props.navigation.navigate('History')}
          />
          <DrawerItem
            label="Rate Us"
            icon="star-outline"
            onPress={() => Linking.openURL('market://details?id=com.ocrsnap')}
          />
          <DrawerItem
            label="OCR Premium"
            icon="diamond-outline"
            onPress={() => props.navigation.navigate('Premium')}
          />
          <DrawerItem
            label="Share App"
            icon="share-outline"
            onPress={() => {/* Implement share functionality */}}
          />
          <DrawerItem
            label="Our Other Apps"
            icon="apps-outline"
            onPress={() => {/* Navigate to other apps */}}
          />
          <DrawerItem
            label="Send Us Feedback"
            icon="mail-outline"
            onPress={() => {/* Implement feedback functionality */}}
          />
          <DrawerItem
            label="Privacy Policy"
            icon="shield-outline"
            onPress={() => props.navigation.navigate('Privacy')}
          />
          <DrawerItem
            label="Terms of Service"
            icon="document-text-outline"
            onPress={() => props.navigation.navigate('Terms')}
          />
          <DrawerItem
            label="Open Source Licenses"
            icon="code-slash-outline"
            onPress={() => props.navigation.navigate('Licenses')}
          />

          <View style={styles.socialSection}>
            <Text style={[styles.socialTitle, { color: colors.textSecondary }]}>
              Follow Us
            </Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity
                onPress={() => handleSocialLink('instagram')}
                style={styles.socialIcon}
              >
                <Ionicons name="logo-instagram" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSocialLink('twitter')}
                style={styles.socialIcon}
              >
                <Ionicons name="logo-twitter" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSocialLink('youtube')}
                style={styles.socialIcon}
              >
                <Ionicons name="logo-youtube" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  drawerItemText: {
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.md,
  },
  icon: {
    width: 24,
  },
  socialSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  socialTitle: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: SPACING.lg,
  },
  socialIcon: {
    padding: SPACING.xs,
  },
}); 