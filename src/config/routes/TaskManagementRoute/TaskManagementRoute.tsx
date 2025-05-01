import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AreaDetailScreen from '@screens/AreaManagementScreen/components/Detail/AreaDetailScreen';
import DetailCow from '@screens/CowManagementScreen/components/DetailCow/DetailCow';
import IllnessDetailForm from '@screens/HealthRecord/components/CowHealthRecordScreen/components/IllnessCowRecordScreen/components/IllnessDetail/components/IllnessDetailForm';
import IllnessReportForm from '@screens/HealthRecord/components/CowHealthRecordScreen/components/IllnessCowRecordScreen/components/IllnessReportForm/IllnessReportForm';
import IllnessCowRecordScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/components/IllnessCowRecordScreen/IllnessCowRecordScreen';
import IllnessPlanScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/components/IllnessPlanScreen/IllnessPlanScreen';
import InjectionScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/components/InjectionScreen/InjectionScreen';
import ReportTaskDetail from '@screens/TaskScreen/ReportTask/components/ReportTaskDetail/ReportTaskDetail';
import ReportTaskForm from '@screens/TaskScreen/ReportTask/components/ReportTaskForm/ReportTaskForm';
import Materials from '@screens/TaskScreen/TaskDetail/components/Materials';
import TaskDetail from '@screens/TaskScreen/TaskDetail/TaskDetail';
import TaskScreen from '@screens/TaskScreen/TaskScreen';
import { t } from 'i18next';
import MilkBatchManagementScreen from '@screens/MilkBatchManagementScreen/MilkBatchManagementScreen';
import DetailMilkBatch from '@screens/MilkBatchManagementScreen/components/DetailMilkBatch/DetailMilkBatch';
import QrCodeScanCow from '@screens/MilkBatchManagementScreen/components/CreateMilkBatch/components/QrCodeScanCow/QrCodeScanCow';
import DetailFormMilk from '@screens/MilkBatchManagementScreen/components/CreateMilkBatch/components/DetailFormMilk/DetailFormMilk';
import CreateMilkBatch from '@screens/MilkBatchManagementScreen/components/CreateMilkBatch/CreateMilkBatch';
import HomeScreen from '@screens/HomeScreen/HomeScreen';
import MyExportItemScreen from '@screens/MyExportItemScreen/MyExportItemScreen';

const Stack = createNativeStackNavigator();

const TaskManagementRoute: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName='TaskScreen'>
      <Stack.Screen
        name='Home'
        component={TaskScreen}
        options={{ title: t('task_management.title'), headerShown: false }}
      />
      <Stack.Screen
        name='TaskScreen'
        component={TaskScreen}
        options={{ title: t('task_management.title'), headerShown: false }}
      />
      <Stack.Screen
        name='TaskDetail'
        component={TaskDetail}
        options={{
          title: t('task_management.detail', { defaultValue: 'Task Detail' }),
        }}
      />
      <Stack.Screen
        name='ReportTaskForm'
        component={ReportTaskForm}
        options={{
          title: t('task_management.Report_Task_Form', {
            defaultValue: 'Report Task Form',
          }),
        }}
      />
      <Stack.Screen
        name='ReportTaskDetail'
        component={ReportTaskDetail}
        options={{
          title: t('task_management.Report_Task_Detail', {
            defaultValue: 'Report Task Detail',
          }),
        }}
      />
      <Stack.Screen
        name='IllnessReportForm'
        component={IllnessReportForm}
        options={{
          title: t('illness.title', {
            defaultValue: 'Illness',
          }),
        }}
      />
      <Stack.Screen
        name='InjectionScreen'
        component={InjectionScreen}
        options={{
          title: t('injections.title', {
            defaultValue: 'Injection',
          }),
        }}
      />
      <Stack.Screen
        name='IllnessDetailForm'
        component={IllnessDetailForm}
        options={{
          title: t('illness_detail.edit_subtitle', {
            defaultValue: 'Edit Illness Detail',
          }),
        }}
      />
      <Stack.Screen
        name='MyExportItemScreen'
        component={MyExportItemScreen}
        options={{ title: t('export_item.title', { defaultValue: 'Export Item' }) }}
      />
      <Stack.Screen
        name='IllnessCowRecordScreen'
        component={IllnessCowRecordScreen}
        options={{
          title: t('illness.Illness Cow Record', {
            defaultValue: 'Illness Cow Record',
          }),
        }}
      />
      <Stack.Screen
        name='Materials'
        component={Materials}
        options={{
          title: t('materials.titleName', { defaultValue: 'Materials' }),
        }}
      />
      <Stack.Screen
        name='AreaDetail'
        component={AreaDetailScreen}
        options={{ title: t('Area Details') }}
      />
      <Stack.Screen
        name='CowDetails'
        component={DetailCow}
        options={{ title: t('viewCowDetail', { defaultValue: 'Cow Details' }) }}
      />
      <Stack.Screen
        name='IllnessPlanScreen'
        component={IllnessPlanScreen}
        options={{ title: t('Illness Treatment Plan') }}
      />
      <Stack.Screen
        name='MilkBatchManagementScreen'
        component={MilkBatchManagementScreen}
        options={{
          title: t('milk_batch_management.title', { defaultValue: 'Milk Batch Management' }),
        }}
      />
      <Stack.Screen
        name='MilkBatchDetail'
        component={DetailMilkBatch}
        options={{ title: t('milk_batch_detail.title', { defaultValue: 'Milk Batch Detail' }) }}
      />
      <Stack.Screen
        name='DetailFormMilk'
        component={DetailFormMilk}
        options={{ title: t('daily_milk_form.title', { defaultValue: 'Daily Milk Form' }) }}
      />
      <Stack.Screen
        name='CreateMilkBatch'
        component={CreateMilkBatch}
        options={{ title: t('create_milk_batch.title', { defaultValue: 'Create Milk Batch' }) }}
      />
      <Stack.Screen
        name='QrCodeScanCow'
        component={QrCodeScanCow}
        options={{
          title: t('qr_scan_cow_milk.title', { defaultValue: 'Scan Cow for Milk Batch' }),
        }}
      />
    </Stack.Navigator>
  );
};

export default TaskManagementRoute;
