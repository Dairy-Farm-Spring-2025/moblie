import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faUser, faCog } from '@fortawesome/free-solid-svg-icons';
import { useSiderStore } from '@core/store/sliderStore/sliderStore';

interface FooterProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const Footer: React.FC<FooterProps> = ({ activeTab, onTabPress }) => {
  const tabs = [
    { name: 'Home', icon: faHome },
    { name: 'About', icon: faUser },
    { name: 'Settings', icon: faCog },
  ];
  const { isSiderVisible, toggleSider, closeSider } = useSiderStore();

  const handleTabPress = (tabName: any) => {
    onTabPress(tabName);
    closeSider();

    toggleSider();
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.name} style={styles.tab} onPress={handleTabPress}>
          <FontAwesomeIcon
            icon={tab.icon}
            size={24}
            color={activeTab === tab.name ? '#4CAF50' : 'gray'}
          />
          <Text style={[styles.text, activeTab === tab.name && styles.activeText]}>{tab.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 60,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  tab: {
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
  activeText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default Footer;
