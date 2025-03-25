import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQueryClient } from 'react-query';
import { SegmentedButtons } from 'react-native-paper';
import ReportTaskUpdateContent from '../ReportTaskUpdate/ReportTaskUpdate';
import apiClient from '@config/axios/axios';
import { ReportTaskData } from '@model/Task/Task';
import { getReportImage } from '@utils/getImage';
import RenderHtmlComponent from '@components/RenderHTML/RenderHtmlComponent';
import RenderHTML from 'react-native-render-html';

type RootStackParamList = {
  ReportTaskDetail: { report: ReportTaskData };
  ReportTaskForm: { reportId: number };
};

type ReportTaskDetailRouteProp = RouteProp<RootStackParamList, 'ReportTaskDetail'>;

const ReportTaskDetailContent: React.FC<{
  report?: ReportTaskData;
  onUpdate: (description: string, taskFile: string | null) => void;
  isUpdating: boolean;
}> = ({ report, onUpdate, isUpdating }) => {
  const navigation = useNavigation<any>();
  console.log('Report:', report?.reportImages);

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
        <Text style={styles.title}>Loading Report...</Text>
      </View>
    );
  }

  const showReportButton = report.description === null || report.description === undefined;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Report #{report.reportTaskId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
          <Text style={styles.statusText}>{report.status}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='calendar-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>Date:</Text>
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
          <Text style={styles.textLabel}>Start Time:</Text>
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
          <Text style={styles.textLabel}>End Time:</Text>
        </View>
        <View style={styles.dataContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {report.endTime ? new Date(report.endTime).toLocaleTimeString() : 'Not set'}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.infoRow}>
        <Ionicons name='document-text-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>Description:</Text>
      </View>
      <View style={styles.contentContainer}>
        <RenderHTML source={{ html: report?.description || '<p>None</p>' }} />
      </View>

      {/* Comment */}
      <View style={styles.infoRow}>
        <Ionicons name='chatbubble-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>Comment:</Text>
      </View>
      <View style={styles.contentContainer}>
        <RenderHTML source={{ html: report.comment || '<p>None</p>' }} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='person-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>Reviewer:</Text>
        </View>
        <View style={styles.dataContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {report.reviewer_id
                ? typeof report.reviewer_id === 'number'
                  ? report.reviewer_id
                  : report.reviewer_id.name
                : 'Not reviewed'}
            </Text>
          </View>
        </View>
      </View>

      {/* Images */}
      <View style={styles.infoRow}>
        <Ionicons name='image-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>Images:</Text>
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
          <Text style={styles.noContentText}>No images</Text>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name='arrow-back' size={24} color='#fff' />
          <Text style={styles.backButtonText}>Back to Reports</Text>
        </TouchableOpacity> 
        {showReportButton && (
          <TouchableOpacity style={styles.reportButton} onPress={handleNavigateReportTask}>
            <Ionicons name='document-text-outline' size={24} color='#fff' />
            <Text style={styles.reportButtonText}>Report</Text>
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
  const queryClient = useQueryClient();

  const report = route.params?.report;
  if (!report) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const currentDate = new Date();
  const reportDate = new Date(report.date);
  const isExpired = currentDate > reportDate;

  const updateReportMutation = useMutation(
    (data: FormData) => {
      console.log('Sending update request with FormData:');
      console.log(`URL: /reportTask/update/${report.reportTaskId}`);
      return apiClient.put(`/reportTask/update/${report.reportTaskId}`, data);
    },
    {
      onSuccess: (response) => {
        console.log('Update successful:', response.data);
        Alert.alert('Success', 'Report updated successfully!');
        queryClient.invalidateQueries('reportTasks');
        navigation.goBack();
      },
      onError: (error: any) => {
        Alert.alert(
          'Error',
          `Failed to update report: ${error.response?.data?.message || error.message}`
        );
      },
    }
  );

  const handleUpdate = (description: string, imagesFile: string | null) => {
    console.log('handleUpdate called with:', { description, imagesFile });
    const formDataToSend = new FormData();
    formDataToSend.append('description', description);
    if (imagesFile) {
      const uriParts = imagesFile.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileData = {
        uri: imagesFile,
        name: `image.reportTask.${fileType}`,
        type: `image/${fileType}`,
      };
      console.log('Appending file:', fileData);
      formDataToSend.append('imagesFile', fileData as any);
    }
    updateReportMutation.mutate(formDataToSend);
  };

  return (
    <View style={styles.container}>
      <SegmentedButtons
        style={styles.segmentedButtons}
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          { value: 'detail', label: 'Report Detail', icon: 'information-circle-outline' },
          {
            value: 'update',
            label: 'Update Report',
            icon: 'pencil-outline',
            disabled: isExpired,
          },
        ]}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedSegment === 'detail' ? (
          <ReportTaskDetailContent
            report={report}
            onUpdate={handleUpdate}
            isUpdating={updateReportMutation.isLoading}
          />
        ) : (
          <ReportTaskUpdateContent
            report={report}
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
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedButtons: {
    margin: 10,
  },
  scrollContent: {
    padding: 10,
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
