import { RootState } from '@core/store/store';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AboutScreen from '@screens/AboutScreen/AboutScreen';
import SignInScreen from '@screens/SignInScreen/SignInScreen';
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import CowRoute from './CowRoute/CowRoute';
import TaskScreen from '@screens/TaskScreen/TaskScreen';
import QrScanRoute from './QrScanRoute/QrScanRoute';
import ProfileManagementRoute from './ProfileManagementRoute/ProfileManagementRoute';
import { COLORS } from '@common/GlobalStyle';
import TaskManagementRoute from './TaskManagementRoute/TaskManagementRoute';
import { useNotifications } from '@services/Notification/Notification';
import NotificationScreen from '@screens/NotificationScreen/NotificationScreen';
import apiClient from '@config/axios/axios';
import { Notification } from '@model/Notification/Notification';
import { useQuery } from 'react-query';

type RootStackParamList = {
  Home: undefined;
  Notification: undefined;
  Profile: undefined;
  Login: undefined;
  Task: undefined;
  QRScan: undefined;
  Welcome: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const fetchNotification = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get('/notifications/myNotification');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.message || 'An error occurred while fetching the data'
    );
  }
};

const CustomTabBarButton = ({ children, onPress, roleColors }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        top: -22,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: roleColors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 5,
          elevation: 5,
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
};

// Wrapper component to handle notifications
const NavigationWrapper = () => {
  const { data: myNotificationData } = useQuery<Notification[]>(
    'notifications/myNotification',
    fetchNotification
  );
  const navigation = useNavigation();
  const { isAuthenticated, roleName } = useSelector(
    (state: RootState) => state.auth
  );

  // Initialize notifications using the custom hook
  useNotifications({ navigation });

  // Determine role-based colors
  const isVeterinarian = roleName?.toLowerCase() === 'veterinarians';
  const roleColors = isVeterinarian ? COLORS.veterinarian : COLORS.worker;

  if (!isAuthenticated && roleName === 'Manager') {
    Alert.alert('Error', 'You are not authorized to access this page.');
    return null;
  }

  return isAuthenticated ? (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        lazy: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundLayout,
          height: 65,
          shadowColor: '#000',
          shadowOpacity: 0.1,
        },
        tabBarIcon: ({ size, focused }) => {
          let iconName = 'home';
          if (route.name === 'Notification') iconName = 'notifications';
          if (route.name === 'Profile') iconName = 'person';
          if (route.name === 'Task') iconName = 'checkbox';

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={focused ? roleColors.primary : roleColors.inactive}
            />
          );
        },
        unmountOnBlur: true,
        tabBarActiveTintColor: roleColors.primary,
        tabBarInactiveTintColor: roleColors.inactive,
      })}
    >
      <Tab.Screen name="Home" component={CowRoute} key={'Home'} />
      <Tab.Screen name="Task" component={TaskManagementRoute} key={'Task'} />
      <Tab.Screen
        name="QRScan"
        component={QrScanRoute}
        options={{
          tabBarLabel: '',
          tabBarActiveTintColor: '#333',
          tabBarInactiveTintColor: 'gray',
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              style={{ marginTop: 1 }}
              name="qr-code"
              size={size + 4}
              color={focused ? '#fff' : '#f8f8f8'}
            />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} roleColors={roleColors} />
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        key={'Notification'}
        component={NotificationScreen}
        options={{
          tabBarBadge:
            myNotificationData &&
            myNotificationData?.filter((element) => element.read === false)
              ?.length > 0
              ? myNotificationData?.filter((element) => element.read === false)
                  ?.length
              : undefined,
          tabBarBadgeStyle: {
            backgroundColor: 'red',
            color: 'white',
            width: 'auto',
            height: 17,
            fontSize: 12,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        key={'Profile'}
        component={ProfileManagementRoute}
      />
    </Tab.Navigator>
  ) : (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={SignInScreen} />
    </Stack.Navigator>
  );
};

export const Routes: React.FC = () => {
  return (
    <NavigationContainer>
      <NavigationWrapper />
    </NavigationContainer>
  );
};
