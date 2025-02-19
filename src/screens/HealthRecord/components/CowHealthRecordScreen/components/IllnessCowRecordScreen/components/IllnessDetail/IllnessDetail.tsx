import CardComponent from '@components/Card/CardComponent';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import { IllnessCow, IllnessDetail } from '@model/Cow/Cow';
import { useNavigation } from '@react-navigation/native';
import { formatType } from '@utils/format';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Timeline from 'react-native-timeline-flatlist';

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
          <CardComponent.Title title={formatType(rowData.title)} />
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
        data={timelineData}
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
