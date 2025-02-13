import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import Layout from '@components/layout/Layout';
import { useSelector } from 'react-redux';
import { RootState } from '@core/store/store';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'; // Correct import for FontAwesomeIcon
import { faCow, faDrumstickBite } from '@fortawesome/free-solid-svg-icons'; // Import the icons you want to use
import { faPaw, faSpider } from '@fortawesome/free-solid-svg-icons';

const HomeScreen: React.FC = () => {
  const { fullName } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation();

  const managementCards = [
    { id: 'CowManagementScreen', title: 'Cow', icon: faCow, screen: 'CowManagementScreen' },
    { id: 'sheep', title: 'Sheep', icon: faPaw, screen: 'SheepManagementScreen' },
    { id: 'goat', title: 'Goat', icon: faSpider, screen: 'GoatManagementScreen' },
    { id: 'chicken', title: 'Chicken', icon: faDrumstickBite, screen: 'ChickenManagementScreen' },
  ];

  return (
    <Layout isScrollable={false}>
      <Text style={styles.welcomeText}>Welcome, {fullName}</Text>
      <FlatList
        data={managementCards}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => item.screen && (navigation.navigate as any)(item.screen)}
          >
            <FontAwesomeIcon icon={item.icon} size={24} color='black' />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  welcomeText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  card: {
    flex: 1,
    margin: 10,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { marginTop: 10, fontSize: 16, fontWeight: '600' },
});

export default HomeScreen;
