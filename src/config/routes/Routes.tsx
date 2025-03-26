import { RootState } from '@core/store/store';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AboutScreen from '@screens/AboutScreen/AboutScreen';
import SignInScreen from '@screens/SignInScreen/SignInScreen';
import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import CowRoute from './CowRoute/CowRoute';
import TaskScreen from '@screens/TaskScreen/TaskScreen';
import QrScanRoute from './QrScanRoute/QrScanRoute';
import ProfileManagementRoute from './ProfileManagementRoute/ProfileManagementRoute';
import { COLORS } from '@common/GlobalStyle';
import TaskManagementRoute from './TaskManagementRoute/TaskManagementRoute';
import { useNotifications } from '@services/Notification/Notification';

type RootStackParamList = {
  Home: undefined;
  About: undefined;
  Profile: undefined;
  Login: undefined;
  Task: undefined;
  QRScan: undefined;
  Welcome: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

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
  const navigation = useNavigation();
  const { isAuthenticated, roleName } = useSelector((state: RootState) => state.auth);

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
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundLayout,
          height: 65,
          shadowColor: '#000',
          shadowOpacity: 0.1,
        },
        tabBarIcon: ({ size, focused }) => {
          let iconName = 'home';
          if (route.name === 'About') iconName = 'information-circle';
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
        tabBarActiveTintColor: roleColors.primary,
        tabBarInactiveTintColor: roleColors.inactive,
      })}
    >
      <Tab.Screen name='Home' component={CowRoute} />
      <Tab.Screen name='Task' component={TaskManagementRoute} />
      <Tab.Screen
        name='QRScan'
        component={QrScanRoute}
        options={{
          tabBarLabel: '',
          tabBarActiveTintColor: '#333',
          tabBarInactiveTintColor: 'gray',
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              style={{ marginTop: 1 }}
              name='qr-code'
              size={size + 4}
              color={focused ? '#fff' : '#f8f8f8'}
            />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} roleColors={roleColors} />,
        }}
      />
      <Tab.Screen name='About' component={AboutScreen} />
      <Tab.Screen name='Profile' component={ProfileManagementRoute} />
    </Tab.Navigator>
  ) : (
    <Stack.Navigator>
      <Stack.Screen name='Login' component={SignInScreen} />
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
