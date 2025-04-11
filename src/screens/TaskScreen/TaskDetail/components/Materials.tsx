import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation } from 'react-query';
import apiClient from '@config/axios/axios';
import { Area } from '@model/Area/Area';
import { useTranslation } from 'react-i18next';

// Define interfaces (unchanged)
interface MaterialItem {
  name: string;
  itemId: number;
  unit: string;
  quantityNeeded: number;
}

interface CowTypeCount {
  Guernsey: number;
  'Holstein Friesian': number;
}

interface ApiResponse {
  code: number;
  message: string;
  timestamp: number;
  data: {
    totalCow: number;
    cowTypeCount: CowTypeCount;
    foodList: MaterialItem[];
  };
}

type RootStackParamList = {
  Materials: { area: Area; taskId: number };
};

type MaterialsRouteProp = RouteProp<RootStackParamList, 'Materials'>;

// Fetch functions (unchanged)
const fetchMaterials = async (areaId: number): Promise<ApiResponse['data']> => {
  const response = await apiClient.get<ApiResponse>(`/feedmeals/calculate/${areaId}`);
  console.log('Fetched materials:', response.data);
  return response.data;
};

const exportMaterial = async ({
  itemId,
  taskId,
  quantity,
}: {
  itemId: number;
  taskId: number;
  quantity: number;
}) => {
  const response = await apiClient.post('/export_items/create', {
    quantity,
    itemId,
    taskId,
  });
  return response.data;
};

const MaterialsContent: React.FC<{ data?: ApiResponse['data']; taskId: number; area: Area }> = ({
  data,
  taskId,
  area,
}) => {
  const { t } = useTranslation(); // Hook to access translations
  const navigation = useNavigation<any>();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const exportMutation = useMutation(exportMaterial, {
    onSuccess: (data, variables) => {
      Alert.alert(
        t('materials.success'),
        `Material with ID ${variables.itemId} exported successfully!`
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || t('materials.failedToLoad'));
    },
  });

  const handleExport = (itemId: number, quantity: number) => {
    exportMutation.mutate({ itemId, taskId, quantity });
  };

  const toggleExpand = (itemId: number) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  if (!data) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t('materials.loading')}</Text>
      </View>
    );
  }

  if (data.foodList.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t('materials.noMaterials')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('materials.title', { areaName: area.name })}</Text>
      </View>
      <View style={styles.infoRow}>
        <View style={[styles.statusBadge, { backgroundColor: '#52c41a', marginBottom: 10 }]}>
          <Text style={styles.statusText}>{t('materials.success')}</Text>
        </View>
      </View>

      {/* Display Area Information */}
      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='map-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>{t('materials.areaType')}</Text>
        </View>
        <View style={styles.dataContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{area.areaType}</Text>
          </View>
        </View>
      </View>

      {/* Display Total Cows and Cow Types */}
      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='paw-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>{t('materials.totalCows')}</Text>
        </View>
        <View style={styles.dataContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{data.totalCow}</Text>
          </View>
        </View>
      </View>
      <View style={styles.infoCol}>
        <View style={styles.labelContainer}>
          <Ionicons name='list-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>{t('materials.cowTypes')}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            margin: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={styles.tag}>
            <Text style={styles.tagText}>Guernsey: {data.cowTypeCount.Guernsey}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              Holstein Friesian: {data.cowTypeCount['Holstein Friesian']}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.separator} />

      {/* Material Items List */}
      {data.foodList.map((item, index) => {
        const isExpanded = expandedItems.includes(item.itemId);

        return (
          <React.Fragment key={item.itemId}>
            <View style={styles.itemContainer}>
              <TouchableOpacity style={styles.infoRow} onPress={() => toggleExpand(item.itemId)}>
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
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color='#595959'
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => handleExport(item.itemId, item.quantityNeeded)}
                    disabled={exportMutation.isLoading}
                  >
                    <Ionicons name='download-outline' size={20} color='#007bff' />
                    <Text style={styles.exportButtonText}>{t('materials.export')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {index < data.foodList.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const Materials: React.FC = () => {
  const { t } = useTranslation(); // Hook to access translations
  const route = useRoute<MaterialsRouteProp>();
  const [refreshing, setRefreshing] = useState(false);

  const area = route.params?.area;
  const taskId = route.params?.taskId;

  if (!area || taskId === undefined) {
    return (
      <View style={styles.container}>
        <Text>{t('materials.failedToLoad')}</Text>
      </View>
    );
  }

  const { data, isLoading, isError, error, refetch } = useQuery(
    ['materials', area.areaId],
    () => fetchMaterials(area.areaId),
    {
      staleTime: 0,
      cacheTime: 5 * 60 * 1000,
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      console.log('Refreshed materials:', data);
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
            title={t('materials.loading')}
            titleColor='#007bff'
          />
        }
      >
        {isLoading ? (
          <View style={styles.card}>
            <Text style={styles.title}>{t('materials.loading')}</Text>
          </View>
        ) : isError ? (
          <View style={styles.card}>
            <Text style={styles.title}>
              {(error as any)?.response?.data?.message || t('materials.failedToLoad')}
            </Text>
          </View>
        ) : (
          <MaterialsContent data={data} taskId={taskId} area={area} />
        )}
      </ScrollView>
    </View>
  );
};

// Styles (unchanged)
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
    fontSize: 22,
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
  itemContainer: {
    marginBottom: 15,
  },
  infoRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  infoCol: {
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
    marginRight: 2,
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
    marginRight: 10,
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
  dropdownContainer: {
    marginTop: 10,
    marginRight: 30,
    alignItems: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default Materials;
