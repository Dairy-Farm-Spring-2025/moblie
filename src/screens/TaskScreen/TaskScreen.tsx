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
import { formatCamelCase, getVietnamISOString } from '@utils/format';
import WeatherCard from '@components/WeatherCard/WeatherCard';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

const handleLanguageDate = (lang: string) => {
  if (lang === 'vi') {
    return 'vi-VN';
  }
  return 'en-US';
};

const getWeekDates = (currentDate: Date) => {
  const today = new Date(currentDate.toISOString().split('T')[0]);
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
};

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
  const tasksByDate = response.data || {};

  // Map to store tasks by taskId
  const taskMap = new Map<number, Task>();
  // Map to store reportTask by taskId and date
  const reportTaskMap = new Map<string, Task['reportTask']>();

  // Process tasks and collect reportTask data
  Object.entries(tasksByDate).forEach(([date, tasks]: [string, any]) => {
    if (Array.isArray(tasks) && tasks.length > 0) {
      tasks.forEach((task: Task) => {
        // Store the task in taskMap (overwrite with latest task data, assuming core task data is consistent)
        taskMap.set(task.taskId, { ...task, reportTask: null }); // Clear reportTask to avoid duplication
        // Store reportTask for this specific date
        if (task.reportTask) {
          reportTaskMap.set(`${task.taskId}-${date}`, task.reportTask);
        }
      });
    }
  });

  // Create final tasks array, adding reportTask for each applicable date
  const allTasks: Task[] = [];
  taskMap.forEach((task) => {
    const taskFromDate = new Date(task.fromDate);
    const taskToDate = task.toDate ? new Date(task.toDate) : taskFromDate;
    // Generate tasks for each date in the task's range within the requested range
    for (
      let date = new Date(Math.max(taskFromDate.getTime(), fromDate.getTime()));
      date <= new Date(Math.min(taskToDate.getTime(), toDate.getTime()));
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split('T')[0];
      const reportTask = reportTaskMap.get(`${task.taskId}-${dateStr}`) || null;
      allTasks.push({
        ...task,
        reportTask,
      });
    }
  });

  return allTasks;
};

const getTasksForCell = (tasks: Task[], date: Date, shift: string) => {
  const cellDate = new Date(date.toISOString().split('T')[0]);
  const cellDateStr = cellDate.toISOString().split('T')[0];
  const taskMap = new Map<number, Task[]>();

  // Step 1: Collect all matching tasks, grouped by taskId
  tasks.forEach((task) => {
    const fromDate = new Date(task.fromDate);
    const toDate = task.toDate ? new Date(task.toDate) : fromDate;
    const isDayShift = task.shift.toLowerCase().includes('day');
    const normalizedTaskShift = isDayShift ? 'Day' : 'Night';
    const isShiftMatch = normalizedTaskShift === shift;
    const isDateMatch = cellDate >= fromDate && cellDate <= toDate;

    console.log(
      'taskID',
      task.taskId,
      'fromDate',
      fromDate,
      'toDate',
      toDate,
      'cellDate',
      cellDate,
      'isDateMatch',
      isDateMatch,
      'isShiftMatch',
      isShiftMatch,
      'reportTask',
      task.reportTask
    );

    if (isDateMatch && isShiftMatch) {
      // Group tasks by taskId
      if (!taskMap.has(task.taskId)) {
        taskMap.set(task.taskId, []);
      }
      taskMap.get(task.taskId)!.push(task);
    }
  });

  // Step 2: Select one task per taskId, prioritizing reportTask.date === cellDateStr
  const uniqueTasks: Task[] = [];
  taskMap.forEach((taskList, taskId) => {
    // Find a task with reportTask.date matching cellDateStr
    let selectedTask = taskList.find(
      (task) => task.reportTask && task.reportTask.date === cellDateStr
    );
    // If no matching reportTask, use the first task with reportTask: null (or any task if none are null)
    if (!selectedTask) {
      selectedTask = taskList.find((task) => !task.reportTask) || taskList[0];
    }
    uniqueTasks.push(selectedTask);
  });

  return uniqueTasks;
};

const getTasksForDay = (tasks: Task[], date: Date) => {
  const cellDate = new Date(date.toISOString().split('T')[0]);
  const uniqueTaskIds = new Set<number>();
  tasks.forEach((task) => {
    const fromDate = new Date(task.fromDate);
    const toDate = task.toDate ? new Date(task.toDate) : fromDate;
    if (cellDate >= fromDate && cellDate <= toDate) {
      uniqueTaskIds.add(task.taskId);
    }
  });
  return uniqueTaskIds.size;
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
  const selectedDateNormalized = selectedDate.toISOString().split('T')[0];
  console.log('selectedDateNormalized', selectedDateNormalized);
  console.log('task.reportTask.date:', task.reportTask && task.reportTask.date);

  const hasReportForSelectedDate =
    task.reportTask && task.reportTask.date === selectedDateNormalized;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#d9363e';
      case 'high':
        return '#ff4d4f';
      case 'medium':
        return '#ffa940';
      case 'low':
        return '#52c41a';
      default:
        return '#f8f9fa';
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
        <Text style={[styles.taskCardTitle, { color: textColor }]}>
          {task.taskTypeId.name || 'Unknown'}
        </Text>
        <View style={[styles.priorityBadge, { borderColor: textColor }]}>
          <Text style={[styles.priorityBadgeText, { color: textColor }]}>
            {t(`task_management.${task.priority}`, { defaultValue: task.priority })}
          </Text>
        </View>
      </View>
      {task.areaId ? (
        <Text style={[styles.taskCardText, { color: textColor }]}>{`${t('task_management.area', {
          defaultValue: 'Area',
        })}: ${task.areaId && (task.areaId.name || 'Unknown')}`}</Text>
      ) : (
        <Text style={[styles.taskCardText, { color: textColor }]}>{`${t('task_management.Status', {
          defaultValue: 'Status',
        })}: ${task.status && (task.status || 'Unknown')}`}</Text>
      )}
      <View style={styles.reportStatusContainer}>
        <Ionicons
          name={hasReportForSelectedDate ? 'checkmark-circle' : 'alert-circle'}
          size={16}
          color={hasReportForSelectedDate ? (isLightBackground ? '#333' : '#fff') : '#ffd700'}
          style={styles.reportStatusIcon}
        />
        <Text style={[styles.reportStatusText, { color: textColor }]}>
          {hasReportForSelectedDate
            ? task.reportTask && task.reportTask.status.toLowerCase() === 'closed'
              ? t('task_management.report_submitted', { defaultValue: 'Submitted' })
              : task.reportTask && task.reportTask.status.toLowerCase() === 'pending'
              ? t('task_management.report_processing', {
                  defaultValue: 'Already report waiting for review',
                })
              : t('task_management.IsCheckin_But_Not_Report', {
                  defaultValue: 'Already check-in but not submitted',
                })
            : t('task_management.Not_Checkin', { defaultValue: 'Not check-in yet' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const TaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const [currentMonday, setCurrentMonday] = useState(() => {
    const today = new Date(getVietnamISOString().split('T')[0]);
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday;
  });
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const today = new Date(getVietnamISOString().split('T')[0]);
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

  const monthYear = currentMonday.toLocaleDateString(handleLanguageDate(i18n.language), {
    month: 'long',
    year: 'numeric',
  });

  const handleTaskPress = (task: Task) => {
    console.log('Task pressed:', task);
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
            const taskCount = tasks ? getTasksForDay(tasks, date) : 0;
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
                    {date.toLocaleDateString(handleLanguageDate(i18n.language), {
                      weekday: 'short',
                    })}
                  </Text>
                  <Text
                    style={[
                      styles.segmentDateText,
                      selectedDayIndex === index && styles.segmentTextSelected,
                    ]}
                  >
                    {date.toLocaleDateString(handleLanguageDate(i18n.language), {
                      day: '2-digit',
                      month: '2-digit',
                    })}
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
                    tasks || [],
                    weekDates[selectedDayIndex],
                    shift
                  );
                  return tasksForCell.length > 0;
                })
                .map((shift) => (
                  <View key={shift} style={styles.shiftSection}>
                    <View style={styles.shiftHeader}>
                      <Text style={styles.shiftText}>
                        {shift === 'Day'
                          ? t('task_management.Day', { defaultValue: 'Day' })
                          : t('task_management.Night', { defaultValue: 'Night' })}
                      </Text>
                    </View>
                    <View style={styles.taskContainer}>
                      {(() => {
                        const tasksForCell = getTasksForCell(
                          tasks || [],
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
                          <Text style={styles.noTasksText}>
                            {t('task_management.NoTasks', { defaultValue: 'No tasks' })}
                          </Text>
                        );
                      })()}
                    </View>
                  </View>
                ))}
              {shifts.every((shift) => {
                const tasksForCell = getTasksForCell(
                  tasks || [],
                  weekDates[selectedDayIndex],
                  shift
                );
                return tasksForCell.length === 0;
              }) && <Text style={styles.noTasksText}>{t('No tasks for this day')}</Text>}
            </View>
          )}
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
