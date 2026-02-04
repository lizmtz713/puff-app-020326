import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Auth Screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignUpScreen } from './src/screens/auth/SignUpScreen';

// Main Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { AddStrainScreen } from './src/screens/AddStrainScreen';
import { LogSessionScreen } from './src/screens/LogSessionScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MedicalScreen } from './src/screens/MedicalScreen';
import { RecommendScreen } from './src/screens/RecommendScreen';
import { ToleranceBreakScreen } from './src/screens/ToleranceBreakScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          height: 85,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Home') iconName = focused ? 'leaf' : 'leaf-outline';
          else if (route.name === 'Stats') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          
          return <Ionicons name={iconName} size={26} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Stash' }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen} 
        options={{ tabBarLabel: 'Insights' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen 
        name="AddStrain" 
        component={AddStrainScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen 
        name="LogSession" 
        component={LogSessionScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen 
        name="Medical" 
        component={MedicalScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="Recommend" 
        component={RecommendScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="ToleranceBreak" 
        component={ToleranceBreakScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>PUFF</Text>
        <Text style={styles.loadingEmoji}>🌿💨</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return user ? <MainStack /> : <AuthStack />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#059669',
  },
  loadingLogo: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 8,
  },
  loadingEmoji: {
    fontSize: 32,
    marginTop: 12,
  },
});
