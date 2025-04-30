import FloatingButton from '@components/FloatingButton/FloatingButton';
import EmptyUI from '@components/UI/EmptyUI';
import apiClient from '@config/axios/axios';
import { useListCowMilkStore } from '@core/store/ListCowDailyMilk/useListCowMilkStore';
import { Picker } from '@react-native-picker/picker';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useMutation } from 'react-query';
import CardDetailCow from './components/CardDetailCow/CardDetailCow';

const CreateMilkBatch = () => {
  const [shift, setShift] = useState('shiftOne');
  const { listCowMilk, setListCowMilk, removeCowMilk, clearListCowMilk } = useListCowMilkStore();

  const navigation = useNavigation();

  const mutation = useMutation(
    async (data: any) => await apiClient.post('/MilkBatch/create', data),
    {
      onSuccess: () => {
        Alert.alert('Success', t('Milk batch created successfully'));
        clearListCowMilk();
        navigation.dispatch(
          CommonActions.reset({
            index: 1, // Chỉ số 1, tức là màn hình thứ 2 (MilkBatchManagementScreen) được active
            routes: [
              { name: 'Home', params: { defaultIndex: 0 } }, // index 0
              {
                name: 'MilkBatchManagementScreen',
                params: { defaultIndex: 1 },
              }, // index 1 (current screen)
            ],
          })
        );
      },
      onError: (err: any) => {
        Alert.alert(
          'Error',
          err?.response?.data?.message ||
            t('Failed to create milk batch', { defaultValue: 'Failed to create milk batch' })
        );
      },
    }
  );

  const handleSubmit = () => {
    if (!shift || listCowMilk === null) {
      Alert.alert(
        'Error',
        t('Please fill in all fields.', { defaultValue: 'Please fill in all fields.' })
      );
      return;
    }

    const dailyMilkList = listCowMilk.map((c) => c.dailyMilk);

    const data = {
      dailyMilks: dailyMilkList,
      shift,
    };
    mutation.mutate(data);
  };

  const handleDelete = (cowId: number) => {
    Alert.alert(t('Confirm Delete'), t('Are you sure you want to remove this cow from the list?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete'),
        onPress: () => removeCowMilk(cowId),
        style: 'destructive',
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            {/* Cow Information Card */}
            <View style={styles.detailCow}>
              {listCowMilk.length > 0 ? (
                listCowMilk.map((c, index) => (
                  <CardDetailCow
                    key={index}
                    dailyMilk={{
                      volume: c.dailyMilk?.volume || 0,
                      cowId: c.cow?.cowId || 0,
                    }}
                    cow={c.cow}
                    width={200}
                    onPress={() =>
                      (navigation.navigate as any)('DetailFormMilk', {
                        cowId: c.cow?.cowId,
                        volume: c.dailyMilk?.volume || 0,
                        screens: 'CreateMilkBatch',
                      })
                    }
                    onDelete={() => handleDelete(c.cow?.cowId || 0)} // Pass delete handler
                  />
                ))
              ) : (
                <EmptyUI />
              )}
            </View>

            {/* Milk Batch Form */}
            <View style={styles.formContainer}>
              <Text style={styles.cardTitle}>{t('Shift')}:</Text>
              <Picker numberOfLines={2} selectedValue={shift} onValueChange={setShift}>
                <Picker.Item
                  label={t('Shift 1', { defaultValue: 'Shift 1 (8h-13h)' })}
                  value='shiftOne'
                />
                <Picker.Item
                  label={t('Shift 2', { defaultValue: 'Shift 2 (13h-17h)' })}
                  value='shiftTwo'
                />
              </Picker>
            </View>

            <FloatingButton
              onPress={() =>
                (navigation.navigate as any)('QrCodeScanCow', {
                  screens: 'DetailFormMilk',
                })
              }
            />

            {/* Submit Button at Bottom */}
            <View style={styles.buttonContainer}>
              <Button
                mode='contained'
                onPress={handleSubmit}
                loading={mutation.isLoading}
                disabled={mutation.isLoading || listCowMilk?.length === 0}
              >
                {t('Submit')}
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  detailCow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  formContainer: {
    flexGrow: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
});

export default CreateMilkBatch;
