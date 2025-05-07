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
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';
import { formatCamelCase } from '@utils/format';

// Define interfaces
interface MaterialItem {
  name: string;
  itemId: number;
  unit: string;
  quantityNeeded: number;
}

interface CowTypeCount {
  [key: string]: number; // Dynamic keys with number
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

interface ExportItem {
  itemId: number;
  quantity: number;
}

type RootStackParamList = {
  Materials: { area: Area; taskId: number };
};

type MaterialsRouteProp = RouteProp<RootStackParamList, 'Materials'>;

// Fetch functions
const fetchMaterials = async (areaId: number): Promise<ApiResponse['data']> => {
  const response = await apiClient.get<ApiResponse>(`/feedmeals/calculate/${areaId}`);
  return response.data;
};

const exportMaterials = async ({
  taskId,
  exportItems,
}: {
  taskId: number;
  exportItems: ExportItem[];
}) => {
  const response = await apiClient.post('/export_items/create/multi', {
    taskId,
    exportItems,
  });
  return response.data;
};

const MaterialsContent: React.FC<{ data?: ApiResponse['data']; taskId: number; area: Area }> = ({
  data,
  taskId,
  area,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const exportMutation = useMutation(exportMaterials, {
    onSuccess: () => {
      Alert.alert(t('materials.success'), t('materials.batchExportSuccess'));
    },
    onError: (error: any) => {
      Alert.alert(
        t('Error', { defaultValue: 'Error' }),
        error?.response?.data?.message || t('materials.failedToExport')
      );
    },
  });

  const toggleExpand = (itemId: number) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleExport = () => {
    if (!data || data.foodList.length === 0) {
      Alert.alert(t('materials.warning'), t('materials.noItemsAvailable'));
      return;
    }

    const exportItems: ExportItem[] = data.foodList.map((item) => ({
      itemId: item.itemId,
      quantity: item.quantityNeeded,
    }));

    Alert.alert(
      t('materials.confirmExport'),
      t('materials.confirmExportMessage', { count: exportItems.length }),
      [
        {
          text: t('materials.cancel'),
          style: 'cancel',
        },
        {
          text: t('materials.confirm'),
          onPress: () => {
            exportMutation.mutate({ taskId, exportItems });
          },
        },
      ]
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
            <Text style={styles.tagText}>
              {t(`data.${area.areaType}`, { defaultValue: formatCamelCase(area.areaType) })}
            </Text>
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
      {/* Display Cow Types */}
      <View style={styles.infoRow}>
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
          {Object.entries(data.cowTypeCount).map(([type, count]) => (
            <View style={styles.tag} key={type}>
              <Text style={styles.tagText}>{`${type}: ${count}`}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.separator} />

      {/* Batch Export Button */}
      <TouchableOpacity
        style={[styles.batchExportButton, data.foodList.length === 0 && styles.disabledButton]}
        onPress={handleExport}
        disabled={exportMutation.isLoading || data.foodList.length === 0}
      >
        <Ionicons name='download-outline' size={20} color='#fff' />
        <Text style={styles.batchExportButtonText}>{t('materials.exportAll')}</Text>
      </TouchableOpacity>

      {/* Material Items List */}
      {data.foodList.map((item, index) => {
        const isExpanded = expandedItems.includes(item.itemId);

        return (
          <React.Fragment key={item.itemId}>
            <View style={styles.itemContainer}>
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
            </View>

            {index < data.foodList.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const Materials: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<MaterialsRouteProp>();
  const [refreshing, setRefreshing] = useState(false);

  const area = route.params?.area;
  const taskId = route.params?.taskId;

  if (!area || taskId === undefined) {
    return <LoadingSplashScreen />;
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
    } catch (err) {
    } finally {
      setRefreshing(false);
    }
  };

  return isLoading ? (
    <LoadingSplashScreen />
  ) : (
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
        {isError ? (
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

// Styles
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
  dropdownText: {
    fontSize: 14,
    color: '#595959',
  },
  batchExportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  batchExportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default Materials;
