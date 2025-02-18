import CardComponent from '@components/Card/CardComponent';
import { HealthResponse } from '@model/Cow/Cow';
import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
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
        <CardComponent>
          <CardComponent.Title
            title={rowData.title}
            subTitle={formatType(data?.severity)}
          />
          <CardComponent.Content>
            <Text style={styles.text}>
              ✍️ {''} {data?.userEntity.name}
            </Text>
          </CardComponent.Content>
        </CardComponent>
      );
    };

    const CardHealthRecord = () => {
      return (
        <CardComponent>
          <CardComponent.Title
            title={rowData.title}
            subTitle={formatType(data?.status)}
          />
          <CardComponent.Content>
            <Text style={styles.text}>📏 Weight: {data?.weight}(kg)</Text>
            <Text style={styles.text}>📏 Size: {data?.size}(m)</Text>
          </CardComponent.Content>
        </CardComponent>
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
        circleColor="green"
        lineColor="green"
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
});

export default CowHealthInforScreen;
