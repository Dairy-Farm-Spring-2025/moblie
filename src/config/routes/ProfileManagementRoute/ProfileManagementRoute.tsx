import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChangePasswordScreen from '@screens/ProfileScreen/components/ChangePasswordScreen/ChangePasswordScreen';
import ProfileUpdateScreen from '@screens/ProfileScreen/components/ProfileUpdateScreen/ProfileUpdateScreen';
import ProfileScreen from '@screens/ProfileScreen/ProfileScreen';

const Stack = createNativeStackNavigator();

const ProfileManagementRoute: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName='ProfileManagementScreen'>
      <Stack.Screen
        name='ProfileManagementScreen'
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='ChangePassword'
        component={ChangePasswordScreen}
        options={{ title: 'Profile Management' }}
      />
      <Stack.Screen
        name='UpdateInfo'
        component={ProfileUpdateScreen}
        options={{ title: 'Profile Management' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileManagementRoute;
