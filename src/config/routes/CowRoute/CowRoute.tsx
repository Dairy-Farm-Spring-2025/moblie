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
import CowHealthInforScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/CowHealthInforScreen';
import HealthRecordFormScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/components/HealthRecordFormScreen/HealthRecordFormScreen';
import IllnessCowRecordScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/components/IllnessCowRecordScreen/IllnessCowRecordScreen';
import IllnessDetailForm from '@screens/HealthRecord/components/CowHealthRecordScreen/components/IllnessCowRecordScreen/components/IllnessDetail/components/IllnessDetailForm';
import IllnessDetailPlanForm from '@screens/HealthRecord/components/CowHealthRecordScreen/components/IllnessCowRecordScreen/components/IllnessDetail/components/IllnessDetailPlanForm';
import FarmLayoutScreen from '@components/FarmLayout/FarmLayout';
import IllnessReportForm from '@screens/HealthRecord/components/CowHealthRecordScreen/components/IllnessCowRecordScreen/components/IllnessReportForm/IllnessReportForm';
import { t } from 'i18next';
import FeedManagementScreen from '@screens/FeedManagementScreen/FeedManagementScreen';
import FeedDetailScreen from '@screens/FeedManagementScreen/components/DetailFeed/FeedDetailScreen';
import MyExportItemScreen from '@screens/MyExportItemScreen/MyExportItemScreen';
import InjectionScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/components/InjectionScreen/InjectionScreen';
import MyApplicationScreen from '@screens/ApplicationScreen/MyApplicationScreen/MyApplicationScreen';
import CreateApplicationScreen from '@screens/ApplicationScreen/CreateApplicationScreen/CreateApplicationScreen';

const Stack = createNativeStackNavigator();

const CowRoute: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="FarmLayout" component={FarmLayoutScreen} />
      <Stack.Screen
        name="CowManagementScreen"
        component={CowManagementScreen}
        options={{ title: 'Cow Management' }}
      />
      <Stack.Screen
        name="CowDetails"
        component={DetailCow}
        options={{ title: 'Cow Details' }}
      />
      <Stack.Screen
        name="CreateCowScreen"
        component={CreateCow}
        options={{ title: 'Create Cow' }}
      />
      <Stack.Screen
        name="AreaManagementScreen"
        component={AreaManagementScreen}
        options={{ title: 'Area Management' }}
      />
      <Stack.Screen
        name="AreaDetail"
        component={AreaDetailScreen}
        options={{ title: 'Area Details' }}
      />
      <Stack.Screen
        name="PenManagementScreen"
        component={PenManagementScreen}
        options={{ title: 'Pen Management' }}
      />
      <Stack.Screen
        name="PenDetailScreen"
        component={PenDetailScreen}
        options={{ title: 'Pen Details' }}
      />
      <Stack.Screen
        name="MilkBatchManagementScreen"
        component={MilkBatchManagementScreen}
        options={{ title: 'Milk Batch Management' }}
      />
      <Stack.Screen
        name="MilkBatchDetail"
        component={DetailMilkBatch}
        options={{ title: 'Milk Batch Details' }}
      />
      <Stack.Screen
        name="QrCodeScanCow"
        component={QrCodeScanCow}
        options={{ title: 'Scan Cow for Milk Batch' }}
      />
      <Stack.Screen
        name="DetailFormMilk"
        component={DetailFormMilk}
        options={{ title: 'Daily Milk Form' }}
      />
      <Stack.Screen
        name="CreateMilkBatch"
        component={CreateMilkBatch}
        options={{ title: 'Create Milk Batch' }}
      />
      <Stack.Screen
        name="HealthRecordScreen"
        component={HealthRecordScreen}
        options={{ title: 'Health Record' }}
      />
      <Stack.Screen
        name="GeneralQrScanCow" // Renamed to avoid confusion with QrCodeScanCow
        component={QrScanCow}
        options={{ title: 'General Scan Cow' }}
      />
      <Stack.Screen
        name="CowHealthRecord"
        component={CowHealthRecord}
        options={{ title: 'Cow Health Record' }}
      />
      <Stack.Screen
        name="CowHealthInforScreen"
        component={CowHealthInforScreen}
        options={{ title: 'Timeline Health Record' }}
      />
      <Stack.Screen
        name="HealthRecordFormScreen"
        component={HealthRecordFormScreen}
        options={{ title: 'Health Record Form' }}
      />
      <Stack.Screen
        name="IllnessCowRecordScreen"
        component={IllnessCowRecordScreen}
        options={{ title: 'Illness Cow Record' }}
      />
      <Stack.Screen
        name="IllnessDetailForm"
        component={IllnessDetailForm}
        options={{ title: 'Illness Detail' }}
      />
      <Stack.Screen
        name="IllnessDetailPlanForm"
        component={IllnessDetailPlanForm}
        options={{ title: 'Illness Detail Plan' }}
      />
      <Stack.Screen
        name="FeedManagementScreen"
        component={FeedManagementScreen}
        options={{ title: t('feed.title') }}
      />
      <Stack.Screen
        name="FeedDetailScreen"
        component={FeedDetailScreen}
        options={{ title: t('feed.title_detail') }}
      />
      <Stack.Screen
        name="MyExportItemScreen"
        component={MyExportItemScreen}
        options={{ title: t('export_item.title') }}
      />
      <Stack.Screen
        name="IllnessReportForm"
        component={IllnessReportForm}
        options={{
          title: t('illness.title', {
            defaultValue: 'Illness',
          }),
        }}
      />
      <Stack.Screen
        name="InjectionScreen"
        component={InjectionScreen}
        options={{
          title: t('injections.title', {
            defaultValue: 'Injection',
          }),
        }}
      />
      <Stack.Screen
        name="ViewApplicationScreen"
        component={MyApplicationScreen}
        options={{
          title: t('application.titleView', {
            defaultValue: 'View my application',
          }),
        }}
      />
      <Stack.Screen
        name="CreateApplicationScreen"
        component={CreateApplicationScreen}
        options={{
          title: t('application.titleCreate', {
            defaultValue: 'Create application',
          }),
        }}
      />
    </Stack.Navigator>
  );
};

export default CowRoute;
