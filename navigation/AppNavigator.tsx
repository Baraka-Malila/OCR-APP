import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import ROUTES from '../constants/routes';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CameraScanScreen from '../screens/CameraScanScreen';
import UploadScreen from '../screens/UploadScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';

// Define the type for our stack navigation parameters
export type RootStackParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.CAMERA_SCAN]: undefined;
  [ROUTES.UPLOAD]: undefined;
  [ROUTES.RESULT]: { 
    imageUri: string; 
    recognizedText: string;
    timestamp: number;
  };
  [ROUTES.HISTORY]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName={ROUTES.HOME}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name={ROUTES.HOME} 
          component={HomeScreen}
          options={{ title: 'OCR Scanner' }}
        />
        <Stack.Screen 
          name={ROUTES.CAMERA_SCAN} 
          component={CameraScanScreen} 
          options={{ title: 'Scan Document' }}
        />
        <Stack.Screen 
          name={ROUTES.UPLOAD} 
          component={UploadScreen}
          options={{ title: 'Upload Image' }}
        />
        <Stack.Screen 
          name={ROUTES.RESULT} 
          component={ResultScreen}
          options={{ title: 'OCR Result' }}
        />
        <Stack.Screen 
          name={ROUTES.HISTORY} 
          component={HistoryScreen}
          options={{ title: 'Scan History' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}