import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { SegmentedButtons } from 'react-native-paper';
import ReportTaskUpdateContent from '../ReportTaskUpdate/ReportTaskUpdate';
import apiClient from '@config/axios/axios';
import { ReportTaskData } from '@model/Task/Task';
import { getReportImage } from '@utils/getImage';
import RenderHTML from 'react-native-render-html';
import { t } from 'i18next';
import { formatCamelCase } from '@utils/format';

type FileData = {
  uri: string;
  name: string;
  type: string;
} | null;

type RootStackParamList = {
  ReportTaskDetail: { report: ReportTaskData };
  ReportTaskForm: { reportId: number };
};
type ReportTaskDetailRouteProp = RouteProp<RootStackParamList, 'ReportTaskDetail'>;

const fetchReportTask = async (reportId: number): Promise<ReportTaskData> => {
  const response = await apiClient.get(`/reportTask/${reportId}`);
  return response.data;
};

const ReportTaskDetailContent: React.FC<{
  report?: ReportTaskData;
  isUpdating: boolean;
}> = ({ report, isUpdating }) => {
  const navigation = useNavigation<any>();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const handleNavigateReportTask = () => {
    if (report?.reportTaskId) {
      navigation.navigate('ReportTaskForm', { reportId: report.reportTaskId });
    }
  };

  if (!report) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t('Loading Report')}...</Text>
      </View>
    );
  }

  const showReportButton =
    (report.description === null || report.description === undefined) &&
    report.reportImages.length < 1;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('task_management.Report', { defaultValue: 'Report' })} #{report.reportTaskId}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
          <Text style={styles.statusText}>{t(formatCamelCase(report.status))}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='calendar-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>{t('Date')}:</Text>
        </View>
        <View style={styles.dataContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{new Date(report.date).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='time-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>{t('Start Time')}:</Text>
        </View>
        <View style={styles.dataContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{new Date(report.startTime).toLocaleTimeString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='time-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>{t('End Time')}:</Text>
        </View>
        <View style={styles.dataContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {report.endTime ? new Date(report.endTime).toLocaleTimeString() : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name='document-text-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>{t('Description')}:</Text>
      </View>
      <View style={styles.contentContainer}>
        <RenderHTML source={{ html: report?.description || '<p>N/A</p>' }} />
      </View>

      <View style={styles.infoRow}>
        <Ionicons name='chatbubble-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>{t('Comment')}:</Text>
      </View>
      <View style={styles.contentContainer}>
        <RenderHTML source={{ html: report.comment || '<p>N/A</p>' }} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='person-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>{t('Reviewer')}:</Text>
        </View>
        <View style={styles.dataContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {report.reviewer_id
                ? typeof report.reviewer_id === 'number'
                  ? report.reviewer_id
                  : report.reviewer_id.name
                : t('task_management.Not_Reviewed', {
                    defaultValue: 'Not Reviewed',
                  })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name='image-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>{t('Images')}:</Text>
      </View>
      <View style={styles.contentContainer}>
        {report.reportImages.length > 0 ? (
          <ScrollView horizontal style={styles.imageContainer}>
            {report.reportImages.map((reportImage, index) => (
              <Image
                key={index}
                source={{ uri: getReportImage(reportImage.url) }}
                style={styles.imagePreview}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noContentText}>{t('No images')}</Text>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        {showReportButton && (
          <TouchableOpacity style={styles.reportButton} onPress={handleNavigateReportTask}>
            <Ionicons name='document-text-outline' size={24} color='#fff' />
            <Text style={styles.reportButtonText}>{t('Report')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ReportTaskDetail: React.FC = () => {
  const route = useRoute<ReportTaskDetailRouteProp>();
  const navigation = useNavigation<any>();
  const [selectedSegment, setSelectedSegment] = useState<string>('detail');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const initialReport = route.params?.report;
  if (!initialReport) {
    return (
      <View style={styles.container}>
        <Text>{t('Loading')}...</Text>
      </View>
    );
  }

  const { data: report, refetch } = useQuery(
    ['reportTask', initialReport.reportTaskId],
    () => fetchReportTask(initialReport.reportTaskId),
    {
      initialData: initialReport, // Use route param as initial data
      staleTime: 0, // Force refresh on pull
      cacheTime: 5 * 60 * 1000, // 5 minutes cache
    }
  );

  const currentDate = new Date().toLocaleDateString();
  const reportDate = new Date(report!.date).toLocaleDateString();
  const isExpired = currentDate > reportDate;

  const updateReportMutation = useMutation(
    async (data: { description: string; deleteUrls: string[]; newImage: FileData }) => {
      const formDataToSend = new FormData();

      // Construct the "request" object
      const request = {
        description: data.description,
        deleteUrls: data.deleteUrls,
      };
      // Append the "request" object as a JSON string
      // formDataToSend.append('request', JSON.stringify(request));
      formDataToSend.append('description', request.description);
      formDataToSend.append('deleteUrls', request.deleteUrls as any);
      formDataToSend.append('newImage', data.newImage as any);

      // Append the new image under "newImages" if it exists
      if (data.newImage) {
        formDataToSend.append('newImages', data.newImage as any);
      }

      return apiClient.put(`/reportTask/update/${report?.reportTaskId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    {
      onSuccess: () => {
        Alert.alert(
          'Success',
          t('Report updated successfully!', { defaultValue: 'Report updated successfully!' })
        );
      },
      onError: (error: any) => {
        console.error('Failed to update report:', error.response?.data || error.message);
        Alert.alert(
          'Error',
          `Failed to update report: ${error.response?.data?.message || error.message}`
        );
      },
    }
  );

  const handleUpdate = (description: string, deleteUrls: string[], newImage: FileData) => {
    updateReportMutation.mutate({ description, deleteUrls, newImage });
  };
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      Alert.alert(
        'Error',
        t('Failed to refresh report data.', { defaultValue: 'Failed to refresh report data.' })
      );
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <SegmentedButtons
        style={styles.segmentedButtons}
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          {
            value: 'detail',
            label: t('task_management.Report_Detail', {
              defaultValue: 'Report Detail',
            }),
            icon: 'file-document',
          },
          {
            value: 'update',
            label: t('task_management.Update_Report', {
              defaultValue: 'Update Report',
            }),
            icon: 'pencil-outline',
            disabled: isExpired,
          },
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor='#007bff' />
        }
      >
        {selectedSegment === 'detail' ? (
          <ReportTaskDetailContent report={report} isUpdating={updateReportMutation.isLoading} />
        ) : (
          <ReportTaskUpdateContent
            report={report!}
            onUpdate={handleUpdate}
            isUpdating={updateReportMutation.isLoading}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure container takes full height
    backgroundColor: '#f0f2f5',
  },
  segmentedButtons: {
    margin: 10,
  },
  scrollContent: {
    flexGrow: 1, // Ensure content grows to fill ScrollView
    padding: 10,
    alignItems: 'center',
    minHeight: 400, // Minimum height to ensure scrollability
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
  contentContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    marginLeft: 40,
    width: '90%',
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
  imageContainer: {
    flexDirection: 'row',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noContentText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonsContainer: {
    marginTop: 20,
    width: '100%',
    marginBottom: 40,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#52c41a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ReportTaskDetail;
