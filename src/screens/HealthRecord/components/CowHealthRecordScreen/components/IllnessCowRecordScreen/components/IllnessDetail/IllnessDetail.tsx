import CardComponent from '@components/Card/CardComponent';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import apiClient from '@config/axios/axios';
import { IllnessCow, IllnessDetail } from '@model/Cow/Cow';
import { useNavigation } from '@react-navigation/native';
import { formatType } from '@utils/format';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import Timeline from 'react-native-timeline-flatlist';
import { useMutation } from 'react-query';

interface IllnessDetailProps {
  illness: IllnessCow;
  refetch: any;
}

const IllnessDetailRecord = ({ illness, refetch }: IllnessDetailProps) => {
  const navigator = useNavigation();
  const timelineData = illness.illnessDetails.map((element: IllnessDetail) => ({
    time: element?.date,
    title: element.status,
    data: element,
  }));

  const { mutate } = useMutation(
    async (id: number) => await apiClient.delete(`illness-detail/${id}`),
    {
      onSuccess: (response: any) => {
        Alert.alert('Success', response.message);
        refetch();
      },
      onError: (error: any) => {
        Alert.alert('Error', error.response.data.message);
      },
    }
  );

  const deleteItemDetail = async (id: number) => {
    Alert.alert('Are you sure to delete this item detail', '', [
      {
        text: 'Yes',
        onPress: () => mutate(id),
      },
      {
        text: 'No',
      },
    ]);
  };

  const renderItem = (rowData: any) => {
    const { data } = rowData;
    return (
      <TouchableOpacity
        onPress={() =>
          (navigator as any).navigate('IllnessDetailForm', {
            illnessDetail: data,
            illnessId: illness.illnessId,
            refetch: refetch,
          })
        }
      >
        <CardComponent style={styles.card}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <CardComponent.Title title={formatType(rowData.title)} />
            <IconButton
              icon={'delete-outline'}
              size={20}
              iconColor="red"
              onPress={() => deleteItemDetail(data.illnessDetailId)}
            />
          </View>
          <CardComponent.Content>
            <View
              style={{
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <Text>🧑‍⚕️ Veterinarian: {data.veterinarian.name}</Text>
              <Text>💉 Vaccine: {data.vaccine.name}</Text>
            </View>
          </CardComponent.Content>
        </CardComponent>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <Timeline
        data={timelineData.sort(
          (a: any, b: any) =>
            new Date(b?.time)?.getTime() - new Date(a?.time)?.getTime()
        )}
        renderDetail={renderItem}
        innerCircle="icon"
        circleSize={25}
        timeContainerStyle={{ minWidth: 72, marginTop: 5 }}
        timeStyle={{
          color: 'grey',
          fontStyle: 'italic',
        }}
        circleColor="green"
        lineColor="#C0C0C0"
        lineWidth={1}
        options={
          {
            style: {
              padding: 20,
            },
          } as any
        }
      />
      <FloatingButton
        onPress={() =>
          (navigator as any).navigate('IllnessDetailPlanForm', {
            illnessId: illness.illnessId,
            refetch: refetch,
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderTopStartRadius: 0,
    borderRadius: 15,
    shadowOpacity: 0.05,
  },
});

export default IllnessDetailRecord;
