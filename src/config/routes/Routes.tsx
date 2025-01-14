import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '@screens/HomeScreen';
import AboutScreen from '@screens/AboutScreen';
import SettingsScreen from '@screens/SettingsScreen';
import SignInScreen from '@screens/SignInScreen';
import WelcomeScreen from '@screens/WelcomeScreen';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faInfoCircle, faGear } from '@fortawesome/free-solid-svg-icons';

type RootStackParamList = {
  Home: undefined;
  About: undefined;
  Settings: undefined;
  Login: undefined;
  Welcome: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

export const Routes: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = await AsyncStorage.getItem('authToken');
  //     setIsAuthenticated(!!token);
  //   };
  //   checkAuth();
  // }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              let icon = faHome;
              if (route.name === 'About') icon = faInfoCircle;
              if (route.name === 'Settings') icon = faGear;

              return <FontAwesomeIcon icon={icon} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007BFF',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name='Home' component={HomeScreen} />
          <Tab.Screen name='About' component={AboutScreen} />
          <Tab.Screen name='Settings' component={SettingsScreen} />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name='Welcome' component={WelcomeScreen} />
          <Stack.Screen name='Login' component={SignInScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
