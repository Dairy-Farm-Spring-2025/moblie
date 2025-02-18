import CardComponent from '@components/Card/CardComponent';
import { HealthResponse } from '@model/Cow/Cow';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Text } from 'react-native-paper';
import Timeline from 'react-native-timeline-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { formatType } from '@utils/format';

type RootStackParamList = {
  CowHealthInforScreen: { healthResponses: HealthResponse[] };
};

type CowHealthInforScreenRouteProp = RouteProp<
  RootStackParamList,
  'CowHealthInforScreen'
>;

const CowHealthInforScreen = () => {
  const route = useRoute<CowHealthInforScreenRouteProp>();
  const { healthResponses } = route.params;
  const navigator = useNavigation();
  const timelineData = healthResponses.map((response) => ({
    time: response?.date,
    title: response.type === 'HEALTH_RECORD' ? 'Health Record' : 'Illness',
    data: response.health,
    icon: (
      <Ionicons
        name={
          response?.type === 'HEALTH_RECORD'
            ? 'heart'
            : response?.type === 'ILLNESS' &&
              response.health.severity === 'mild'
            ? 'happy'
            : response.health.severity === 'moderate'
            ? 'thumbs-up'
            : response.health.severity === 'severe'
            ? 'sad'
            : 'skull'
        }
        color={'#fff'}
        size={15}
      />
    ),
  }));
  const renderDetail = (rowData: any) => {
    const { data } = rowData;
    const CardIllness = () => {
      return (
        <TouchableOpacity
          onPress={() =>
            (navigator as any).navigate('IllnessCowRecordScreen', {
              illnessId: data.illnessId,
            })
          }
        >
          <CardComponent style={styles.card}>
            <CardComponent.Title
              title={rowData.title}
              subTitle={formatType(data?.severity)}
            />
            <CardComponent.Content>
              <Text style={styles.text}>✍️ {data?.userEntity.name}</Text>
            </CardComponent.Content>
          </CardComponent>
        </TouchableOpacity>
      );
    };

    const CardHealthRecord = () => {
      return (
        <TouchableOpacity
          onPress={() =>
            (navigator as any).navigate('HealthRecordFormScreen', {
              healthRecord: data,
            })
          }
        >
          <CardComponent style={styles.card}>
            <CardComponent.Title
              title={rowData.title}
              subTitle={formatType(data?.status)}
            />
            <CardComponent.Content>
              <Text style={styles.text}>📏 Weight: {data?.weight}(kg)</Text>
              <Text style={styles.text}>📏 Size: {data?.size}(m)</Text>
            </CardComponent.Content>
          </CardComponent>
        </TouchableOpacity>
      );
    };

    return rowData.title === 'Illness' ? <CardIllness /> : <CardHealthRecord />;
  };
  return (
    <View style={{ flex: 1 }}>
      <Timeline
        data={timelineData}
        renderDetail={renderDetail} // Use custom card renderer
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
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
  card: {
    borderTopStartRadius: 0,
    borderRadius: 15,
    shadowOpacity: 0.05,
  },
});

export default CowHealthInforScreen;
