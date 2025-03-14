import React, { useState } from 'react';
import {
  Button,
  Modal,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the search icon
import { Text } from 'react-native-paper';
import DividerUI from '@components/UI/DividerUI';
import Dropdown from '@components/Dropdown/Dropdown';

interface TypeFilteredProps {
  filteredType: string[];
  setSelectedFiltered?: any;
}

interface SearchInputProps extends TextInputProps {
  value: any;
  onChangeText: any;
  filteredData: any[];
  typeFiltered?: TypeFilteredProps;
}

const SearchInput = ({
  value,
  onChangeText,
  filteredData,
  typeFiltered = {
    filteredType: ['name'],
  },
  ...props
}: SearchInputProps) => {
  const filteredTypeWithDefault = [
    'name',
    ...typeFiltered.filteredType.filter((type) => type !== 'name'),
  ];
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>(
    filteredTypeWithDefault[0]
  );

  return (
    <View style={styles.searchView}>
      <View style={styles.searchFilterContainer}>
        {typeFiltered !== undefined && (
          <TouchableOpacity
            onPress={() => setIsFilterVisible(true)}
            style={styles.filterButton}
          >
            <Ionicons name="filter" size={24} color="black" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.searchButton}
        >
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search by ${activeFilter}....`}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
      </View>
      {value !== '' && (
        <View style={styles.searchFilterContainer}>
          <Text style={{ color: 'white' }}>
            {filteredData?.length}{' '}
            {(filteredData?.length as number) > 1 ? 'results' : 'result'} found
          </Text>
        </View>
      )}
      {typeFiltered !== undefined && (
        <Modal
          visible={isFilterVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
              <Text style={styles.modalTitle}>Select Filter</Text>
              <DividerUI />
              {typeFiltered?.filteredType.map(
                (element: string, index: number) => (
                  <Button
                    key={index}
                    title={`Filter by ${element}`}
                    onPress={() => {
                      typeFiltered.setSelectedFiltered(element);
                      setActiveFilter(element);
                      setIsFilterVisible(false);
                    }}
                    color={activeFilter === element ? 'blue' : 'gray'}
                  />
                )
              )}
              <Button title="Close" onPress={() => setIsFilterVisible(false)} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    padding: 7,
    backgroundColor: 'white',
    borderRadius: 7,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    gap: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 5,
    paddingLeft: 10,
    flex: 1,
    backgroundColor: 'white',
  },
  searchButton: {
    padding: 7,
    backgroundColor: 'white',
    borderRadius: 7,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchView: {
    backgroundColor: 'green',
    shadowColor: 'black',
    paddingVertical: 10,
    borderEndEndRadius: 10,
    borderEndStartRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
});

export default SearchInput;
