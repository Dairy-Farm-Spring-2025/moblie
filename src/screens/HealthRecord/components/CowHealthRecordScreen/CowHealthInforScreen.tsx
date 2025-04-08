import CardComponent from '@components/Card/CardComponent';
import TitleNameCows from '@components/TitleNameCows/TitleNameCows';
import TextRenderHorizontal from '@components/UI/TextRenderHorizontal';
import { Ionicons } from '@expo/vector-icons';
import { HealthResponse, IllnessCow } from '@model/Cow/Cow';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { convertToDDMMYYYY, formatType } from '@utils/format';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Timeline from 'react-native-timeline-flatlist';

type RootStackParamList = {
  CowHealthInforScreen: { healthResponses: HealthResponse[]; cowName: string };
};

type CowHealthInforScreenRouteProp = RouteProp<RootStackParamList, 'CowHealthInforScreen'>;

const CowHealthInforScreen = () => {
  const route = useRoute<CowHealthInforScreenRouteProp>();
  const { healthResponses, cowName } = route.params;
  const navigator = useNavigation();
  const timelineData = [...healthResponses] // Clone the array
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort in descending order
    .map((response) => {
      let iconName: string = 'accessibility';
      if (response.type === 'HEALTH_RECORD') {
        iconName = 'heart';
      } else if (response.type === 'ILLNESS') {
        const severity = (response.health as IllnessCow).severity;
        iconName =
          severity === 'mild'
            ? 'happy'
            : severity === 'moderate'
            ? 'thumbs-up'
            : severity === 'severe'
            ? 'sad'
            : severity === 'critical'
            ? 'skull'
            : 'accessibility';
      }
      return {
        time: convertToDDMMYYYY(response.date),
        title:
          response.type === 'HEALTH_RECORD'
            ? 'Health Record'
            : response.type === 'ILLNESS'
            ? 'Illness'
            : 'Injections',
        data: response.health,
        icon: <Ionicons name={iconName as any} color={'#fff'} size={15} />,
      };
    });

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
              subTitle={data?.severity ? formatType(data?.severity) : 'N/A'}
            />
            <CardComponent.Content>
              <TextRenderHorizontal title='User' content={data?.userEntity?.name ?? 'Unknown'} />
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
            <CardComponent.Title title={rowData.title} subTitle={formatType(data?.status)} />
            <CardComponent.Content>
              <TextRenderHorizontal title='Size' content={`${data?.size}(m)`} />
            </CardComponent.Content>
          </CardComponent>
        </TouchableOpacity>
      );
    };

    const CardInjections = () => {
      return (
        <TouchableOpacity
          onPress={() =>
            (navigator as any).navigate('InjectionScreen', {
              vaccineInjectionId: data.id,
            })
          }
        >
          <CardComponent style={styles.card}>
            <CardComponent.Title
              title={rowData.title}
              subTitle={data?.status ? formatType(data?.status) : 'N/A'}
            />
            <CardComponent.Content>
              <TextRenderHorizontal
                title='Administered By'
                content={typeof data?.administeredBy === 'string' ? data?.administeredBy : 'N/A'}
              />
              <TextRenderHorizontal
                styleTextContent={{ flexWrap: 'wrap', flexShrink: 1 }}
                title='Description'
                content={data?.description ? data?.description : 'N/A'}
              />
            </CardComponent.Content>
          </CardComponent>
        </TouchableOpacity>
      );
    };

    return rowData.title === 'Illness' ? (
      <CardIllness />
    ) : rowData.title === 'Health Record' ? (
      <CardHealthRecord />
    ) : (
      <CardInjections />
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <TitleNameCows title='Timeline Health Record - ' cowName={cowName} />
      {timelineData.length > 0 ? (
        <Timeline
          data={timelineData}
          renderDetail={renderDetail} // Use custom card renderer
          innerCircle='icon'
          circleSize={25}
          timeContainerStyle={{ minWidth: 72, marginTop: 5 }}
          timeStyle={{
            color: 'grey',
            fontStyle: 'italic',
          }}
          circleColor='green'
          lineColor='#C0C0C0'
          lineWidth={1}
          options={
            {
              style: {
                padding: 20,
              },
            } as any
          }
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>No health records</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
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
