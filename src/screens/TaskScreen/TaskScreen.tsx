import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery, UseQueryResult } from 'react-query';
import apiClient from '@config/axios/axios';
import Layout from '@components/layout/Layout';
import LoadingScreen from '@components/LoadingScreen/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Task } from '@model/Task/Task';
import { formatCamelCase } from '@utils/format';
import WeatherCard from '@components/WeatherCard/WeatherCard';
import { useTranslation } from 'react-i18next';

const getWeekDates = (currentDate: Date) => {
  const today = new Date(currentDate);
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
};
const { t } = useTranslation();
const fetchTasksByDateRange = async ({
  fromDate,
  toDate,
}: {
  fromDate: Date;
  toDate: Date;
}): Promise<Task[]> => {
  const requestBody = {
    fromDate: fromDate.toISOString().split('T')[0],
    toDate: toDate.toISOString().split('T')[0],
  };
  const response = await apiClient.post('/tasks/myTasks/by-date-range/mb', requestBody);
  console.log('task', response.data);
  const tasksByDate = response.data || {};
  const allTasks: Task[] = [];
  Object.entries(tasksByDate).forEach(([_, tasks]: [string, any]) => {
    if (Array.isArray(tasks) && tasks.length > 0) {
      allTasks.push(...tasks);
    }
  });
  const taskMap = new Map<number, Task>();
  allTasks.forEach((task) => {
    if (!taskMap.has(task.taskId)) {
      taskMap.set(task.taskId, task);
    } else {
      const existingTask = taskMap.get(task.taskId)!;
      if (!existingTask.reportTask && task.reportTask) {
        existingTask.reportTask = task.reportTask;
      }
    }
  });
  return Array.from(taskMap.values());
};

const getTasksForCell = (tasks: Task[], date: Date, shift: string) => {
  const cellDate = new Date(date);
  cellDate.setHours(0, 0, 0, 0);
  return tasks.filter((task) => {
    const fromDate = new Date(task.fromDate);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = task.toDate ? new Date(task.toDate) : fromDate;
    toDate.setHours(23, 59, 59, 999);
    const isDayShift = task.shift.toLowerCase().includes('day');
    const normalizedTaskShift = isDayShift ? 'Day' : 'Night';
    const isShiftMatch = normalizedTaskShift === shift;
    const isDateMatch = cellDate >= fromDate && cellDate <= toDate;
    return isDateMatch && isShiftMatch;
  });
};

const getTasksForDay = (tasks: Task[], date: Date) => {
  const cellDate = new Date(date);
  cellDate.setHours(0, 0, 0, 0);
  return tasks.filter((task) => {
    const fromDate = new Date(task.fromDate);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = task.toDate ? new Date(task.toDate) : fromDate;
    toDate.setHours(23, 59, 59, 999);
    return cellDate >= fromDate && cellDate <= toDate;
  }).length;
};

const NewTaskCard = ({
  task,
  onPress,
  selectedDate,
}: {
  task: Task;
  onPress: () => void;
  selectedDate: Date;
}) => {
  const selectedDateNormalized = new Date(selectedDate);
  selectedDateNormalized.setHours(0, 0, 0, 0);
  const hasReportForSelectedDate =
    task.reportTask &&
    new Date(task.reportTask.date).setHours(0, 0, 0, 0) === selectedDateNormalized.getTime();

  // Determine priority color
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
        return '#f8f9fa'; // Light Grey
    }
  };

  const priorityColor = getPriorityColor(task.priority);
  const isLightBackground = priorityColor === '#f8f9fa' || priorityColor === '#52c41a';
  const textColor = isLightBackground ? '#333' : '#fff';

  return (
    <TouchableOpacity
      style={[
        styles.taskCard,
        {
          backgroundColor: priorityColor,
          borderLeftColor: priorityColor === '#f8f9fa' ? '#8c8c8c' : priorityColor,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.taskHeader}>
        <Text style={[styles.taskCardTitle, { color: textColor }]}>{task.taskTypeId.name}</Text>
        <View style={[styles.priorityBadge, { borderColor: textColor }]}>
          <Text style={[styles.priorityBadgeText, { color: textColor }]}>{task.priority}</Text>
        </View>
      </View>
      <Text style={[styles.taskCardText, { color: textColor }]}>
        Shift: {formatCamelCase(task.shift)}
      </Text>
      <View style={styles.reportStatusContainer}>
        <Ionicons
          name={hasReportForSelectedDate ? 'checkmark-circle' : 'alert-circle'}
          size={16}
          color={hasReportForSelectedDate ? (isLightBackground ? '#52c41a' : '#fff') : '#ffd700'}
          style={styles.reportStatusIcon}
        />
        <Text style={[styles.reportStatusText, { color: textColor }]}>
          {hasReportForSelectedDate ? 'Submitted' : 'Not Submitted'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const TaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'description' | 'status' | 'area' | 'taskType' | 'assigner' | 'assignee' | 'priority' | 'shift'
  >('description');
  const [currentMonday, setCurrentMonday] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday;
  });
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  });
  const [refreshing, setRefreshing] = useState(false);

  const weekDates = getWeekDates(currentMonday);
  const queryKey = ['tasks', weekDates[0].toISOString(), weekDates[6].toISOString()];

  const {
    data: tasks,
    isLoading,
    isError,
    error,
    refetch,
  }: UseQueryResult<Task[], Error> = useQuery(
    queryKey,
    () => fetchTasksByDateRange({ fromDate: weekDates[0], toDate: weekDates[6] }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTasks =
    tasks?.filter((task) => {
      switch (selectedFilter) {
        case 'description':
          return task.description.toLowerCase().includes(searchText.toLowerCase());
        case 'status':
          return task.status.toLowerCase().includes(searchText.toLowerCase());
        case 'area':
          return task.areaId.name.toLowerCase().includes(searchText.toLowerCase());
        case 'taskType':
          return task.taskTypeId.name.toLowerCase().includes(searchText.toLowerCase());
        case 'assigner':
          return task.assignerName.toLowerCase().includes(searchText.toLowerCase());
        case 'assignee':
          return task.assigneeName.toLowerCase().includes(searchText.toLowerCase());
        case 'priority':
          return task.priority.toLowerCase().includes(searchText.toLowerCase());
        case 'shift':
          return task.shift.toLowerCase().includes(searchText.toLowerCase());
        default:
          return false;
      }
    }) || [];

  const shifts = ['Day', 'Night'];

  const goToPreviousWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(newMonday);
    setSelectedDayIndex(0);
  };

  const goToNextWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(newMonday);
    setSelectedDayIndex(0);
  };

  const monthYear = currentMonday.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleTaskPress = (task: Task) => {
    (navigation.navigate as any)('TaskDetail', {
      task,
      selectedDate: weekDates[selectedDayIndex].toISOString().split('T')[0],
    });
  };

  if (isLoading && !tasks) {
    return <LoadingScreen message='Fetching tasks...' fullScreen={true} color='#007bff' />;
  }

  return (
    <Layout isScrollable={true} onRefresh={onRefresh}>
      <View style={styles.container}>
        <View style={styles.searchFilterContainer}>
          <WeatherCard date={weekDates[selectedDayIndex]} />
        </View>
        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
            <Ionicons name='chevron-back' size={24} color='#007bff' />
          </TouchableOpacity>
          <Text style={styles.headerText}>{monthYear}</Text>
          <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
            <Ionicons name='chevron-forward' size={24} color='#007bff' />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.segmentContainer}
          contentContainerStyle={styles.segmentContentContainer}
        >
          {weekDates.map((date, index) => {
            const taskCount = filteredTasks ? getTasksForDay(filteredTasks, date) : 0;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.segmentButton,
                  selectedDayIndex === index && styles.segmentButtonSelected,
                ]}
                onPress={() => setSelectedDayIndex(index)}
              >
                <View style={styles.segmentButtonContent}>
                  <Text
                    style={[
                      styles.segmentText,
                      selectedDayIndex === index && styles.segmentTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text
                    style={[
                      styles.segmentDateText,
                      selectedDayIndex === index && styles.segmentTextSelected,
                    ]}
                  >
                    {date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' })}
                  </Text>
                  {taskCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{taskCount > 99 ? '99+' : taskCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <LoadingScreen message='Loading tasks...' />
          ) : isError ? (
            <Text style={styles.errorText}>
              {error
                ? `Error: ${(error as Error).message || 'An unknown error occurred'}`
                : 'Error: Unknown'}
            </Text>
          ) : (
            <View style={styles.tableContainer}>
              {shifts
                .filter((shift) => {
                  const tasksForCell = getTasksForCell(
                    filteredTasks,
                    weekDates[selectedDayIndex],
                    shift
                  );
                  return tasksForCell.length > 0; // Only include shifts with tasks
                })
                .map((shift) => (
                  <View key={shift} style={styles.shiftSection}>
                    <View style={styles.shiftHeader}>
                      <Text style={styles.shiftText}>{shift}</Text>
                    </View>
                    <View style={styles.taskContainer}>
                      {(() => {
                        const tasksForCell = getTasksForCell(
                          filteredTasks,
                          weekDates[selectedDayIndex],
                          shift
                        );
                        return tasksForCell.length > 0 ? (
                          tasksForCell.map((task, index) => (
                            <NewTaskCard
                              key={`${task.taskId}-${
                                weekDates[selectedDayIndex].toISOString().split('T')[0]
                              }-${index}`}
                              task={task}
                              onPress={() => handleTaskPress(task)}
                              selectedDate={weekDates[selectedDayIndex]}
                            />
                          ))
                        ) : (
                          <Text style={styles.noTasksText}>No tasks</Text>
                        );
                      })()}
                    </View>
                  </View>
                ))}
              {shifts.every((shift) => {
                const tasksForCell = getTasksForCell(
                  filteredTasks,
                  weekDates[selectedDayIndex],
                  shift
                );
                return tasksForCell.length === 0;
              }) && <Text style={styles.noTasksText}>No tasks for this day</Text>}
            </View>
          )}
          <View style={{ height: 300 }} />
        </ScrollView>
      </View>
    </Layout>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  searchFilterContainer: {
    marginBottom: 5,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButton: {
    padding: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  segmentContainer: {
    marginBottom: 10,
    paddingBottom: 14,
  },
  segmentContentContainer: {
    paddingHorizontal: 2,
  },
  segmentButton: {
    width: 80,
    height: 50,
    paddingHorizontal: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonSelected: {
    backgroundColor: '#007bff',
  },
  segmentButtonContent: {
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  segmentDateText: {
    fontSize: 10,
    color: '#333',
    marginTop: 2,
  },
  segmentTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -8,
    right: -20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableContainer: {
    marginTop: 0,
  },
  shiftSection: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  shiftHeader: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  shiftText: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskContainer: {
    padding: 10,
  },
  taskCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderLeftWidth: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskCardText: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  reportStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportStatusIcon: {
    marginRight: 6,
  },
  reportStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noTasksText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default TaskScreen;
