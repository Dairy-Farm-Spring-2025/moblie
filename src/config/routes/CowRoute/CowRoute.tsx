import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CowManagementScreen from '@screens/CowManagementScreen/CowManagementScreen';
import HomeScreen from '@screens/HomeScreen/HomeScreen';
import DetailCow from '@screens/CowManagementScreen/components/DetailCow/DetailCow';
import CreateCow from '@screens/CowManagementScreen/components/CreateCow/CreateCow';
import AreaManagementScreen from '@screens/AreaManagementScreen/AreaManagementScreen';
import AreaDetailScreen from '@screens/AreaManagementScreen/components/Detail/AreaDetailScreen';
import PenManagementScreen from '@screens/PenManagementScreen/PenManagementScreen';
import MilkBatchManagementScreen from '@screens/MilkBatchManagementScreen/MilkBatchManagementScreen';
import DetailMilkBatch from '@screens/MilkBatchManagementScreen/components/DetailMilkBatch/DetailMilkBatch';
import CreateMilkBatch from '@screens/MilkBatchManagementScreen/components/CreateMilkBatch/CreateMilkBatch';
import QrCodeScanCow from '@screens/MilkBatchManagementScreen/components/CreateMilkBatch/components/QrCodeScanCow/QrCodeScanCow';

const Stack = createNativeStackNavigator();

const CowRoute: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name='CowManagementScreen' component={CowManagementScreen} />
      <Stack.Screen name='CowDetails' component={DetailCow} />
      <Stack.Screen name='CreateCowScreen' component={CreateCow} />
      <Stack.Screen name='AreaManagementScreen' component={AreaManagementScreen} />
      <Stack.Screen name='AreaDetail' component={AreaDetailScreen} />
      <Stack.Screen name='PenManagementScreen' component={PenManagementScreen} />
      <Stack.Screen name='MilkBatchManagementScreen' component={MilkBatchManagementScreen} />
      <Stack.Screen name='MilkBatchDetail' component={DetailMilkBatch} />
      <Stack.Screen name='QrCodeScanCow' component={QrCodeScanCow} />
      <Stack.Screen name='CreateMilkBatch' component={CreateMilkBatch} />

      {/* You can add more screens related to 'Cow' here in the future */}
    </Stack.Navigator>
  );
};

export default CowRoute;
