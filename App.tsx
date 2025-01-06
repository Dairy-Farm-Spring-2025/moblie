import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './src/screens/Home';
import About from './src/screens/About';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faInfoCircle, faGear } from '@fortawesome/free-solid-svg-icons';
import Settings from './src/screens/Settings';

type RootStackParamList = {
  Home: undefined;
  About: undefined; // Add this line
};

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let icon = faHome;

            if (route.name === 'Home') {
              icon = faHome;
            } else if (route.name === 'About') {
              icon = faInfoCircle;
            } else if (route.name === 'Settings') {
              icon = faGear;
            }

            return <FontAwesomeIcon icon={icon} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007BFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name='Home' component={Home} />
        <Tab.Screen name='About' component={About} />
        <Tab.Screen name='Settings' component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
