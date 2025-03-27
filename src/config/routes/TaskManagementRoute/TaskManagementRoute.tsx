import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportTaskDetail from '@screens/TaskScreen/ReportTask/components/ReportTaskDetail/ReportTaskDetail';
import ReportTaskForm from '@screens/TaskScreen/ReportTask/components/ReportTaskForm/ReportTaskForm';
import ReportTaskScreen from '@screens/TaskScreen/ReportTask/ReportTask';
import TaskDetail from '@screens/TaskScreen/TaskDetail/TaskDetail';
import TaskScreen from '@screens/TaskScreen/TaskScreen';

const Stack = createNativeStackNavigator();

const TaskManagementRoute: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName='TaskScreen'>
      <Stack.Screen
        name='TaskScreen'
        component={TaskScreen}
        options={{ title: 'Task', headerShown: false }}
      />
      <Stack.Screen name='TaskDetail' component={TaskDetail} options={{ title: 'Task Details' }} />
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
    </Stack.Navigator>
  );
};

export default TaskManagementRoute;
