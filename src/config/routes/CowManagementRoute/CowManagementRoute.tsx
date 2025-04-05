import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateCow from '@screens/CowManagementScreen/components/CreateCow/CreateCow';
import DetailCow from '@screens/CowManagementScreen/components/DetailCow/DetailCow';
import CowManagementScreen from '@screens/CowManagementScreen/CowManagementScreen';
import CowHealthInforScreen from '@screens/HealthRecord/components/CowHealthRecordScreen/CowHealthInforScreen';

const Stack = createNativeStackNavigator();

const CowManagementRoute: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName='CowDetails'>
      <Stack.Screen name='CowDetails' component={DetailCow} options={{ title: 'Cow Details' }} />
      <Stack.Screen
        name='CowHealthInforScreen'
        component={CowHealthInforScreen}
        options={{ title: 'Timeline Health Record' }}
      />
    </Stack.Navigator>
  );
};

export default CowManagementRoute;
