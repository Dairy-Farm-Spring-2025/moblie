import QrCodeScan from '@components/QrCodeScan/QrCodeScan';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetailCow from '@screens/CowManagementScreen/components/DetailCow/DetailCow';
import CowManagementRoute from '../CowManagementRoute/CowManagementRoute';
import CowHealthInforScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/CowHealthInforScreen';

const Stack = createNativeStackNavigator();

const QrScanRoute: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName='QrCodeScan'>
      <Stack.Screen name='QrCodeScan' component={QrCodeScan} options={{ title: 'Qr Scan' }} />
      <Stack.Screen name='CowDetails' component={DetailCow} options={{ title: 'Cow Details' }} />
      <Stack.Screen
        name='CowHealthInforScreen'
        component={CowHealthInforScreen}
        options={{ title: 'Timeline Health Record' }}
      />
    </Stack.Navigator>
  );
};

export default QrScanRoute;
