import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
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

const PricingOption = ({ 
  title, 
  price, 
  period, 
  isPopular,
  isSelected,
  isLifetime,
  onSelect 
}: {
  title: string;
  price: string;
  period: string;
  isPopular?: boolean;
  isSelected?: boolean;
  isLifetime?: boolean;
  onSelect: () => void;
}) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.pricingCard,
        { 
          backgroundColor: isSelected ? colors.primary : isPopular ? colors.primary + '20' : colors.background,
          borderColor: colors.primary,
          borderWidth: isSelected ? 3 : 2,
          transform: [{ scale: isSelected ? 1.02 : 1 }],
        }
      ]}
      onPress={onSelect}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      <Text style={[
        styles.pricingTitle,
        { color: isSelected ? '#FFFFFF' : colors.text }
      ]}>{title}</Text>
      <Text style={[
        styles.price,
        { color: isSelected ? '#FFFFFF' : colors.text }
      ]}>{price}</Text>
      <Text style={[
        styles.period,
        { color: isSelected ? '#FFFFFF' : colors.textSecondary }
      ]}>{period}</Text>
      {isLifetime ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>One-time Payment</Text>
        </View>
      ) : (
        <View style={[styles.badge, { backgroundColor: colors.textSecondary }]}>
          <Text style={styles.badgeText}>Subscription</Text>
        </View>
      )}
      {isSelected && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const PremiumScreen = () => {
  const { colors } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePurchase = () => {
    // Implement purchase logic
    if (selectedPlan) {
      // Process payment
    }
  };

  return (
    <ScreenTemplate title="OCR Premium">
      <ScrollView style={styles.container}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Unlock Premium Features
        </Text>
        
        <View style={styles.featuresContainer}>
          <PremiumFeature
            icon="infinite"
            title="Unlimited Scans"
            description="No limits on document scanning"
          />
          <PremiumFeature
            icon="document"
            title="Export as DOCX & PDF"
            description="Export in multiple formats"
          />
          <PremiumFeature
            icon="cloud-upload"
            title="Cloud Storage"
            description="Secure cloud backup for all scans"
          />
          <PremiumFeature
            icon="color-wand"
            title="Advanced OCR"
            description="Enhanced accuracy and formatting"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Choose Your Plan
        </Text>
        
        <View style={styles.scrollIndicator}>
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={colors.textSecondary} 
          />
          <Text style={[styles.scrollText, { color: colors.textSecondary }]}>
            Scroll to see more plans
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.textSecondary} 
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pricingContainer}
          snapToInterval={240} // Adjusted for new card width
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / 240);
            setCurrentPage(page);
          }}
        >
          <PricingOption
            title="Weekly"
            price="$2.99"
            period="per week"
            isSelected={selectedPlan === 'weekly'}
            onSelect={() => setSelectedPlan('weekly')}
          />
          <PricingOption
            title="Monthly"
            price="$7.99"
            period="per month"
            isPopular
            isSelected={selectedPlan === 'monthly'}
            onSelect={() => setSelectedPlan('monthly')}
          />
          <PricingOption
            title="Yearly"
            price="$59.99"
            period="per year"
            isSelected={selectedPlan === 'yearly'}
            onSelect={() => setSelectedPlan('yearly')}
          />
          <PricingOption
            title="Lifetime"
            price="$149.99"
            period="one-time"
            isLifetime
            isSelected={selectedPlan === 'lifetime'}
            onSelect={() => setSelectedPlan('lifetime')}
          />
        </ScrollView>

        <View style={styles.pagination}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: currentPage === index ? colors.primary : colors.textSecondary,
                  opacity: currentPage === index ? 1 : 0.5,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.purchaseButton,
            { 
              backgroundColor: selectedPlan ? colors.primary : colors.textSecondary,
              opacity: selectedPlan ? 1 : 0.7,
            }
          ]}
          onPress={handlePurchase}
          disabled={!selectedPlan}
        >
          <Text style={styles.purchaseButtonText}>
            {selectedPlan ? (selectedPlan === 'lifetime' ? 'Purchase Now' : 'Subscribe Now') : 'Select a Plan'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          {selectedPlan === 'lifetime' 
            ? 'By purchasing, you agree to our Terms of Service. This is a one-time payment with lifetime access.'
            : 'By purchasing, you agree to our Terms of Service. Subscription will auto-renew unless canceled 24 hours before the renewal date.'}
        </Text>
      </ScrollView>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.lg,
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
  pricingContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  pricingCard: {
    width: 240,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
    marginHorizontal: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -45 }], // Half of the approximate badge width
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pricingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  period: {
    fontSize: FONT_SIZES.sm,
  },
  purchaseButton: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  terms: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  checkmark: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
  },
  scrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  scrollText: {
    fontSize: FONT_SIZES.sm,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginTop: SPACING.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
});

export default PremiumScreen; 