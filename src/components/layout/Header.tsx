import React, { useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { useSiderStore } from '@core/store/sliderStore/sliderStore';

const Header: React.FC = () => {
  const { isSiderVisible, toggleSider, closeSider } = useSiderStore();
  const [siderAnimation] = useState(
    new Animated.Value(isSiderVisible ? 0 : -200)
  ); // Animation

  const navigation = useNavigation();

  // Animate the sidebar when its state changes
  React.useEffect(() => {
    Animated.timing(siderAnimation, {
      toValue: isSiderVisible ? 0 : -200,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSiderVisible]);

  const handleNavigation = (route: string) => {
    closeSider(); // Close before navigating
    (navigation.navigate as any)(route);
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.siderTrigger} onPress={toggleSider}>
          <FontAwesomeIcon icon={faBars} size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dairy Farm Management</Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <FontAwesomeIcon icon={faBell} size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {isSiderVisible && (
        <TouchableWithoutFeedback onPress={toggleSider}>
          <View>
            <Animated.View
              style={[
                styles.sider,
                { transform: [{ translateX: siderAnimation }] },
              ]}
            >
              <TouchableOpacity onPress={() => handleNavigation('Home')}>
                <Text style={styles.siderText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigation('About')}>
                <Text style={styles.siderText}>About</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigation('Profile')}>
                <Text style={styles.siderText}>Profile</Text>
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
    backgroundColor: 'white',
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
