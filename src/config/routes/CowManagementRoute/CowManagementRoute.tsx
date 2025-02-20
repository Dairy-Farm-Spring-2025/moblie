import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateCow from '@screens/CowManagementScreen/components/CreateCow/CreateCow';
import DetailCow from '@screens/CowManagementScreen/components/DetailCow/DetailCow';
import CowManagementScreen from '@screens/CowManagementScreen/CowManagementScreen';

const Stack = createNativeStackNavigator();

const CowManagementRoute: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName='CowManagementScreen'>
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
    </Stack.Navigator>
  );
};

export default CowManagementRoute;
