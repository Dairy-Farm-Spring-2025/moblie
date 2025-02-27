import { COLORS } from '@common/GlobalStyle';
import Layout from '@components/layout/Layout';
import DividerUI from '@components/UI/DividerUI';
import apiClient from '@config/axios/axios';
import { RootState } from '@core/store/store';
import {
  faChartArea,
  faCow,
  faDolly,
  faNotesMedical,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { User } from '@model/User/User';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Avatar } from 'react-native-paper';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

type NavigationProp = {
  navigate: (screen: string) => void;
};

const fetchProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.message || 'An error occurred while fetching the data'
    );
  }
};

const HomeScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth);
  const { data: profileData, isLoading } = useQuery<User>(
    'users/profile',
    fetchProfile
  );
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
      id: 'PenManagementScreen',
      title: 'Pen',
      icon: faSliders,
      screen: 'PenManagementScreen',
    },
    {
      id: 'MilkBatch',
      title: 'Milk Batch',
      icon: faDolly,
      screen: 'MilkBatchManagementScreen',
    },
    {
      id: 'HealthRecord',
      title: 'Health Record',
      icon: faNotesMedical,
      screen: 'HealthRecordScreen',
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
          <FontAwesomeIcon icon={card.icon} size={50} color={COLORS.primary} />
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

  if (isLoading) return <ActivityIndicator />;

  return (
    <Layout isScrollable={false}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          marginBottom: 10,
        }}
      >
        <View style={styles.welcomeContainer}>
          <Text>Welcome, </Text>
          <Text style={styles.welcomeText}>
            <Text style={{ color: COLORS.primary }}>{profileData?.name}</Text>
          </Text>
        </View>
        <Avatar.Image
          size={40}
          source={{
            uri: `http://34.124.196.11:8080/uploads/users/${profileData?.profilePhoto}`,
          }}
        />
      </View>
      <DividerUI />
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
  welcomeContainer: {
    flexDirection: 'column',
    gap: 5,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
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
    backgroundColor: 'green',
    color: 'white',
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
    width: '50%',
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
    color: COLORS.primary,
  },
});

export default HomeScreen;
