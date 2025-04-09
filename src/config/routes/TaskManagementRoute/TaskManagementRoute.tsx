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

const Stack = createNativeStackNavigator();

const TaskManagementRoute: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName='TaskScreen'>
      <Stack.Screen
        name='TaskScreen'
        component={TaskScreen}
        options={{ title: t('task_management.title'), headerShown: false }}
      />
      <Stack.Screen
        name='TaskDetail'
        component={TaskDetail}
        options={{ title: t('task_management.detail', { defaultValue: 'Task Detail' }) }}
      />
      <Stack.Screen
        name='ReportTaskForm'
        component={ReportTaskForm}
        options={{ title: 'Report Task Form' }}
      />
      <Stack.Screen
        name='ReportTaskDetail'
        component={ReportTaskDetail}
        options={{ title: 'Report Task' }}
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
        options={{ title: 'Edit Illness Detail' }}
      />
      <Stack.Screen
        name='IllnessCowRecordScreen'
        component={IllnessCowRecordScreen}
        options={{ title: 'Illness Cow Record' }}
      />
      <Stack.Screen name='Materials' component={Materials} options={{ title: 'Materials' }} />
      <Stack.Screen
        name='AreaDetail'
        component={AreaDetailScreen}
        options={{ title: 'Area Details' }}
      />
      <Stack.Screen name='CowDetails' component={DetailCow} options={{ title: 'Detail Cow' }} />
      <Stack.Screen
        name='IllnessPlanScreen'
        component={IllnessPlanScreen}
        options={{ title: 'Illness Plan' }}
      />
    </Stack.Navigator>
  );
};

export default TaskManagementRoute;
