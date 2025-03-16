import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import SearchInput from '@components/Input/Search/SearchInput';
import Layout from '@components/layout/Layout';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo for icons
import { RefreshControl } from 'react-native-gesture-handler';

interface Task {
  taskId: number;
  description: string;
  status: string;
  fromDate: string;
  toDate: string;
  areaId: {
    areaId: number;
    name: string;
  };
  taskTypeId: {
    taskTypeId: number;
    name: string;
  };
  assigner: {
    id: number;
    name: string;
  };
  assignee: {
    id: number;
    name: string;
  };
  priority: string;
  shift: string;
  completionNotes: string | null;
}

// Function to get week dates starting from a given Monday
const getWeekDates = (startDate: Date) => {
  const monday = new Date(startDate);
  monday.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));

  // Generate array of dates from Monday to Sunday
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });

  return weekDates;
};

// Fetch tasks
const fetchTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get('/tasks/myTasks');
  console.log('Fetched tasks:', response.data); // Debug log
  return response.data;
};

// Normalize shift values and filter tasks for a specific day and shift
const getTasksForCell = (tasks: Task[], date: Date, shift: string) => {
  console.log(`Filtering tasks for date: ${date.toISOString()}, shift: ${shift}`); // Debug log
  return tasks.filter((task) => {
    const fromDate = new Date(task.fromDate);
    const toDate = new Date(task.toDate);
    const cellDateStart = new Date(date);
    cellDateStart.setHours(0, 0, 0, 0);
    const cellDateEnd = new Date(date);
    cellDateEnd.setHours(23, 59, 59, 999);

    // Normalize shift values
    const normalizedTaskShift = task.shift.toLowerCase().includes('day')
      ? 'Day'
      : task.shift.toLowerCase().includes('night')
      ? 'Night'
      : task.shift;

    const matchesDate = cellDateStart >= fromDate && cellDateEnd <= toDate;
    const matchesShift = normalizedTaskShift.toLowerCase() === shift.toLowerCase();

    console.log(
      `Task ${task.taskId}: from ${fromDate.toISOString()} to ${toDate.toISOString()}, shift: ${
        task.shift
      }, normalized: ${normalizedTaskShift}, matchesDate: ${matchesDate}, matchesShift: ${matchesShift}`
    ); // Debug log

    return matchesDate && matchesShift;
  });
};

// Calculate tasks for a specific day (across all shifts)
const getTasksForDay = (tasks: Task[], date: Date) => {
  return tasks.filter((task) => {
    const fromDate = new Date(task.fromDate);
    const toDate = new Date(task.toDate);
    const cellDateStart = new Date(date);
    cellDateStart.setHours(0, 0, 0, 0);
    const cellDateEnd = new Date(date);
    cellDateEnd.setHours(23, 59, 59, 999);

    return cellDateStart >= fromDate && cellDateEnd <= toDate;
  }).length;
};

// Simplified Task Card for the grid
const NewTaskCard = ({ task, onPress }: { task: Task; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.taskCard} onPress={onPress}>
      <Text style={styles.taskCardTitle}>{task.taskTypeId.name}</Text>
      <Text style={styles.taskCardText}>Priority: {task.priority}</Text>
    </TouchableOpacity>
  );
};

// Task Detail Modal
const TaskDetailModal = ({
  visible,
  task,
  onClose,
}: {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
}) => {
  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{task.taskTypeId.name}</Text>
          <Text style={styles.modalText}>
            Time to do: {new Date(task.fromDate).toLocaleDateString()} to{' '}
            {new Date(task.toDate).toLocaleDateString()}
          </Text>
          <Text style={styles.modalText}>Priority: {task.priority}</Text>
          <Text style={styles.modalText}>Description: {task.description}</Text>
          <Text style={styles.modalText}>Status: {task.status}</Text>
          <Text style={styles.modalText}>Area: {task.areaId.name}</Text>
          <Text style={styles.modalText}>Assigner: {task.assigner.name}</Text>
          <Text style={styles.modalText}>Assignee: {task.assignee.name}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Main TaskScreen component
const TaskScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'description' | 'status' | 'area' | 'taskType' | 'assigner' | 'assignee' | 'priority' | 'shift'
  >('description');
  const [currentMonday, setCurrentMonday] = useState(() => {
    // Set the initial week to include March 2025 to match your data
    const initialMonday = new Date('2025-03-03'); // Monday of the week containing March 4
    return initialMonday;
  });
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // For segmented buttons
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false); // New state for refresh control

  const { data: tasks, isLoading, isError, error, refetch } = useQuery<Task[]>('tasks', fetchTasks);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('Refetching data...');
      await refetch();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Apply search filter
  const filteredTasks = tasks?.filter((task) => {
    if (selectedFilter === 'description') {
      return task.description.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'status') {
      return task.status.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'area') {
      return task.areaId.name.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'taskType') {
      return task.taskTypeId.name.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'assigner') {
      return task.assigner.name.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'assignee') {
      return task.assignee.name.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'priority') {
      return task.priority.toLowerCase().includes(searchText.toLowerCase());
    } else if (selectedFilter === 'shift') {
      return task.shift.toLowerCase().includes(searchText.toLowerCase());
    }
    return false;
  });

  console.log('Filtered tasks:', filteredTasks); // Debug log

  // Get week dates
  const weekDates = getWeekDates(currentMonday);
  const shifts = ['Day', 'Night'];

  // Navigation handlers
  const goToPreviousWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(newMonday);
    // Reset selected day to the first day of the new week
    setSelectedDayIndex(0);
  };

  const goToNextWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(newMonday);
    // Reset selected day to the first day of the new week
    setSelectedDayIndex(0);
  };

  // Get month and year for the header based on Monday of the week
  const monthYear = currentMonday.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Handle task card press
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  return (
    <Layout>
      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchFilterContainer}>
          <SearchInput
            filteredData={filteredTasks as Task[]}
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

        {/* Navigation Buttons and Month-Year Header */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
            <Ionicons name='chevron-back' size={24} color='#007bff' />
          </TouchableOpacity>
          <Text style={styles.headerText}>{monthYear}</Text>
          <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
            <Ionicons name='chevron-forward' size={24} color='#007bff' />
          </TouchableOpacity>
        </View>

        {/* Segmented Buttons for Days with Badge */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.segmentContainer}
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
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}{' '}
                    {date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' })}
                  </Text>
                  {taskCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{taskCount}</Text>
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
          <Text>{(error as Error).message}</Text>
        ) : (
          <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Shift Rows for Selected Day */}
            {shifts.map((shift) => (
              <View key={shift} style={styles.row}>
                {/* Shift Label */}
                <View style={styles.shiftLabel}>
                  <Text style={styles.shiftText}>{shift}</Text>
                </View>
                {/* Tasks for Selected Day */}
                <View style={styles.dayColumn}>
                  <ScrollView nestedScrollEnabled style={styles.taskContainer}>
                    {(() => {
                      const tasksForCell = getTasksForCell(
                        filteredTasks || [],
                        weekDates[selectedDayIndex],
                        shift
                      );
                      console.log(
                        `Tasks for ${shift} on ${weekDates[selectedDayIndex].toISOString()}:`,
                        tasksForCell
                      ); // Debug log
                      return tasksForCell.length > 0 ? (
                        tasksForCell.map((task) => (
                          <NewTaskCard
                            key={task.taskId}
                            task={task}
                            onPress={() => handleTaskPress(task)}
                          />
                        ))
                      ) : (
                        <Text style={styles.noTasksText}>No tasks</Text>
                      );
                    })()}
                  </ScrollView>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Task Detail Modal */}
        <TaskDetailModal
          visible={modalVisible}
          task={selectedTask}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </Layout>
  );
};

// Styles
const { width } = Dimensions.get('window');
const shiftLabelWidth = 60;
const dayColumnWidth = width - shiftLabelWidth;

const styles = StyleSheet.create({
  container: {
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
  segmentButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  segmentButtonSelected: {
    backgroundColor: '#007bff',
  },
  segmentButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 14,
    color: '#333',
  },
  segmentTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
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
    minHeight: 150,
    paddingVertical: 5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TaskScreen;
