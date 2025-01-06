import React, { useState } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';

const Header: React.FC = () => {
  const [isSiderVisible, setSiderVisible] = useState(false);
  const [siderAnimation] = useState(new Animated.Value(-200)); // Slider starts off-screen
  const navigation = useNavigation(); // Access the navigation object

  const toggleSider = () => {
    if (isSiderVisible) {
      // Close the sider
      Animated.timing(siderAnimation, {
        toValue: -200, // Hide the sider
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSiderVisible(false));
    } else {
      // Open the sider
      setSiderVisible(true);
      Animated.timing(siderAnimation, {
        toValue: 0, // Bring the sider into view
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeSider = () => {
    Animated.timing(siderAnimation, {
      toValue: -200, // Hide the sider
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSiderVisible(false));
  };

  const handleNavigation = (route: string) => {
    closeSider(); // Close the sider before navigating
    navigation.navigate(route);
  };

  return (
    <>
      <View style={styles.header}>
        {/* Left: Sider trigger */}
        <TouchableOpacity style={styles.siderTrigger} onPress={toggleSider}>
          <FontAwesomeIcon icon={faBars} size={24} color='#000' />
        </TouchableOpacity>

        {/* Center: App Name */}
        <Text style={styles.headerTitle}>Dairy Farm Management</Text>

        {/* Right: Notification Icon */}
        <TouchableOpacity style={styles.notificationIcon}>
          <FontAwesomeIcon icon={faBell} size={24} color='#000' />
        </TouchableOpacity>
      </View>

      {/* Sider */}
      {isSiderVisible && (
        <TouchableWithoutFeedback onPress={toggleSider}>
          <View>
            <Animated.View style={[styles.sider, { transform: [{ translateX: siderAnimation }] }]}>
              <TouchableOpacity onPress={() => handleNavigation('Home')}>
                <Text style={styles.siderText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigation('About')}>
                <Text style={styles.siderText}>About</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigation('Settings')}>
                <Text style={styles.siderText}>Settings</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  siderTrigger: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  notificationIcon: {
    padding: 5,
  },
  sider: {
    width: '60%',
    backgroundColor: '#f1f1f1',
    padding: 10,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  siderText: {
    fontSize: 16,
    marginVertical: 10,
  },
});

export default Header;
