import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from '@components/LoadingScreen/LoadingScreen';
import { ReportTaskData, Task } from '@model/Task/Task';
import { getReportImage } from '@utils/getImage';
import RenderHTML from 'react-native-render-html';
import apiClient from '@config/axios/axios';
import { useQuery } from 'react-query';
import { t } from 'i18next';

interface ReportTaskProps {
  reportTask: ReportTaskData | null;
  task: Task;
  date: string;
}

const fetchReportTask = async (date: string, taskId: number): Promise<ReportTaskData> => {
  const response = await apiClient.get(`/reportTask/task/${taskId}/date?date=${date}`);
  console.log('Fetched report:', response.data);
  return response.data || null; // Return null if no data
};

const ReportTask: React.FC<ReportTaskProps> = ({ reportTask: initialReportTask, task, date }) => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = React.useState(false);

  const {
    data: reportTask,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(['reportTask', task.taskId, date], () => fetchReportTask(date, task.taskId), {
    initialData: initialReportTask,
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#52c41a';
      case 'in progress':
        return '#1890ff';
      case 'pending':
        return '#ffa940';
      default:
        return '#8c8c8c';
    }
  };

  const handleReportPress = (report: ReportTaskData) => {
    navigation.navigate('ReportTaskDetail', { report });
  };
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      console.log('Refresh successful, new data:', reportTask);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const renderContent = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor='#000'
          title='Refreshing reports...'
          titleColor='#333'
        />
      }
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {t('Report Task')} {task.taskTypeId.name}
        </Text>
        <View style={styles.reportListContainer}>
          <Text style={styles.sectionTitle}>{t('Existing Reports')}</Text>
          {isLoading ? (
            <LoadingScreen message='Loading report...' />
          ) : isError ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                Error: {(error as Error)?.message || 'Failed to load report'}
              </Text>
            </View>
          ) : !reportTask ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>{t('No Report Data')}</Text>
            </View>
          ) : (
            <TouchableOpacity
              key={reportTask.reportTaskId}
              style={styles.reportCard}
              onPress={() => handleReportPress(reportTask)}
            >
              <View style={styles.reportHeader}>
                <Text style={styles.reportId}>
                  Report {new Date(reportTask.date).toLocaleDateString()}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(reportTask.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{reportTask.status}</Text>
                </View>
              </View>
              <Text style={styles.reportDate}>
                Date: {new Date(reportTask.date).toLocaleDateString()}
              </Text>
              <Text style={styles.reportTime}>
                Start: {new Date(reportTask.startTime).toLocaleTimeString()}
                {reportTask.endTime
                  ? ` - End: ${new Date(reportTask.endTime).toLocaleTimeString()}`
                  : ''}
              </Text>
              {reportTask.description && (
                <View>
                  <Text style={styles.reportDescription}>{t('Description')}:</Text>
                  <View style={styles.reportHtmlContainer}>
                    <RenderHTML
                      contentWidth={Dimensions.get('window').width - 72}
                      source={{ html: reportTask.description }}
                    />
                  </View>
                </View>
              )}
              {reportTask.comment && (
                <View>
                  <Text style={styles.reportComment}>{t('Comment')}: </Text>
                  <View style={styles.reportHtmlContainer}>
                    <RenderHTML
                      contentWidth={Dimensions.get('window').width - 72}
                      source={{ html: reportTask.comment }}
                    />
                  </View>
                </View>
              )}
              {reportTask.reportImages?.length > 0 && (
                <ScrollView horizontal style={styles.imagePreviewContainer}>
                  {reportTask.reportImages.map((imageUri, index) => (
                    <Image
                      key={index}
                      source={{ uri: getReportImage(imageUri.url) }}
                      style={styles.reportImagePreview}
                    />
                  ))}
                </ScrollView>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );

  return <View style={styles.container}>{renderContent()}</View>;
};

// Styles remain the same as in your original code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
    minHeight: Dimensions.get('window').height,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  reportListContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reportCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reportHtmlContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  reportTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  reportComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  reportImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default ReportTask;
