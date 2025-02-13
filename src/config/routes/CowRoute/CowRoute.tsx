import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CowManagementScreen from '@screens/CowManagementScreen/CowManagementScreen';
import HomeScreen from '@screens/HomeScreen/HomeScreen';
import DetailCow from '@screens/CowManagementScreen/components/DetailCow/DetailCow';
import CreateCow from '@screens/CowManagementScreen/components/CreateCow/CreateCow';

const Stack = createNativeStackNavigator();

const CowRoute: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name='CowManagementScreen' component={CowManagementScreen} />
      <Stack.Screen name='CowDetails' component={DetailCow} />
      <Stack.Screen name='CreateCowScreen' component={CreateCow} />

      {/* You can add more screens related to 'Cow' here in the future */}
    </Stack.Navigator>
  );
};

export default CowRoute;
