import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { activatePremium } from '../services/premiumService';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Instant Text Recognition',
    description: 'Transform any printed text into digital format instantly with our advanced OCR technology.',
    icon: 'scan',
  },
  {
    id: '2',
    title: 'Multi-Format Export',
    description: 'Export your scanned text in various formats including TXT, DOCX, and PDF. Perfect for all your needs.',
    icon: 'document-text',
  },
  {
    id: '3',
    title: 'Smart Processing',
    description: 'Our AI-powered engine ensures accurate text recognition across multiple languages and formats.',
    icon: 'analytics',
  },
  {
    id: '4',
    title: 'Ready to Start?',
    description: 'Choose your preferred way to experience OCRsnap - start with a 3-day free trial or unlock all features instantly.',
    icon: 'rocket',
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { colors } = useTheme();

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index });
    }
  };

  const handleFinish = async (isPro: boolean) => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      if (isPro) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'MainApp',
              params: {
                screen: 'Premium',
                params: { fromOnboarding: true }
              }
            }
          ]
        });
      } else {
        await activatePremium(3); // Activate 3-day trial
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'MainApp',
              params: {
                screen: 'Home'
              }
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const renderItem = ({ item, index }: { item: OnboardingItem; index: number }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name={item.icon} size={60} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index.toString()}
              style={[
                styles.dot,
                { 
                  width: dotWidth,
                  opacity,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      <Paginator />

      <View style={styles.bottomContainer}>
        {currentIndex < onboardingData.length - 1 ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={() => handleFinish(false)}
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => scrollTo(currentIndex + 1)}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Next</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.finalButtonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.proButton, { backgroundColor: colors.primary }]}
              onPress={() => handleFinish(true)}
            >
              <Ionicons name="diamond" size={24} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Start Like a Pro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.trialButton, { borderColor: colors.primary }]}
              onPress={() => handleFinish(false)}
            >
              <Ionicons name="time" size={24} color={colors.primary} style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: colors.primary }]}>Start Free Trial</Text>
              <Text style={[styles.trialNote, { color: colors.textSecondary }]}>
                3 days of premium features
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomContainer: {
    padding: SPACING.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  finalButtonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  proButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trialButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  trialNote: {
    position: 'absolute',
    bottom: -20,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
});

export default OnboardingScreen; 