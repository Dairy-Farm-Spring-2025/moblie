import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Task } from '@model/Task/Task';
import RenderHtmlComponent from '@components/RenderHTML/RenderHtmlComponent';
import apiClient from '@config/axios/axios';
import { useMutation, useQueryClient } from 'react-query';
import { SegmentedButtons } from 'react-native-paper';
import { Alert } from 'react-native';
import ReportTask from '@screens/TaskScreen/ReportTask/ReportTask';
import { formatCamelCase } from '@utils/format';

type RootStackParamList = {
  TaskDetail: { task: Task; selectedDate: string };
};

type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

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
  console.log('task', task.reportTask);

  // Check if a report exists for the selected date
  const hasReportForDate = task.reportTask && task.reportTask.date === selectedDate;
  // Check if task status is completed
  const isCompleted = task.status.toLowerCase() === 'completed';
  // Check if current date is within task duration
  const currentDate = new Date();
  const fromDate = new Date(task.fromDate);
  const toDate = new Date(task.toDate);
  const isWithinCurrentDateRange = currentDate >= fromDate && currentDate <= toDate;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#d9363e'; // Dark Red
      case 'high':
        return '#ff4d4f'; // Red
      case 'medium':
        return '#ffa940'; // Orange
      case 'low':
        return '#52c41a'; // Green
      default:
        return '#8c8c8c'; // Grey
    }
  };

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

  const getShiftColor = (shift: string) => {
    switch (shift.toLowerCase()) {
      case 'day':
      case 'dayshift':
        return '#fadb14'; // Yellow
      case 'night':
      case 'nightshift':
        return '#722ed1'; // Purple
      default:
        return '#8c8c8c'; // Grey
    }
  };

  const getShiftTextColor = (shift: string) => {
    switch (shift.toLowerCase()) {
      case 'day':
      case 'dayshift':
        return '#333'; // Dark grey for yellow background
      case 'night':
      case 'nightshift':
        return '#fff'; // White for purple background
      default:
        return '#333'; // Default dark grey
    }
  };

  const priorityColor = getPriorityColor(task.priority);
  const textColor = '#333'; // Fixed for white card background

  return (
    <View style={[styles.card, { borderLeftColor: priorityColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{task.taskTypeId.name}</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <AntDesign name='exclamationcircleo' size={21} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>Priority:</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
          <Text style={[styles.priorityText, { color: '#fff' }]}>{task.priority}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='calendar-outline' size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>Date:</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
          <Text style={[styles.tagText, { color: textColor }]}>
            {new Date(selectedDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons
            name='checkmark-circle-outline'
            size={20}
            color={textColor}
            style={styles.icon}
          />
          <Text style={[styles.textLabel, { color: textColor }]}>Status:</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={[styles.tagText, { color: '#fff' }]}>{formatCamelCase(task.status)}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='location-outline' size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>Area:</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
          <Text style={[styles.tagText, { color: textColor }]}>{task.areaId.name}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='person-outline' size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>Assigned by:</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
          <Text style={[styles.tagText, { color: textColor }]}>{task.assignerName}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='time-outline' size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>Shift:</Text>
        </View>
        <View
          style={[
            styles.tag,
            {
              backgroundColor: getShiftColor(task.shift),
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}
        >
          <Text style={[styles.tagText, { color: getShiftTextColor(task.shift) }]}>
            {formatCamelCase(task.shift)}
          </Text>
          {task.shift.toLowerCase().includes('night') ? (
            <MaterialCommunityIcons
              name='weather-night'
              size={20}
              color={getShiftTextColor(task.shift)}
              style={styles.shiftIcon}
            />
          ) : (
            <MaterialIcons
              name='wb-sunny'
              size={20}
              color={getShiftTextColor(task.shift)}
              style={styles.shiftIcon}
            />
          )}
        </View>
      </View>

      {task.completionNotes && (
        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <Ionicons name='chatbubble-outline' size={20} color={textColor} style={styles.icon} />
            <Text style={[styles.textLabel, { color: textColor }]}>Notes:</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
            <Text style={[styles.tagText, { color: textColor }]}>{task.completionNotes}</Text>
          </View>
        </View>
      )}

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='document-text-outline' size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>Description:</Text>
        </View>
      </View>
      <View style={styles.descriptionContainerWrapper}>
        {isExpanded ? (
          <View style={[styles.descriptionContainerExpanded, { backgroundColor: '#fafafa' }]}>
            <RenderHtmlComponent htmlContent={task.description} />
          </View>
        ) : (
          <View style={[styles.descriptionContainerCollapsed, { backgroundColor: '#fafafa' }]}>
            <ScrollView
              style={{ maxHeight: 200 }}
              contentContainerStyle={{ padding: 15 }}
              showsVerticalScrollIndicator={false}
            >
              <RenderHtmlComponent htmlContent={task.description} />
            </ScrollView>
          </View>
        )}
        {task.description.length > 40 && (
          <TouchableOpacity style={styles.expandButton} onPress={handleToggleExpand}>
            <Text style={[styles.expandText, { color: textColor }]}>
              {isExpanded ? 'Show less' : 'Show more'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.buttonsContainer, isCompleted && styles.centeredButtonContainer]}>
        {!isCompleted && !hasReportForDate && isWithinCurrentDateRange && (
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
      {selectedSegment === 'detail' ? (
        <ScrollView>
          <TaskDetailContent
            task={task}
            selectedDate={selectedDate}
            onCheckIn={handleCheckIn}
            isCheckingIn={checkInMutation.isLoading}
          />
        </ScrollView>
      ) : (
        <ReportTask date={selectedDate} task={task} reportTask={task.reportTask} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f2f5',
  },
  segmentedButtons: {
    margin: 10,
  },
  card: {
    width: '100%',
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    marginBottom: 20,
    borderLeftWidth: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Aligns label to left, tag to right
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    marginRight: 10,
  },
  textLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  shiftIcon: {
    marginLeft: 5,
  },
  descriptionContainerWrapper: {
    marginBottom: 15,
    width: '100%', // Full width for description
  },
  descriptionContainerCollapsed: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
  },
  descriptionContainerExpanded: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    padding: 15,
  },
  expandButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginRight: 10,
  },
  expandText: {
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  centeredButtonContainer: {
    justifyContent: 'center',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default TaskDetail;
