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
import SearchInput from '@components/Input/Search/SearchInput';
import Layout from '@components/layout/Layout';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Task {
  taskId: number;
  description: string;
  status: string;
  fromDate: string;
  toDate: string;
  areaName: string;
  taskTypeId: {
    taskTypeId: number;
    name: string;
    roleId: {
      id: number;
      name: string;
    };
    description: string;
  };
  assignerName: string;
  assigneeName: string;
  priority: string;
  shift: string;
  completionNotes: string | null;
  reportTask: {
    reportTaskId: number;
    description: string | null;
    status: string;
    startTime: string;
    endTime: string | null;
    date: string;
    comment: string | null;
    reviewer_id: any;
    reportImages: any[];
  } | null;
  illness: any | null;
  vaccineInjection: any | null;
}

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

  const response = await apiClient.post('/tasks/myTasks/by-date-range', requestBody);
  const tasksByDate = response.data;

  const allTasks: Task[] = [];
  Object.entries(tasksByDate).forEach(([_, tasks]: [string, any]) => {
    if (Array.isArray(tasks) && tasks) {
      allTasks.push(...tasks);
    }
  });

  return allTasks;
};

const getTasksForCell = (tasks: Task[], date: Date, shift: string) => {
  const cellDate = new Date(date);
  cellDate.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    const fromDate = new Date(task.fromDate);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = task.toDate ? new Date(task.toDate) : fromDate;
    toDate.setHours(23, 59, 59, 999);

    const normalizedTaskShift = task.shift.toLowerCase().includes('day') ? 'Day' : 'Night';
    return (
      cellDate >= fromDate &&
      cellDate <= toDate &&
      normalizedTaskShift.toLowerCase() === shift.toLowerCase()
    );
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

const checkUnreportedTasks = (tasks: Task[], currentDate: Date) => {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const todayTasks = tasks.filter((task) => {
    const fromDate = new Date(task.fromDate);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = task.toDate ? new Date(task.toDate) : fromDate;
    toDate.setHours(23, 59, 59, 999);

    return today >= fromDate && today <= toDate;
  });

  const unreportedTasks = todayTasks.filter((task) => !task.reportTask);
  return unreportedTasks.length > 0 ? unreportedTasks : null;
};

const NewTaskCard = ({ task, onPress }: { task: Task; onPress: () => void }) => (
  <TouchableOpacity style={styles.taskCard} onPress={onPress}>
    <Text style={styles.taskCardTitle}>{task.taskTypeId.name}</Text>
    <Text style={styles.taskCardText}>Priority: {task.priority}</Text>
  </TouchableOpacity>
);

const TaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'description' | 'status' | 'area' | 'taskType' | 'assigner' | 'assignee' | 'priority' | 'shift'
  >('description');
  const [currentMonday, setCurrentMonday] = useState(() => {
    const today = new Date('2025-03-23');
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday;
  });
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
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

  useEffect(() => {
    if (tasks) {
      const unreported = checkUnreportedTasks(tasks, new Date());
      if (unreported) {
        Alert.alert(
          'Reminder',
          `You have ${unreported.length} task(s) today without a report. Please submit your reports.`,
          [{ text: 'OK', onPress: () => console.log('Reminder acknowledged') }]
        );
      }
    }
  }, [tasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredTasks =
    tasks?.filter((task) => {
      switch (selectedFilter) {
        case 'description':
          return task.description.toLowerCase().includes(searchText.toLowerCase());
        case 'status':
          return task.status.toLowerCase().includes(searchText.toLowerCase());
        case 'area':
          return task.areaName.toLowerCase().includes(searchText.toLowerCase());
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

  // In TaskScreen
  const handleTaskPress = (task: Task) => {
    (navigation.navigate as any)('TaskDetail', {
      task,
      selectedDate: weekDates[selectedDayIndex].toISOString().split('T')[0],
    });
  };

  return (
    <Layout isScrollable={true}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.searchFilterContainer}>
            <SearchInput
              filteredData={filteredTasks}
              onChangeText={setSearchText}
              value={searchText}
              typeFiltered={{
                filteredType: [
                  'description',
                  'status',
                  'area',
                  'taskType',
                  'assigner',
                  'assignee',
                  'priority',
                  'shift',
                ],
                setSelectedFiltered: setSelectedFilter,
              }}
            />
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

          {isLoading ? (
            <Text>Loading...</Text>
          ) : isError ? (
            <Text style={styles.errorText}>
              {error
                ? `Error: ${(error as Error).message || 'An unknown error occurred'}`
                : 'Error: Unknown'}
            </Text>
          ) : (
            <View>
              {shifts.map((shift) => (
                <View key={shift} style={styles.row}>
                  <View style={styles.shiftLabel}>
                    <Text style={styles.shiftText}>{shift}</Text>
                  </View>
                  <View style={styles.dayColumn}>
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
                            />
                          ))
                        ) : (
                          <Text style={styles.noTasksText}>No tasks</Text>
                        );
                      })()}
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefresh}
                disabled={refreshing}
              >
                <Ionicons
                  name={refreshing ? 'refresh-circle' : 'refresh'}
                  size={24}
                  color={refreshing ? '#888' : '#007bff'}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </Layout>
  );
};

const { width } = Dimensions.get('window');
const shiftLabelWidth = 60;
const dayColumnWidth = width - shiftLabelWidth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  searchFilterContainer: {
    marginBottom: 10,
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
  },
  segmentContentContainer: {
    paddingHorizontal: 5,
  },
  segmentButton: {
    width: 80,
    paddingVertical: 8,
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
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  shiftLabel: {
    width: shiftLabelWidth,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  shiftText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayColumn: {
    width: dayColumnWidth,
    padding: 5,
  },
  taskContainer: {
    paddingVertical: 5, // Removed minHeight to allow natural growth
  },
  taskCard: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  taskCardText: {
    fontSize: 12,
    marginBottom: 3,
  },
  noTasksText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  refreshButton: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default TaskScreen;
