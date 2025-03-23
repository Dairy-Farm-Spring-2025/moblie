import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '@model/Task/Task';
import RenderHtmlComponent from '@components/RenderHTML/RenderHtmlComponent';
import apiClient from '@config/axios/axios';
import { useMutation, useQueryClient } from 'react-query';
import { SegmentedButtons } from 'react-native-paper';
import { Alert } from 'react-native';
import ReportTask from '@screens/TaskScreen/ReportTask/ReportTask';

type RootStackParamList = {
  TaskDetail: { task: Task; selectedDate: string };
};

type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

// Define error type for API response
interface ApiError {
  response?: {
    data: {
      message: string;
    };
  };
  message?: string;
}

const TaskDetailContent: React.FC<{
  task: Task;
  selectedDate: string;
  onCheckIn: () => void;
  isCheckingIn: boolean;
}> = ({ task, selectedDate, onCheckIn, isCheckingIn }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const navigation = useNavigation();

  const handleToggleExpand = () => setIsExpanded(!isExpanded);

  // Check if a report exists for the selected date
  const hasReportForDate = task.reportTask && task.reportTask.date === selectedDate;
  // Check if task status is completed
  const isCompleted = task.status.toLowerCase() === 'completed';

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#ff4d4f';
      case 'medium':
        return '#ffa940';
      case 'low':
        return '#52c41a';
      default:
        return '#8c8c8c';
    }
  };

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

  const getShiftColor = (shift: string) => {
    switch (shift.toLowerCase()) {
      case 'day':
        return '#fadb14';
      case 'night':
        return '#722ed1';
      default:
        return '#8c8c8c';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.taskTypeId.name}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name='calendar-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>Time:</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {new Date(task.fromDate).toLocaleDateString()} -{' '}
            {new Date(task.toDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name='checkmark-circle-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>Status:</Text>
        <View style={[styles.tag, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.tagText}>{task.status}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name='location-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>Area:</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{task.areaName}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name='person-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>Assigned by:</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{task.assignerName}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name='person-circle-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>Assigned to:</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{task.assigneeName}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name='time-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>Shift:</Text>
        <View style={[styles.tag, { backgroundColor: getShiftColor(task.shift) }]}>
          <Text style={styles.tagText}>{task.shift}</Text>
        </View>
      </View>

      {task.completionNotes && (
        <View style={styles.infoRow}>
          <Ionicons name='chatbubble-outline' size={20} color='#595959' style={styles.icon} />
          <Text style={styles.textLabel}>Notes:</Text>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{task.completionNotes}</Text>
          </View>
        </View>
      )}

      <View style={styles.infoRow}>
        <Ionicons name='document-text-outline' size={20} color='#595959' style={styles.icon} />
        <Text style={styles.textLabel}>Description:</Text>
      </View>
      <View style={styles.descriptionContainerWrapper}>
        {isExpanded ? (
          <View style={styles.descriptionContainerExpanded}>
            <RenderHtmlComponent htmlContent={task.description} />
          </View>
        ) : (
          <View style={styles.descriptionContainerCollapsed}>
            <ScrollView
              style={{ maxHeight: 200 }}
              contentContainerStyle={{ padding: 15 }}
              showsVerticalScrollIndicator={false}
            >
              <RenderHtmlComponent htmlContent={task.description} />
            </ScrollView>
          </View>
        )}
        {task.description.length > 300 && (
          <TouchableOpacity style={styles.expandButton} onPress={handleToggleExpand}>
            <Text style={styles.expandText}>{isExpanded ? 'Show less' : 'Show more'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.buttonsContainer, isCompleted && styles.centeredButtonContainer]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name='arrow-back' size={24} color='#fff' />
          <Text style={styles.backButtonText}>Back to Tasks</Text>
        </TouchableOpacity>

        {/* Conditionally render Check-in button if not completed and no report */}
        {!isCompleted && !hasReportForDate && (
          <TouchableOpacity
            style={[styles.checkInButton, isCheckingIn && styles.checkInButtonDisabled]}
            onPress={onCheckIn}
            disabled={isCheckingIn}
          >
            <Ionicons name='checkmark-done' size={24} color='#fff' />
            <Text style={styles.checkInButtonText}>
              {isCheckingIn ? 'Checking in...' : 'Check-in'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const TaskDetail: React.FC = () => {
  const route = useRoute<TaskDetailRouteProp>();
  const { task, selectedDate } = route.params;
  const [selectedSegment, setSelectedSegment] = React.useState<string>('detail');
  const queryClient = useQueryClient();

  const checkInMutation = useMutation<unknown, ApiError, string | number>(
    (taskId: string | number) => apiClient.post(`/reportTask/joinTask/${taskId}`),
    {
      onSuccess: (response) => {
        // Assuming response.data.message exists based on your API
        Alert.alert('Success', response.data?.message || 'Task checked in successfully!');
        queryClient.invalidateQueries('tasks');
      },
      onError: (err) => {
        Alert.alert(
          'Error',
          err.response?.data.message || err.message || 'Failed to check in task. Please try again.'
        );
      },
    }
  );

  const handleCheckIn = () => {
    checkInMutation.mutate(task.taskId);
  };

  return (
    <View style={styles.container}>
      <SegmentedButtons
        style={styles.segmentedButtons}
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          { value: 'detail', label: 'Task Detail', icon: 'information-circle-outline' },
          { value: 'report', label: 'Report Task', icon: 'chart-bar' },
        ]}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedSegment === 'detail' ? (
          <TaskDetailContent
            task={task}
            selectedDate={selectedDate}
            onCheckIn={handleCheckIn}
            isCheckingIn={checkInMutation.isLoading}
          />
        ) : (
          <ReportTask taskId={task.taskId} />
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
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
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
  icon: {
    width: 30,
    marginRight: 10,
  },
  textLabel: {
    width: 120,
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
    flexShrink: 1,
  },
  tagText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionContainerWrapper: {
    marginLeft: 40,
    marginBottom: 15,
    width: '90%',
    alignSelf: 'flex-start',
  },
  descriptionContainerCollapsed: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    backgroundColor: '#fafafa',
  },
  descriptionContainerExpanded: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    padding: 15,
  },
  expandButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginRight: 10,
  },
  expandText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  centeredButtonContainer: {
    justifyContent: 'center', // Center the "Back to Tasks" button when "Check-in" is hidden
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#52c41a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  checkInButtonDisabled: {
    backgroundColor: '#b7eb8f',
    opacity: 0.7,
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
});

export default TaskDetail;
