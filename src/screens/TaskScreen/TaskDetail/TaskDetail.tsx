import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Task } from '@model/Task/Task';
import RenderHtmlComponent from '@components/RenderHTML/RenderHtmlComponent';
import apiClient from '@config/axios/axios';
import { useMutation, useQueryClient } from 'react-query';
import { Button, SegmentedButtons } from 'react-native-paper';
import { Alert } from 'react-native';
import ReportTask from '@screens/TaskScreen/ReportTask/ReportTask';
import { formatCamelCase, getVietnamISOString } from '@utils/format';
import { t } from 'i18next';

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
  isChecked: boolean;
}> = ({ task, selectedDate, onCheckIn, isCheckingIn, isChecked }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const navigation = useNavigation();

  const handleToggleExpand = () => setIsExpanded(!isExpanded);

  const hasReportForDate = (task.reportTask && task.reportTask.date === selectedDate) || isChecked;
  // Check if task status is completed
  const isCompleted = task.status.toLowerCase() === 'completed';
  const isReported = task.reportTask && task.reportTask.status.toLowerCase() === 'closed';
  // Check if current date is within task duration
  const currentDateNow = getVietnamISOString();

  const isWithinCurrentDateRange = currentDateNow.split('T')[0] === selectedDate;

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

  const handleViewMaterials = (screen: string) => {
    if (screen === 'feed') {
      (navigation.navigate as any)('Materials', {
        area: task.areaId,
        taskId: task.taskId,
      });
    } else {
      (navigation.navigate as any)('MilkBatchManagementScreen');
    }
  };

  // Navigation handler
  const handleNavigateScreen = (screenType: string) => {
    switch (screenType) {
      case 'illness':
        (navigation.navigate as any)('IllnessCowRecordScreen', {
          illnessId: task.material?.illness?.illnessId,
        });
        break;
      case 'illnessDetail':
        (navigation.navigate as any)('IllnessDetailForm', {
          illnessDetail: task.material?.illnessDetail,
          taskId: task.taskId,
        });
        break;
      case 'vaccineInjection':
        (navigation.navigate as any)('InjectionScreen', {
          vaccineInjectionId: task.material?.vaccineInjection?.id,
          taskId: task.taskId,
        });
        break;
      default:
        Alert.alert(t('Error'), 'Invalid screen type');
    }
  };

  const navigateToAreaDetail = (areaId: number) => {
    (navigation.navigate as any)('AreaDetail', { areaId });
  };

  return (
    <View style={[styles.card, { borderLeftColor: priorityColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{task.taskTypeId.name}</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <AntDesign name='exclamationcircleo' size={21} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>{t('task_detail.priority')}:</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
          <Text style={[styles.priorityText, { color: '#fff' }]}>
            {t(`task_management.${task.priority}`, {
              defaultValue: task.priority,
            })}
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
          <Text style={[styles.textLabel, { color: textColor }]}>{t('task_detail.status')}:</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={[styles.tagText, { color: '#fff' }]}>
            {t(formatCamelCase(task.reportTask?.status!)) || t(formatCamelCase(task.status))}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='calendar-outline' size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>{t('task_detail.date')}:</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
          <Text style={[styles.tagText, { color: textColor }]}>
            {new Date(selectedDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {task.areaId && (
        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <Ionicons name='location-outline' size={20} color={textColor} style={styles.icon} />
            <Text style={[styles.textLabel, { color: textColor }]}>{t('task_detail.area')}:</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigateToAreaDetail(task.areaId.areaId)}
            style={[styles.tag, { backgroundColor: '#e8e8e8' }]}
          >
            <Text style={[styles.tagText, { color: textColor }]}>{task.areaId.name}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='person-outline' size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>
            {t('task_detail.assigned_by')}:
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
          <Text style={[styles.tagText, { color: textColor }]}>{task.assignerName}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='time-outline' size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>{t('task_detail.shift')}:</Text>
        </View>
        <View
          style={[
            styles.tag,
            {
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}
        >
          <Text style={[styles.tagText, { color: getShiftTextColor(task.shift) }]}>
            {t(`task_management.${formatCamelCase(task.shift)}`, {
              defaultValue: formatCamelCase(task.shift),
            })}
          </Text>
          {task.shift.toLowerCase().includes('night') ? (
            <MaterialCommunityIcons name='weather-night' size={20} style={styles.shiftIcon} />
          ) : (
            <MaterialIcons name='wb-sunny' size={20} style={styles.shiftIcon} />
          )}
        </View>
      </View>

      {/* New Equipment Section */}
      {task.taskTypeId.useEquipments && task.taskTypeId.useEquipments.length > 0 && (
        <View style={{ flexDirection: 'column' }}>
          <View style={styles.labelContainer}>
            <MaterialIcons name='build' size={20} color={textColor} style={styles.icon} />
            <Text style={[styles.textLabel, { color: textColor }]}>
              {t('task_detail.equipment')}:
            </Text>
          </View>
          <View style={styles.equipmentContainer}>
            {task.taskTypeId.useEquipments.map((equip, index) => (
              <View key={index} style={styles.equipmentItem}>
                <View style={[styles.tag]}>
                  <Text style={[styles.tagText, { color: textColor }]}>
                    {equip.equipment.name} - {equip.requiredQuantity}
                  </Text>
                </View>
                {equip.note && (
                  <View style={[styles.tag]}>
                    <Text style={[styles.tagText, { color: textColor }]}>
                      {t('task_detail.note', { defaultValue: 'Note' })}: {equip.note}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {task.completionNotes && (
        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <Ionicons name='chatbubble-outline' size={20} color={textColor} style={styles.icon} />
            <Text style={[styles.textLabel, { color: textColor }]}>{t('task_detail.notes')}:</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: '#e8e8e8' }]}>
            <Text style={[styles.tagText, { color: textColor }]}>{task.completionNotes}</Text>
          </View>
        </View>
      )}

      <View style={styles.infoRow}>
        <View style={styles.labelContainer}>
          <Ionicons name='document-text-outline' size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.textLabel, { color: textColor }]}>
            {t('task_detail.description')}:
          </Text>
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
              {isExpanded
                ? t('task_detail.show_less', { defaultValue: 'Show less' })
                : t('task_detail.show_more', { defaultValue: 'Show more' })}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {task.taskTypeId.name.toLowerCase() === 'cho bò ăn' &&
        hasReportForDate &&
        !isReported &&
        isWithinCurrentDateRange && (
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Ionicons
                name='document-text-outline'
                size={20}
                color={textColor}
                style={styles.icon}
              />
              <Text style={[styles.textLabel, { color: textColor }]}>
                {t('task_detail.view_materials')}:
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleViewMaterials('feed')} disabled={isCheckingIn}>
              <Text style={styles.materials}>
                {t('task_detail.view', { defaultValue: 'View' })}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      {task.taskTypeId.name.toLowerCase() === 'lấy sữa bò' &&
        hasReportForDate &&
        !isReported &&
        isWithinCurrentDateRange && (
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Ionicons
                name='document-text-outline'
                size={20}
                color={textColor}
                style={styles.icon}
              />
              <Text style={[styles.textLabel, { color: textColor }]}>
                {t('task_detail.view_materials')}:
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleViewMaterials('milk')} disabled={isCheckingIn}>
              <Text style={styles.materials}>
                {t('task_detail.view', { defaultValue: 'View' })}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      {(task.material?.illness ||
        task.material?.illnessDetail ||
        task.material?.vaccineInjection) &&
        hasReportForDate &&
        !isReported &&
        isWithinCurrentDateRange && (
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Ionicons
                name='document-text-outline'
                size={20}
                color={textColor}
                style={styles.icon}
              />
              <Text style={[styles.textLabel, { color: textColor }]}>
                {t('task_detail.view_materials')}:
              </Text>
            </View>
            {/* Illness Link */}
            {task.material?.illness && (
              <TouchableOpacity
                onPress={() => handleNavigateScreen('illness')}
                disabled={isCheckingIn}
              >
                <Text style={styles.materials}>{t('task_detail.view_illness')}</Text>
              </TouchableOpacity>
            )}

            {/* IllnessDetail Link */}
            {task.material?.illnessDetail && (
              <TouchableOpacity
                onPress={() => handleNavigateScreen('illnessDetail')}
                disabled={isCheckingIn}
              >
                <Text style={styles.materials}>{t('task_detail.view_illness_detail')}</Text>
              </TouchableOpacity>
            )}

            {/* VaccineInjection Link */}
            {task.material?.vaccineInjection && (
              <TouchableOpacity
                onPress={() => handleNavigateScreen('vaccineInjection')}
                disabled={isCheckingIn}
              >
                <Text style={styles.materials}>{t('task_detail.view_vaccine_injection')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      <View style={[styles.buttonsContainer, isCompleted && styles.centeredButtonContainer]}>
        {!isCompleted && !hasReportForDate && isWithinCurrentDateRange && (
          <TouchableOpacity
            style={[styles.checkInButton, isCheckingIn && styles.checkInButtonDisabled]}
            onPress={onCheckIn}
            disabled={isCheckingIn}
          >
            <Ionicons name='checkmark-done' size={24} color='#fff' />
            <Text style={styles.checkInButtonText}>
              {isCheckingIn
                ? t('message.checking_in', { defaultValue: 'Checking in...' })
                : 'Check-in'}
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
  // Local state to hold the task, updated after check-in
  const [isChecked, setIsChecked] = React.useState<boolean>(task.reportTask !== null);

  const checkInMutation = useMutation<unknown, ApiError, string | number>(
    (taskId: string | number) => apiClient.post(`/reportTask/joinTask/${taskId}`),
    {
      onSuccess: (response: any) => {
        Alert.alert(
          t('Success'),
          response.data?.message ||
            t('message.checkin_success', { defaultValue: 'Check-in successfully!' })
        );
        setIsChecked(true);
        queryClient.invalidateQueries('tasks');
      },
      onError: (err) => {
        Alert.alert(
          t('Error'),
          err.response?.data.message ||
            err.message ||
            t('message.checkin_failed', { defaultValue: 'Check-in failed!' })
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
          {
            value: 'detail',
            label: t('task_detail.title', { defaultValue: 'Task Detail' }),
            icon: 'file-document',
          },
          { value: 'report', label: t('Report Task'), icon: 'chart-bar' },
        ]}
      />
      {selectedSegment === 'detail' ? (
        <ScrollView>
          <TaskDetailContent
            task={task}
            selectedDate={selectedDate}
            onCheckIn={handleCheckIn}
            isCheckingIn={checkInMutation.isLoading}
            isChecked={isChecked}
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
    marginTop: 10,
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
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    margin: 10,
  },
  equipmentItem: {
    marginBottom: 14,
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
  materials: {
    textDecorationLine: 'underline',
  },
});

export default TaskDetail;
