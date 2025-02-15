import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '@screens/HomeScreen/HomeScreen';
import AboutScreen from '@screens/AboutScreen/AboutScreen';
import SignInScreen from '@screens/SignInScreen/SignInScreen';
import WelcomeScreen from '@screens/SplashScreen/WelcomeScreen';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faInfoCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthState } from '@core/store/authSlice';
import { AppDispatch, RootState } from '@core/store/store';
import ProfileScreen from '@screens/ProfileScreen/ProfileScreen';
import { Alert } from 'react-native';
import CowRoute from './CowRoute/CowRoute';

type RootStackParamList = {
  Home: undefined;
  About: undefined;
  Profile: undefined;
  Login: undefined;
  Welcome: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

export const Routes: React.FC = () => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const role = await AsyncStorage.getItem('role');
      const userId = await AsyncStorage.getItem('userId');
      const fullName = await AsyncStorage.getItem('fullName');

      dispatch(
        setAuthState({
          isAuthenticated: !!token,
          role,
          userId: userId ? parseInt(userId, 10) : null,
          fullName,
          token,
        })
      );
    };
    checkAuth();
  }, [dispatch]);

  if (!isAuthenticated && role === 'Manager') {
    Alert.alert('Error', 'You are not authorized to access this page.');
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              let icon = faHome;
              if (route.name === 'About') icon = faInfoCircle;
              if (route.name === 'Profile') icon = faUser;

              return <FontAwesomeIcon icon={icon} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007BFF',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name='Home' component={CowRoute} />
          <Tab.Screen name='About' component={AboutScreen} />
          <Tab.Screen name='Profile' component={ProfileScreen} />
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
