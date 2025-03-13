import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useQuery } from 'react-query';
import apiClient from '@config/axios/axios';
import SearchInput from '@components/Input/Search/SearchInput';
import Layout from '@components/layout/Layout';

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

const fetchTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get('/tasks/myTasks');
  console.log(response);
  return response.data;
};

const TaskScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'description' | 'status' | 'area' | 'taskType' | 'assigner' | 'assignee' | 'priority' | 'shift'
  >('description');

  const { data: tasks, isLoading, isError, error } = useQuery<Task[]>('tasks', fetchTasks);

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

  const sortedTasks = filteredTasks?.sort(
    (a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
  );

  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.searchFilterContainer}>
          <SearchInput
            filteredData={sortedTasks as Task[]}
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

        {isLoading ? (
          <Text>Loading...</Text>
        ) : isError ? (
          <Text>{(error as Error).message}</Text>
        ) : (
          <FlatList
            data={sortedTasks}
            keyExtractor={(item) => item.taskId.toString()}
            renderItem={({ item }) => <CardTask task={item} />}
          />
        )}
      </View>
    </Layout>
  );
};

const CardTask = ({ task }: { task: Task }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{task.description}</Text>
        <Text style={styles.cardStatus}>{task.status}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text>
          From: {task.fromDate} To: {task.toDate}
        </Text>
        <Text>Area: {task.areaId.name}</Text>
        <Text>Task Type: {task.taskTypeId.name}</Text>
        <Text>Assigner: {task.assigner.name}</Text>
        <Text>Assignee: {task.assignee.name}</Text>
        <Text>Priority: {task.priority}</Text>
        <Text>Shift: {task.shift}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  searchFilterContainer: {
    marginBottom: 10,
  },
  card: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardStatus: {
    backgroundColor: '#007bff',
    padding: 4,
    borderRadius: 5,
    color: '#fff',
    fontSize: 10,
  },
  cardContent: {
    marginTop: 10,
  },
});

export default TaskScreen;
