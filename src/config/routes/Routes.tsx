import { RootState } from '@core/store/store';
import {
  faHome,
  faInfoCircle,
  faUser,
  faListCheck,
  faQrcode,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
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
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: roleColors.primary, // Use role-specific primary color
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

export const Routes: React.FC = () => {
  const { isAuthenticated, roleName } = useSelector((state: RootState) => state.auth);

  // Determine role-based colors
  const isVeterinarian = roleName?.toLowerCase() === 'veterinarians';
  const roleColors = isVeterinarian ? COLORS.veterinarian : COLORS.worker;
  if (!isAuthenticated && roleName === 'Manager') {
    Alert.alert('Error', 'You are not authorized to access this page.');
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: COLORS.backgroundLayout, // White background
              height: 65,
              shadowColor: '#000',
              shadowOpacity: 0.1,
            },
            tabBarIcon: ({ size, focused }) => {
              let icon = faHome;
              if (route.name === 'About') icon = faInfoCircle;
              if (route.name === 'Profile') icon = faUser;
              if (route.name === 'Task') icon = faListCheck;

              return (
                <FontAwesomeIcon
                  icon={icon}
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
          <Tab.Screen name='Task' component={TaskScreen} />
          <Tab.Screen
            name='QRScan'
            component={QrScanRoute}
            options={{
              tabBarLabel: '',
              tabBarActiveTintColor: '#333',
              tabBarInactiveTintColor: 'gray',
              tabBarIcon: ({ size, focused }) => (
                <FontAwesomeIcon
                  style={{ marginTop: 10 }}
                  icon={faQrcode}
                  size={size + 8}
                  color={focused ? '#fff' : '#f8f8f8'} // White when focused, light gray when inactive
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
      )}
    </NavigationContainer>
  );
};
