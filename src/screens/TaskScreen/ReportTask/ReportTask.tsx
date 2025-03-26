import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@config/axios/axios';
import { useQuery } from 'react-query';
import { useNavigation } from '@react-navigation/native';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import { ReportTaskData } from '@model/Task/Task';
import { getReportImage } from '@utils/getImage';
import RenderHTML from 'react-native-render-html';

interface ReportTaskProps {
  taskId: string | number;
}

const fetchReportTasks = async (taskId: string | number): Promise<ReportTaskData[]> => {
  const response = await apiClient.get(`/reportTask/task/${taskId}`);
  return response.data;
};

const ReportTask: React.FC<ReportTaskProps> = ({ taskId }) => {
  const navigation = useNavigation<any>(); // Use 'any' for simplicity; ideally, define RootStackParamList

  const {
    data: reportTasks,
    isLoading,
    isError,
    error,
  } = useQuery(['reportTasks', taskId], () => fetchReportTasks(taskId), { enabled: !!taskId });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#52c41a'; // Green
      case 'in progress':
        return '#1890ff'; // Blue
      case 'pending':
        return '#ffa940'; // Orange
      default:
        return '#8c8c8c'; // Grey
    }
  };

  const handleReportPress = (report: ReportTaskData) => {
    navigation.navigate('ReportTaskDetail', { report });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Report Task #{taskId}</Text>

          {/* Existing Reports List */}
          <View style={styles.reportListContainer}>
            <Text style={styles.sectionTitle}>Existing Reports</Text>
            {isLoading ? (
              <View style={styles.stateContainer}>
                <Ionicons name='hourglass-outline' size={24} color='#595959' />
                <Text style={styles.loadingText}>Loading reports...</Text>
              </View>
            ) : isError ? (
              <View style={styles.stateContainer}>
                <Ionicons name='alert-circle-outline' size={24} color='#ff4d4f' />
                <Text style={styles.errorText}>Error: {(error as Error).message}</Text>
              </View>
            ) : reportTasks && reportTasks.length > 0 ? (
              <ScrollView>
                {reportTasks.map((report) => (
                  <TouchableOpacity
                    key={report.reportTaskId}
                    style={styles.reportCard}
                    onPress={() => handleReportPress(report)}
                  >
                    <View style={styles.reportHeader}>
                      <Text style={styles.reportId}>Report #{report.reportTaskId}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(report.status) },
                        ]}
                      >
                        <Text style={styles.statusText}>{report.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.reportDate}>
                      Date: {new Date(report.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.reportTime}>
                      Start: {new Date(report.startTime).toLocaleTimeString()}
                      {report.endTime
                        ? ` - End: ${new Date(report.endTime).toLocaleTimeString()}`
                        : ''}
                    </Text>
                    {report.description && (
                      <View>
                        <Text style={styles.reportDescription}>Description:</Text>
                        <View style={styles.reportHtmlContainer}>
                          <RenderHTML
                            contentWidth={Dimensions.get('window').width}
                            source={{ html: report.description }}
                          />
                        </View>
                      </View>
                    )}
                    {report.comment && (
                      <View>
                        <Text style={styles.reportComment}>Comment: </Text>
                        <View style={styles.reportHtmlContainer}>
                          <RenderHTML
                            contentWidth={Dimensions.get('window').width}
                            source={{ html: report.comment }}
                          />
                        </View>
                      </View>
                    )}
                    {report.reportImages.length > 0 && (
                      <ScrollView horizontal style={styles.imagePreviewContainer}>
                        {report.reportImages.map((imageUri, index) => (
                          <Image
                            key={index}
                            source={{ uri: getReportImage(imageUri.url) }}
                            style={styles.reportImagePreview}
                          />
                        ))}
                      </ScrollView>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.stateContainer}>
                <Ionicons name='document-text-outline' size={24} color='#888' />
                <Text style={styles.noReportsText}>No reports available</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%', // Explicitly set to full width
    backgroundColor: '#f5f5f5', // Light gray background
    // borderWidth: 1, // Uncomment for debugging width issues
    // borderColor: 'red',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for FloatingButton
  },
  card: {
    width: '100%', // Full width of parent
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 2, // Small margin on sides for balance
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
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
    width: '100%', // Full width of parent (card)
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
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#595959',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4f',
    marginTop: 8,
    textAlign: 'center',
  },
  noReportsText: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
});

export default ReportTask;
