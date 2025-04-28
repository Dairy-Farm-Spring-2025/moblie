import React from 'react';
import QrCodeScan from '@components/QrCodeScan/QrCodeScan';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetailCow from '@screens/CowManagementScreen/components/DetailCow/DetailCow';
import CowManagementRoute from '../CowManagementRoute/CowManagementRoute';
import CowHealthInforScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/CowHealthInforScreen';
import { RouteProp, useRoute } from '@react-navigation/native';
import CowHealthRecord from '@screens/HealthRecord/components/CowHealthRecord/CowHealthRecord';
import HealthRecordFormScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/components/HealthRecordFormScreen/HealthRecordFormScreen';
import IllnessReportForm from '@screens/HealthRecord/components/CowHealthRecordScreen/components/IllnessCowRecordScreen/components/IllnessReportForm/IllnessReportForm';
import { t } from 'i18next';
import IllnessReportScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/components/IllnessReportScreen/IllnessReportScreen';
import { useSelector } from 'react-redux';
import { RootState } from '@core/store/store';

const Stack = createNativeStackNavigator();
type RootStackParamList = {
  QrCodeScan: { selectedField: string };
};
const QrScanRoute: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'QrCodeScan'>>();
  const selectedField = route.params?.selectedField; // L
  const { roleName } = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator initialRouteName='QrCodeScan'>
      <Stack.Screen
        name='QrCodeScan'
        options={{ title: t('scanQRCode', { defaultValue: 'Scan QR Code' }) }}
      >
        {(props) => <QrCodeScan {...props} selectedField={selectedField} roleName={roleName} />}
      </Stack.Screen>
      <Stack.Screen name='CowDetails' component={DetailCow} options={{ title: 'Cow Details' }} />
      <Stack.Screen
        name='CowHealthInforScreen'
        component={CowHealthInforScreen}
        options={{ title: 'Timeline Health Record' }}
      />
      <Stack.Screen
        name='CowHealthRecord'
        component={CowHealthRecord}
        options={{ title: t('Heath Record', { defaultValue: 'Health Record' }) }}
      />
      <Stack.Screen
        name='HealthRecordFormScreen'
        component={HealthRecordFormScreen}
        options={{ title: 'Health Record Form' }}
      />
      <Stack.Screen
        name='IllnessReportForm'
        component={IllnessReportForm}
        options={{
          title: t('illness.report', {
            defaultValue: 'Illness',
          }),
        }}
      />
      <Stack.Screen
        name='IllnessReportScreen'
        component={IllnessReportScreen}
        options={{
          title: t('illness.report', {
            defaultValue: 'Illness',
          }),
        }}
      />
    </Stack.Navigator>
  );
};

export default QrScanRoute;
