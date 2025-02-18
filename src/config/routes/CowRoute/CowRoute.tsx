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
import DetailFormMilk from '@screens/MilkBatchManagementScreen/components/CreateMilkBatch/components/DetailFormMilk/DetailFormMilk';
import PenDetailScreen from '@screens/PenManagementScreen/components/Detail/PenDetailScreen';
import HealthRecordScreen from '@screens/HealthRecord/HealthRecordScreen';
import QrScanCow from '@components/QrScanCow/QrScanCow';
import CowHealthRecord from '@screens/HealthRecord/components/CowHealthRecord/CowHealthRecord';

const Stack = createNativeStackNavigator();

const CowRoute: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name='CowManagementScreen'
        component={CowManagementScreen}
        options={{ title: 'Cow Management' }}
      />
      <Stack.Screen name='CowDetails' component={DetailCow} options={{ title: 'Cow Details' }} />
      <Stack.Screen
        name='CreateCowScreen'
        component={CreateCow}
        options={{ title: 'Create Cow' }}
      />
      <Stack.Screen
        name='AreaManagementScreen'
        component={AreaManagementScreen}
        options={{ title: 'Area Management' }}
      />
      <Stack.Screen
        name='AreaDetail'
        component={AreaDetailScreen}
        options={{ title: 'Area Details' }}
      />
      <Stack.Screen
        name='PenManagementScreen'
        component={PenManagementScreen}
        options={{ title: 'Pen Management' }}
      />
      <Stack.Screen
        name='PenDetailScreen'
        component={PenDetailScreen}
        options={{ title: 'Pen Details' }}
      />
      <Stack.Screen
        name='MilkBatchManagementScreen'
        component={MilkBatchManagementScreen}
        options={{ title: 'Milk Batch Management' }}
      />
      <Stack.Screen
        name='MilkBatchDetail'
        component={DetailMilkBatch}
        options={{ title: 'Milk Batch Details' }}
      />
      <Stack.Screen
        name='QrCodeScanCow'
        component={QrCodeScanCow}
        options={{ title: 'Scan Cow' }}
      />
      <Stack.Screen
        name='DetailFormMilk'
        component={DetailFormMilk}
        options={{ title: 'Daily Milk Form' }}
      />
      <Stack.Screen
        name='CreateMilkBatch'
        component={CreateMilkBatch}
        options={{ title: 'Create Milk Batch' }}
      />
      <Stack.Screen
        name='HealthRecordScreen'
        component={HealthRecordScreen}
        options={{ title: 'Health Record' }}
      />
      <Stack.Screen name='QrScanCow' component={QrScanCow} options={{ title: 'Scan Cow' }} />
      <Stack.Screen
        name='CowHealthRecord'
        component={CowHealthRecord}
        options={{ title: 'Cow Health Record' }}
      />

      {/* You can add more screens related to 'Cow' here in the future */}
    </Stack.Navigator>
  );
};

export default CowRoute;
