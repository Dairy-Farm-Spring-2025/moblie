import { COLORS } from '@common/GlobalStyle';
import CardComponent from '@components/Card/CardComponent';
import { Notification } from '@model/Notification/Notification';
import { formatCamelCase } from '@utils/format';
import { t } from 'i18next';
import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from 'react-query';
import apiClient from '@config/axios/axios';
import { format, differenceInMinutes, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
interface CardNotificationProps {
  item: Notification;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'milking':
      return 'beaker';
    case 'feeding':
      return 'fast-food-outline';
    case 'heathcare':
      return 'medkit-outline';
    case 'task':
      return 'clipboard-outline';
    default:
      return 'notifications-outline';
  }
};

const CardNotification = ({ item }: CardNotificationProps) => {
  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    async ({ userId, notificationId }: { userId: number; notificationId: number }) =>
      await apiClient.put(`notifications/${notificationId}/mark-read/${userId}`),
    {
      onSuccess: () => {
        console.log('Success');
        queryClient.invalidateQueries('notifications/myNotification');
      },
      onError: (error: any) => {
        Alert.alert('Error', error.response.data.message);
      },
    }
  );
  const onClickRead = (userId: number, notificationId: number) => {
    if (!item.read) {
      mutate({ userId, notificationId });
    }
  };
  return (
    <TouchableOpacity
      onPress={() => onClickRead(item.id.userId, item.id.notificationId)}
      style={{ marginBottom: 15 }}
    >
      <CardComponent
        style={{
          padding: 15,
          backgroundColor: item?.read === true ? '#FFF' : 'rgba(45, 249, 133, 0.25)',
        }}
      >
        <View style={{ flexDirection: 'column', gap: 15 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.notification.title}</Text>
            <View
              style={{
                flexDirection: 'row',
                gap: 2,
                alignItems: 'center',
                marginTop: 5,
              }}
            >
              <Ionicons
                name={getCategoryIcon(item.notification.category)}
                size={13}
                color={COLORS.primary}
              />
              <Text style={{ fontSize: 13, fontWeight: '600' }}>
                {t(formatCamelCase(item.notification.category))}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: 2,
                alignItems: 'center',
                marginTop: 5,
              }}
            >
              <Ionicons name='time' size={13} color={COLORS.primary} />
              <Text style={{ fontSize: 13, fontWeight: '600' }}>
                {isToday(new Date(item.notification.dateTime))
                  ? (() => {
                      const minutesDiff = differenceInMinutes(
                        new Date(item.notification.dateTime),
                        new Date()
                      );
                      if (minutesDiff < -60) {
                        return `${Math.abs(Math.floor(minutesDiff / 60))}h ${t('notification.ago', {
                          defaultValue: 'ago',
                        })}`;
                      } else if (minutesDiff < 0) {
                        return `${Math.abs(minutesDiff)} ${t('notification.min_ago', {
                          defaultValue: 'min ago',
                        })}`;
                      } else {
                        return `${minutesDiff} ${t('now', { defaultValue: 'now' })}`;
                      }
                    })()
                  : format(new Date(item.notification.dateTime), 'EEE hh:mm a', { locale: vi })}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 15 }}>{item.notification.description}</Text>
        </View>
      </CardComponent>
    </TouchableOpacity>
  );
};

export default CardNotification;
