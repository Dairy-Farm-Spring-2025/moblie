import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import Layout from '@components/layout/Layout';
import { useSelector } from 'react-redux';
import { RootState } from '@core/store/store';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCow,
  faDrumstickBite,
  faChartArea,
  faSpider,
} from '@fortawesome/free-solid-svg-icons';

type NavigationProp = {
  navigate: (screen: string) => void;
};

const HomeScreen: React.FC = () => {
  const { fullName } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<NavigationProp>();

  const managementCards = [
    {
      id: 'CowManagementScreen',
      title: 'Cow',
      icon: faCow,
      screen: 'CowManagementScreen',
    },
    {
      id: 'AreaManagementScreen',
      title: 'Area',
      icon: faChartArea,
      screen: 'AreaManagementScreen',
    },
    {
      id: 'goat',
      title: 'Goat',
      icon: faSpider,
      screen: 'GoatManagementScreen',
    },
    {
      id: 'chicken',
      title: 'Chicken',
      icon: faDrumstickBite,
      screen: 'ChickenManagementScreen',
    },
  ];

  const sections = [{ title: 'Dairy Management', data: managementCards }];

  // Helper function to split data into rows of 2 items each
  const formatDataIntoRows = (data: any[]) => {
    const rows = [];
    for (let i = 0; i < data.length; i += 2) {
      rows.push(data.slice(i, i + 2));
    }
    return rows;
  };

  // Render a row (2 items per row)
  const renderItem = ({ item }: { item: any[] }) => (
    <View style={styles.row}>
      {item.map((card, index) => (
        <TouchableOpacity
          key={card.id}
          style={styles.card}
          onPress={() => card.screen && navigation.navigate(card.screen)}
        >
          <FontAwesomeIcon icon={card.icon} size={50} color="black" />
          <Text style={styles.cardTitle}>{card.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => <Text style={styles.sectionHeader}>{title}</Text>;

  return (
    <Layout isScrollable={false}>
      <Text style={styles.welcomeText}>Welcome, {fullName}</Text>
      <SectionList
        sections={sections.map((section) => ({
          ...section,
          data: formatDataIntoRows(section.data),
        }))}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.sectionList}
        stickySectionHeadersEnabled={false}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: -10, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  card: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: -10, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;
