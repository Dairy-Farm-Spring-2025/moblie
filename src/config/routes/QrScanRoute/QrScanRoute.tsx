import QrCodeScan from '@components/QrCodeScan/QrCodeScan';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetailCow from '@screens/CowManagementScreen/components/DetailCow/DetailCow';
import CowManagementRoute from '../CowManagementRoute/CowManagementRoute';

const Stack = createNativeStackNavigator();

const QrScanRoute: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName='QrCodeScan'>
      <Stack.Screen name='QrCodeScan' component={QrCodeScan} options={{ title: 'Qr Scan' }} />
      <Stack.Screen
        name='CowDetails'
        component={CowManagementRoute}
        options={{ title: 'Cow Details' }}
      />
    </Stack.Navigator>
  );
};

export default QrScanRoute;
