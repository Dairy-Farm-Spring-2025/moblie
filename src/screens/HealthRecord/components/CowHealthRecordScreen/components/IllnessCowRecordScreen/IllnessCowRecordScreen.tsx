import { IllnessCow, IllnessDetail } from '@model/Cow/Cow';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, SegmentedButtons, Text } from 'react-native-paper';
import IllnessCowRecordForm from './components/IllnessCowRecordForm.tsx/IllnessCowRecordForm';
import IllnessDetailRecord from './components/IllnessDetail/IllnessDetail';
import apiClient from '@config/axios/axios';
import { useQuery } from 'react-query';
import TitleNameCows from '@components/TitleNameCows/TitleNameCows';
type RootStackParamList = {
  IllnessCowRecordScreen: { illnessId: number };
};

type IllnessCowRecordScreenRouteProp = RouteProp<RootStackParamList, 'IllnessCowRecordScreen'>;
const fetchIllness = async (illnessId: number): Promise<IllnessCow> => {
  const response = await apiClient.get(`/illness/${illnessId}`);
  return response.data;
};
const IllnessCowRecordScreen = () => {
  const [selectedSegment, setSelectedSegment] = useState('illness-record');
  const route = useRoute<IllnessCowRecordScreenRouteProp>();
  const { illnessId } = route.params;
  const {
    data: illness,
    isLoading,
    isError,
    refetch,
  } = useQuery(['illness', illnessId], () => fetchIllness(illnessId));

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError || !illness) {
    return (
      <Text
        style={{
          color: 'red',
        }}
      >
        Failed to load cow details
      </Text>
    );
  }

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <TitleNameCows title='Illness Record - ' cowName={illness.cowEntity.name} />
      <SegmentedButtons
        style={styles.segmentedButtons}
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          { value: 'illness-record', label: 'Illness Record', icon: 'cow' },
          { value: 'illness-detail', label: 'Illness Detail', icon: 'plus' },
        ]}
      />
      {selectedSegment === 'illness-record' ? (
        <ScrollView
          style={{
            padding: 10,
          }}
        >
          <IllnessCowRecordForm illness={illness as IllnessCow} />
        </ScrollView>
      ) : (
        <IllnessDetailRecord illness={illness as IllnessCow} refetch={refetch} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  segmentedButtons: {
    margin: 10,
  },
});

export default IllnessCowRecordScreen;
