import { COLORS } from '@common/GlobalStyle';
import apiClient from '@config/axios/axios';
import { RootState } from '@core/store/store';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@model/Notification/Notification';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationScreen from '@screens/NotificationScreen/NotificationScreen';
import SignInScreen from '@screens/SignInScreen/SignInScreen';
import { useNotifications } from '@services/Notification/Notification';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import CowRoute from './CowRoute/CowRoute';
import ProfileManagementRoute from './ProfileManagementRoute/ProfileManagementRoute';
import QrScanRoute from './QrScanRoute/QrScanRoute';
import TaskManagementRoute from './TaskManagementRoute/TaskManagementRoute';
import { t } from 'i18next';

type RootStackParamList = {
  Home: undefined;
  Notification: undefined;
  Profile: undefined;
  Login: undefined;
  Task: undefined;
  QRScan: undefined;
  Welcome?: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const fetchNotification = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get('/notifications/myNotification');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.message || 'An error occurred while fetching the data');
  }
};

const CustomTabBarButton = ({ children, onPress, roleColors }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        top: -22,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: roleColors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 5,
          elevation: 5,
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
};

const NavigationWrapper = () => {
  const { data: myNotificationData } = useQuery<Notification[]>(
    'notifications/myNotification',
    fetchNotification
  );
  const navigation = useNavigation();
  const { isAuthenticated, roleName } = useSelector((state: RootState) => state.auth);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  useNotifications({ navigation });

  const optionsScan = useMemo(
    () => [
      {
        label: t('scanQR.viewCowDetail', { defaultValue: 'View cow detail' }),
        value: 'cow-detail',
      },
      {
        label: t('scanQR.reportIllness', {
          defaultValue: 'Report illness',
        }),
        value: 'report-illness',
      },
    ],
    []
  );

  const optionsScanVet = useMemo(
    () => [
      {
        label: t('scanQR.viewCowDetail', { defaultValue: 'View cow detail' }),
        value: 'cow-detail',
      },
      {
        label: t('scanQR.createHealthRecord', {
          defaultValue: 'Create health record',
        }),
        value: 'create-health-record',
      },
      {
        label: t('scanQR.reportIllness', {
          defaultValue: 'Report illness',
        }),
        value: 'report-illness',
      },
    ],
    []
  );
  const isVeterinarian = roleName?.toLowerCase() === 'veterinarians';
  const roleColors = isVeterinarian ? COLORS.veterinarian : COLORS.worker;

  const handleQrScanPress = () => {
    setIsDrawerVisible(true);
  };

  const handleFieldSelect = (field: string) => {
    setSelectedField(field);
    setIsDrawerVisible(false);
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'QRScan',
          params: { selectedField: field },
        },
      ],
    });
  };

  if (!isAuthenticated && roleName === 'Manager') {
    Alert.alert(
      t('Error'),
      t('You are not authorized to access this page.', {
        defaultValue: 'You are not authorized to access this page.',
      })
    );
    return null;
  }

  return isAuthenticated ? (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          lazy: false,
          headerShown: false,
          detachInactiveScreens: true,
          tabBarStyle: {
            backgroundColor: COLORS.backgroundLayout,
            height: 65,
            shadowColor: '#000',
            shadowOpacity: 0.1,
          },
          tabBarIcon: ({ size, focused }) => {
            let iconName = 'home';
            if (route.name === 'Notification') iconName = 'notifications';
            if (route.name === 'Profile') iconName = 'person';
            if (route.name === 'Task') iconName = 'checkbox';

            return (
              <Ionicons
                name={iconName}
                size={size}
                color={focused ? roleColors.primary : roleColors.inactive}
              />
            );
          },
          unmountOnBlur: true,
          tabBarActiveTintColor: roleColors.primary,
          tabBarInactiveTintColor: roleColors.inactive,
          tabBarLabel: ({ focused }) => {
            const routeName = route.name as keyof RootStackParamList;
            const label = {
              Home: t('tab.home', { defaultValue: 'Home' }),
              Task: t('tab.task', { defaultValue: 'Task' }),
              Notification: t('tab.notification', {
                defaultValue: 'Notification',
              }),
              Profile: t('tab.profile', { defaultValue: 'Profile' }),
              QRScan: t('tab.qrscan', { defaultValue: 'QR Scan' }),
              Welcome: t('tab.welcome', { defaultValue: 'Welcome' }),
              Login: t('tab.login', { defaultValue: 'Login' }),
            }[routeName];

            return (
              <Text
                style={{
                  color: focused ? roleColors.primary : roleColors.inactive,
                  fontSize: 9.2,
                  fontFamily: 'Georgia, serif',
                  textTransform: 'capitalize',
                }}
              >
                {label}
              </Text>
            );
          },
        })}
      >
        <Tab.Screen name='Home' component={CowRoute} key={'Home'} />
        <Tab.Screen name='Task' component={TaskManagementRoute} key={'Task'} />
        <Tab.Screen
          name='QRScan'
          component={QrScanRoute}
          options={{
            tabBarLabel: '',
            tabBarActiveTintColor: '#333',
            tabBarInactiveTintColor: 'gray',
            tabBarIcon: ({ size, focused }) => (
              <Ionicons
                style={{ marginTop: 1 }}
                name='qr-code'
                size={size + 4}
                color={focused ? '#fff' : '#f8f8f8'}
              />
            ),
            tabBarButton: (props) => (
              <CustomTabBarButton {...props} roleColors={roleColors} onPress={handleQrScanPress} />
            ),
          }}
        />
        <Tab.Screen
          name='Notification'
          key={'Notification'}
          component={NotificationScreen}
          options={{
            tabBarBadge:
              myNotificationData &&
              myNotificationData?.filter((element) => element.read === false)?.length > 0
                ? myNotificationData?.filter((element) => element.read === false)?.length
                : undefined,
            tabBarBadgeStyle: {
              backgroundColor: 'red',
              color: 'white',
              width: 'auto',
              height: 17,
              fontSize: 12,
            },
          }}
        />
        <Tab.Screen name='Profile' key={'Profile'} component={ProfileManagementRoute} />
      </Tab.Navigator>

      <Modal
        visible={isDrawerVisible}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setIsDrawerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.drawer}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={styles.drawerTitle}>
                {t('Select_a_Field', { defaultValue: 'Select a Field' })}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDrawerVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t('Close', { defaultValue: 'Close' })}</Text>
              </TouchableOpacity>
            </View>
            {roleName !== 'Worker'
              ? optionsScanVet.map((element: any) => (
                  <TouchableOpacity
                    style={styles.drawerItem}
                    key={element.value + element.label}
                    onPress={() => handleFieldSelect(element.value)}
                  >
                    <Text>{element.label}</Text>
                  </TouchableOpacity>
                ))
              : optionsScan.map((element: any) => (
                  <TouchableOpacity
                    style={styles.drawerItem}
                    key={element.value + element.label}
                    onPress={() => handleFieldSelect(element.value)}
                  >
                    <Text>{element.label}</Text>
                  </TouchableOpacity>
                ))}
          </View>
        </View>
      </Modal>
    </>
  ) : (
    <Stack.Navigator>
      <Stack.Screen
        name='Login'
        component={SignInScreen}
        options={{ headerTitle: t('tab.login', { defaultValue: 'Login' }) }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'red',
    fontSize: 16,
  },
});

export const Routes: React.FC = () => {
  return (
    <NavigationContainer>
      <NavigationWrapper />
    </NavigationContainer>
  );
};
