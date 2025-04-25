import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChangePasswordScreen from '@screens/ProfileScreen/components/ChangePasswordScreen/ChangePasswordScreen';
import ProfileUpdateScreen from '@screens/ProfileScreen/components/ProfileUpdateScreen/ProfileUpdateScreen';
import ProfileScreen from '@screens/ProfileScreen/ProfileScreen';
import SplashScreens from '@screens/ProfileScreen/components/ProfileUpdateScreen/components/SplashScreens/SplashScreens';
import UpdateUserInfoScan from '@screens/ProfileScreen/components/ProfileUpdateScreen/components/UpdateUserInfoScan/UpdateUserInfoScan';
import { t } from 'i18next';

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
        options={{ title: t('profile_management_route.Change_Password') }}
      />
      <Stack.Screen
        name='UpdateInfo'
        component={ProfileUpdateScreen}
        options={{
          title: t('profile_management_route.Update_Profile', { defaultValue: 'Update User Info' }),
        }}
      />
      <Stack.Screen
        name='SplashScreens'
        component={SplashScreens}
        options={{ title: 'SplashScreens' }}
      />
      <Stack.Screen
        name='UpdateUserInfoScan'
        component={UpdateUserInfoScan}
        options={{
          title: t('profile_management_route.Update_Profile', { defaultValue: 'Update User Info' }),
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileManagementRoute;
