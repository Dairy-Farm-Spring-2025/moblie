import CardComponent from '@components/Card/CardComponent';
import FloatingButton from '@components/FloatingButton/FloatingButton';
import TextRenderHorizontal from '@components/UI/TextRenderHorizontal';
import apiClient from '@config/axios/axios';
import { RootState } from '@core/store/store';
import { IllnessCow, IllnessDetail } from '@model/Cow/Cow';
import { useNavigation } from '@react-navigation/native';
import { formatType } from '@utils/format';
import { t } from 'i18next';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { IconButton, Text } from 'react-native-paper';
import Timeline from 'react-native-timeline-flatlist';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';

interface IllnessDetailProps {
  illness: IllnessCow;
  refetch: any;
}

const IllnessDetailRecord = ({ illness, refetch }: IllnessDetailProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const { userId, roleName } = useSelector((state: RootState) => state.auth);

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
        Alert.alert(t('Success'), response.message);
        refetch();
      },
      onError: (error: any) => {
        Alert.alert(t('Error'), error.response.data.message);
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

  const handleShowName = (vet: any) => {
    if (!vet) return 'N/A';
    return vet?.id === userId ? vet?.name + ' (You)' : vet?.name;
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
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '600', fontSize: 16 }}>{t(formatType(rowData.title))}</Text>
            {roleName.toLowerCase() !== 'worker' ? (
              <IconButton
                icon={'delete-outline'}
                size={20}
                iconColor='red'
                onPress={() => deleteItemDetail(data.illnessDetailId)}
              />
            ) : (
              <IconButton
                icon={'information-outline'}
                size={20}
                iconColor='blue'
                onPress={() =>
                  (navigator as any).navigate('IllnessDetailForm', {
                    illnessDetail: data,
                    illnessId: illness.illnessId,
                    refetch: refetch,
                  })
                }
              />
            )}
          </View>
          <CardComponent.Content>
            <View
              style={{
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <TextRenderHorizontal
                title={t('illness_detail.veterinarians', {
                  defaultValue: 'Veterinarian',
                })}
                content={handleShowName(data?.veterinarian)}
              />
              <TextRenderHorizontal
                title={t('illness_detail.item', {
                  defaultValue: 'Item',
                })}
                content={data?.vaccine ? data?.vaccine?.name : 'N/A'}
              />
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
          (a: any, b: any) => new Date(b?.time)?.getTime() - new Date(a?.time)?.getTime()
        )}
        renderDetail={renderItem}
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
            refreshControl: (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refetch}
                colors={['#007AFF']}
                tintColor='#007AFF'
              />
            ),
          } as any
        }
      />
      {roleName.toLowerCase() !== 'worker' && (
        <FloatingButton
          onPress={() =>
            (navigator as any).navigate('IllnessDetailPlanForm', {
              illnessId: illness.illnessId,
              refetch: refetch,
            })
          }
        />
      )}
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
