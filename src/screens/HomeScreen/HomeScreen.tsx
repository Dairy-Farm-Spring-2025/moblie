import { COLORS } from '@common/GlobalStyle';
import Layout from '@components/layout/Layout';
import DividerUI from '@components/UI/DividerUI';
import apiClient from '@config/axios/axios';
import { RootState } from '@core/store/store';
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons'; // Import Ionicons from @expo/vector-icons
import { User } from '@model/User/User';
import { useNavigation } from '@react-navigation/native';
import { getAvatar } from '@utils/getImage';
import React from 'react';
import { SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Avatar, Badge, Text } from 'react-native-paper';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { t } from 'i18next';

const SIZE_ICON = 40;

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
  // const user = useSelector((state: RootState) => state.auth);
  const { data: profileData, isLoading } = useQuery<User>(
    'users/profile',
    fetchProfile
  );
  const navigation = useNavigation<NavigationProp>();

  const managementCards = [
    {
      id: 'CowManagementScreen',
      title: t('home.cow'),
      icon: <MaterialCommunityIcons name="cow" size={SIZE_ICON} color="#000" />,
      screen: 'CowManagementScreen',
    },
    {
      id: 'AreaManagementScreen',
      title: t('home.area'),
      icon: <FontAwesome5 name="chart-area" size={SIZE_ICON} color="#000" />,
      screen: 'AreaManagementScreen',
    },
    {
      id: 'PenManagementScreen',
      title: t('home.pen'),
      icon: <MaterialIcons name="warehouse" size={SIZE_ICON} color="#000" />, // Replaced faSliders with sliders
      screen: 'PenManagementScreen',
    },
    {
      id: 'MilkBatch',
      title: t('home.milk_batch'),
      icon: <AntDesign name="barschart" size={SIZE_ICON} color="#000" />, // Replaced faDolly with cart-outline
      screen: 'MilkBatchManagementScreen',
    },
    {
      id: 'HealthRecord',
      title: t('home.health_record'),
      icon: <Ionicons name="medkit" size={SIZE_ICON} color="#000" />, // Replaced faNotesMedical with medkit-outline
      screen: 'HealthRecordScreen',
    },
    // {
    //   id: 'FarmLayoutScreen',
    //   title: t('home.farm_layout'),
    //   icon: <Feather name='map' size={30} color='#fff' />, // Replaced faChartArea with map-outline
    //   screen: 'FarmLayout',
    // },
    {
      id: 'FeedManagementScreen',
      title: t('feed.title'),
      icon: (
        <MaterialCommunityIcons
          name="food-variant"
          size={SIZE_ICON}
          color="#000"
        />
      ), // Replaced faChartArea with map-outline
      screen: 'FeedManagementScreen',
    },
    {
      id: 'MyExportItemScreen',
      title: t('export_item.title'),
      icon: (
        <MaterialCommunityIcons
          name="open-in-app"
          size={SIZE_ICON}
          color="#000"
        />
      ), // Replaced faChartArea with map-outline
      screen: 'MyExportItemScreen',
    },
    {
      id: 'VaccineCyclesManagementScreen',
      title: t('vaccine_cycle.title'),
      icon: <MaterialIcons name="vaccines" size={SIZE_ICON} color="#000" />, // Replaced faChartArea with map-outline
      screen: 'VaccineCyclesManagementScreen',
    },
  ];

  const applicationCards = [
    {
      id: 'ViewApplicationScreen',
      title: t('application.titleView', {
        defaultValue: 'View my application',
      }),
      icon: (
        <MaterialCommunityIcons
          name="application-outline"
          size={SIZE_ICON}
          color="#000"
        />
      ),
      screen: 'ViewApplicationScreen',
    },
    {
      id: 'CreateApplicationScreen',
      title: t('application.titleCreate', {
        defaultValue: 'Create application',
      }),
      icon: (
        <MaterialCommunityIcons
          name="plus-box-outline"
          size={SIZE_ICON}
          color="#000"
        />
      ),
      screen: 'CreateApplicationScreen',
    },
  ];

  const sections = [
    { title: t('home.dairy_management'), data: managementCards },
    {
      title: t('application.title', { defaultValue: 'Application management' }),
      data: applicationCards,
    },
  ];

  const isVeterinarian =
    profileData?.roleId?.name?.toLowerCase() === 'veterinarians';
  const roleColors = isVeterinarian ? COLORS.veterinarian : COLORS.worker;
  const primaryColor = roleColors.primary;
  const backgroundColor = roleColors.accent;

  const formatDataIntoRows = (data: any[]) => {
    const rows = [];
    for (let i = 0; i < data.length; i += 2) {
      rows.push(data.slice(i, i + 2));
    }
    return rows;
  };

  const renderItem = ({ item }: { item: any[] }) => (
    <View style={[styles.row]}>
      {item.map((card) => (
        <TouchableOpacity
          key={card.id}
          style={[
            styles.card,
            {
              borderWidth: 2,
              borderColor: backgroundColor,
              backgroundColor: `${backgroundColor}45`, // Adding opacity to the background
              width: item.length === 1 ? '100%' : '48%',
            },
          ]}
          onPress={() => card.screen && navigation.navigate(card.screen)}
        >
          {card.icon}
          <Text style={[styles.cardTitle, { color: '#000' }]}>
            {card.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <Text style={[styles.sectionHeader, { backgroundColor: primaryColor }]}>
      {title}
    </Text>
  );

  if (isLoading) {
    return (
      <Layout>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator />
          <Text>{t('loading')}</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout isScrollable={false}>
      <View style={styles.headerContainer}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>{t('home.welcome')}</Text>
          <Text style={[styles.welcomeText, { color: primaryColor }]}>
            {profileData?.name || ''}
          </Text>
        </View>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={60}
            source={{ uri: `${getAvatar(profileData?.profilePhoto || '')}` }}
          />
          <Badge
            style={[
              styles.roleBadge,
              { backgroundColor: primaryColor, color: '#fff' },
            ]}
            size={20}
          >
            {isVeterinarian ? t('home.vet') : t('home.worker')}
          </Badge>
        </View>
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
        showsVerticalScrollIndicator={false}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  welcomeContainer: {
    flexDirection: 'column',
    gap: 5,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarContainer: {
    position: 'relative',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -5,
    right: -4,
    color: '#000FFF',
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
    width: '48%',
    padding: 20,
    borderRadius: 10,
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
