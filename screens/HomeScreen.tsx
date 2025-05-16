import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ROUTES from '../constants/routes';
import CustomButton from '../components/CustomButton';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, typeof ROUTES.HOME>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/ocr-icon.png')} 
          style={styles.logo}
          // If the image doesn't exist yet, you'll need to add it to your assets folder
          // or replace with a different image
        />
        <Text style={styles.title}>OCR Scanner</Text>
        <Text style={styles.subtitle}>Convert images to text instantly</Text>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton 
          title="Scan Document" 
          icon="camera"
          onPress={() => navigation.navigate(ROUTES.CAMERA_SCAN)}
          style={styles.primaryButton}
        />
        
        <CustomButton 
          title="Upload Image" 
          icon="image"
          onPress={() => navigation.navigate(ROUTES.UPLOAD)}
          style={styles.secondaryButton}
        />
        
        <CustomButton 
          title="View History" 
          icon="time-outline"
          onPress={() => navigation.navigate(ROUTES.HISTORY)}
          style={styles.tertiaryButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by OCR Technology</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#3498db',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: '#2ecc71',
    marginBottom: 16,
  },
  tertiaryButton: {
    backgroundColor: '#9b59b6',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 10,
  },
  footerText: {
    color: '#888',
    fontSize: 12,
  },
});