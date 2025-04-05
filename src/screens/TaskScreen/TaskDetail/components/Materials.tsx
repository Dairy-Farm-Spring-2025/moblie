import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';

// Define the interface for each material item
interface MaterialItem {
  name: string;
  itemId: number;
  unit: string;
  quantityNeeded: number;
}

type RootStackParamList = {
  Materials: { areaId: number };
};

type MaterialsRouteProp = RouteProp<RootStackParamList, 'Materials'>;

// Fetch function - now returns an array of MaterialItem directly
const fetchMaterials = async (areaId: number): Promise<MaterialItem[]> => {
  const response = await apiClient.get(`/feedmeals/calculate/${areaId}`);
  console.log('Fetched materials:', response.data);
  return response.data; // Expecting an array directly
};

const MaterialsContent: React.FC<{ materials?: MaterialItem[] }> = ({ materials }) => {
  const navigation = useNavigation<any>();

  if (!materials) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Loading Materials...</Text>
      </View>
    );
  }

  if (materials.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>No Materials Available</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Materials for Area</Text>
      </View>
      <View style={styles.infoRow}>
        <View style={[styles.statusBadge, { backgroundColor: '#52c41a', marginBottom: 10 }]}>
          <Text style={styles.statusText}>Success</Text>
        </View>
      </View>

      {materials.map((item, index) => (
        <React.Fragment key={item.itemId}>
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Ionicons name='cube-outline' size={20} color='#595959' style={styles.icon} />
              <Text style={styles.textLabel}>{item.name}:</Text>
            </View>
            <View style={styles.dataContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {item.quantityNeeded} {item.unit}
                </Text>
              </View>
            </View>
          </View>

          {index < materials.length - 1 && <View style={styles.separator} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const Materials: React.FC = () => {
  const route = useRoute<MaterialsRouteProp>();
  const [refreshing, setRefreshing] = useState(false);

  const initialAreaId = route.params?.areaId;
  if (!initialAreaId) {
    return (
      <View style={styles.container}>
        <Text>Area ID not provided</Text>
      </View>
    );
  }

  const {
    data: materials,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(['materials', initialAreaId], () => fetchMaterials(initialAreaId), {
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      console.log('Refreshed materials:', materials);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor='#007bff'
            title='Refreshing materials...'
            titleColor='#007bff'
          />
        }
      >
        {isLoading ? (
          <View style={styles.card}>
            <Text style={styles.title}>Loading Materials...</Text>
          </View>
        ) : isError ? (
          <View style={styles.card}>
            <Text style={styles.title}>
              Error: {(error as Error)?.message || 'Failed to load materials'}
            </Text>
          </View>
        ) : (
          <MaterialsContent materials={materials} />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 10,
    alignItems: 'center',
    minHeight: 400,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1a1a1a',
    flexShrink: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  dataContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    marginRight: 10,
  },
  textLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 10,
  },
  tag: {
    backgroundColor: '#e8e8e8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
});

export default Materials;
