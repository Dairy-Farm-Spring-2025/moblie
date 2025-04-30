import React, { useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSiderStore } from '@core/store/sliderStore/sliderStore';
import logo from '@assets/logo.png';

const Header: React.FC = () => {
  const { isSiderVisible, toggleSider, closeSider } = useSiderStore();
  const [siderAnimation] = useState(new Animated.Value(isSiderVisible ? 0 : -200));

  const navigation = useNavigation();

  React.useEffect(() => {
    Animated.timing(siderAnimation, {
      toValue: isSiderVisible ? 0 : -200,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSiderVisible]);

  const handleNavigation = (route: string) => {
    closeSider();
    (navigation.navigate as any)(route);
  };

  return (
    <>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.headerTitle}>Dairy Farm Management</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  siderTrigger: {
    padding: 5,
  },
  logo: {
    width: 40,
    height: 40,
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
