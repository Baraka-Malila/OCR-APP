import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { DrawerContent } from '../components/DrawerContent';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FONT_SIZES } from '../constants/theme';

// Import your screens here
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PremiumScreen from '../screens/PremiumScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import TermsScreen from '../screens/TermsScreen';
import LicensesScreen from '../screens/LicensesScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CameraScanScreen from '../screens/CameraScanScreen';

const Drawer = createDrawerNavigator();

const CustomHeader = ({ navigation }: { navigation: any }) => {
  const { colors } = useTheme();
  
  return (
    <SafeAreaView style={{ backgroundColor: colors.background }}>
      <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          OCRsnap
        </Text>
        
        <TouchableOpacity onPress={() => navigation.navigate('Premium')}>
          <Ionicons name="diamond" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export const AppNavigator = () => {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          header: (props) => <CustomHeader {...props} />,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          drawerStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="History" component={HistoryScreen} options={{ title: 'View History' }} />
        <Drawer.Screen name="Result" component={ResultScreen} options={{ title: 'OCR Result' }} />
        <Drawer.Screen name="CameraScan" component={CameraScanScreen} options={{ title: 'Scan Document' }} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="Premium" component={PremiumScreen} />
        <Drawer.Screen name="Privacy" component={PrivacyScreen} />
        <Drawer.Screen name="Terms" component={TermsScreen} />
        <Drawer.Screen name="Licenses" component={LicensesScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
});