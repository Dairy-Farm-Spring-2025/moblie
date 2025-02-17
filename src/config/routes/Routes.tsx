import { RootState } from '@core/store/store';
import {
  faHome,
  faInfoCircle,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AboutScreen from '@screens/AboutScreen/AboutScreen';
import ProfileScreen from '@screens/ProfileScreen/ProfileScreen';
import SignInScreen from '@screens/SignInScreen/SignInScreen';
import React from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
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
  const { isAuthenticated, roleName } = useSelector(
    (state: RootState) => state.auth
  );
  // useEffect(() => {
  //   if (isAuthenticated === false) {
  //     (navigation as any).navigate('Login');
  //   }
  // }, [isAuthenticated]);

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
          <Tab.Screen name="Home" component={CowRoute} />
          <Tab.Screen name="About" component={AboutScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={SignInScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
