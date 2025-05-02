import React, { useState } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useForm } from 'react-hook-form';
import FormItem from '@components/Form/FormItem';
import CustomPicker from '@components/CustomPicker/CustomPicker';
import TextEditorComponent from '@components/Input/TextEditor/TextEditorComponent';
import { IllnessCow } from '@model/Cow/Cow';
import { IllnessPayload } from '@model/HealthRecord/HealthRecord';
import CardComponent, { LeftContent } from '@components/Card/CardComponent';
import { useMutation } from 'react-query';
import apiClient from '@config/axios/axios';
import { useNavigation } from '@react-navigation/native';
import { Button, Text } from 'react-native-paper';
import { convertToDDMMYYYY, formatCamelCase } from '@utils/format';
import RenderHtmlComponent from '@components/RenderHTML/RenderHtmlComponent';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@core/store/store';
import { COLORS } from '@common/GlobalStyle';
import { t } from 'i18next';
import { ScrollView } from 'react-native-gesture-handler';
import { getIllnessImage } from '@utils/getImage';

interface IllnessCowRecordFormProps {
  illness: IllnessCow;
}

const IllnessCowRecordForm = ({ illness }: IllnessCowRecordFormProps) => {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState(new Date(illness.startDate)?.toISOString());
  const [symptoms, setSymptoms] = useState(illness.symptoms);
  const [endDate, setEndDate] = useState();
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  console.log(illness);

  const { roleName } = useSelector((state: RootState) => state.auth);
  const getColorByrole = () => {
    switch (roleName) {
      case 'veterinarians':
        return COLORS.veterinarian.primary;
      case 'worker':
        return COLORS.worker.primary;
      default:
        return COLORS.worker.primary;
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IllnessPayload>({
    defaultValues: {
      prognosis: illness.prognosis,
      severity: illness.severity,
    },
  });

  const { mutate } = useMutation(
    async (data: IllnessPayload) =>
      await apiClient.put(`illness/prognosis/${illness.illnessId}`, data),
    {
      onSuccess: (response: any) => {
        Alert.alert(t('Success'), response.message);
        setIsEditing(false);
        (navigation.navigate as any)('CowDetails', {
          cowId: illness?.cowEntity?.cowId,
        });
      },
      onError: (error: any) => {
        Alert.alert(t('Error'), error.response.data.message);
      },
    }
  );

  const handleStartDateChange = (_: any, selectedDate: any) => {
    setStartDate(selectedDate?.toISOString());
  };

  const handleEndDateChange = (_: any, selectedDate: any) => {
    setEndDate(selectedDate?.toISOString());
  };

  const onSubmit = async (values: IllnessPayload) => {
    const payload: IllnessPayload = { ...values };
    mutate(payload);
  };

  // Handle image click to open modal
  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalVisible(true);
  };

  const formattedStartDate = convertToDDMMYYYY(new Date(startDate).toISOString().split('T')[0]);
  const formattedEndDate = endDate
    ? convertToDDMMYYYY(new Date(endDate).toISOString().split('T')[0])
    : 'N/A';

  return (
    <CardComponent style={styles.container}>
      <CardComponent.Title
        title={t('illness.Illness Record', { defaultValue: 'Illness Record' })}
        subTitle={
          isEditing
            ? t('illness.Edit_the_illness_details', {
                defaultValue: 'Edit the illness details',
              })
            : t('illness.View_illness_details', {
                defaultValue: 'View illness details',
              })
        }
        leftContent={(props: any) => <LeftContent {...props} icon='cards-heart' />}
      />
      <CardComponent.Content>
        {!isEditing ? (
          <View>
            <TouchableOpacity
              onPress={() =>
                (navigation.navigate as any)('CowDetails', { cowId: illness.cowEntity.cowId })
              }
              style={styles.cowContainer}
            >
              <Text style={styles.label}>{t('cow')}:</Text>
              <Text
                style={{
                  textDecorationStyle: 'solid',
                  textDecorationLine: 'underline',
                  marginTop: 10,
                }}
              >
                {illness.cowEntity.name}
              </Text>
            </TouchableOpacity>
            <Text style={styles.label}>{t('Severity', { defaultValue: 'Severity' })}:</Text>
            <Text style={styles.value}>{t(formatCamelCase(illness.severity)) || 'N/A'}</Text>

            <View style={styles.dateContainer}>
              <View>
                <Text style={styles.label}>{t('Start Date')}:</Text>
                <Text style={styles.value}>{formattedStartDate}</Text>
              </View>
              <View>
                <Ionicons name='arrow-forward' size={20} color='#000' />
              </View>
              <View>
                <Text style={styles.label}>{t('End Date')}:</Text>
                <Text style={styles.value}>{formattedEndDate}</Text>
              </View>
            </View>

            <Text style={styles.label}>{t('Prognosis')}:</Text>
            <View>
              <RenderHtmlComponent htmlContent={illness.prognosis || 'N/A'} />
            </View>

            <Text style={styles.label}>{t('Symptoms')}:</Text>
            <View>
              <RenderHtmlComponent htmlContent={illness.symptoms} />
            </View>

            <Text style={styles.label}>{t('Images', { defaultValue: 'Images' })}:</Text>
            <View style={styles.contentContainer}>
              {illness.mediaList.length > 0 ? (
                <ScrollView horizontal style={styles.imageContainer}>
                  {illness.mediaList.map((illnessImg, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleImagePress(getIllnessImage(illnessImg.url))}
                    >
                      <Image
                        source={{ uri: getIllnessImage(illnessImg.url) }}
                        style={styles.imagePreview}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noContentText}>{t('No images')}</Text>
              )}
            </View>

            {roleName.toLowerCase() !== 'worker' && (
              <Button
                mode='contained'
                style={[styles.editButton, { backgroundColor: `${getColorByrole()}` }]}
                onPress={() => setIsEditing(true)}
              >
                {t('illness.Edit_the_illness_details', {
                  defaultValue: 'Edit the illness details',
                })}
              </Button>
            )}
          </View>
        ) : (
          <>
            <FormItem
              control={control}
              label={t('Severity', { defaultValue: 'Severity' })}
              name='severity'
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomPicker
                  onValueChange={onChange}
                  selectedValue={value}
                  options={[
                    { label: t('Mild'), value: 'mild' },
                    { label: t('Moderate'), value: 'moderate' },
                    { label: t('Severe'), value: 'severe' },
                    { label: t('Critical'), value: 'critical' },
                  ]}
                />
              )}
            />

            <View style={styles.dateContainer}>
              <View style={{ width: '48%' }}>
                <Text style={styles.label}>{t('Start Date')}</Text>
                <Text style={styles.value}>{formattedStartDate}</Text>
              </View>

              <View style={{ width: '48%' }}>
                <Text style={styles.label}>{t('Start Date')}</Text>
                <Text style={styles.value}>{endDate ? formattedEndDate : 'N/A'}</Text>
              </View>
            </View>

            <FormItem
              control={control}
              label={t('Prognosis')}
              name='prognosis'
              rules={{ required: 'Must not be empty' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextEditorComponent
                  onChange={onChange}
                  value={value}
                  error={errors?.prognosis?.message}
                />
              )}
            />

            <FormItem
              control={control}
              label={t('Symptoms')}
              name='symptoms'
              render={({ field: { value } }) => <Text style={styles.textView}>{symptoms}</Text>}
            />

            <View style={styles.buttonContainer}>
              <Button mode='contained' style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
                {t('Save')}
              </Button>
              <Button
                mode='outlined'
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
              >
                {t('Cancel')}
              </Button>
            </View>
          </>
        )}

        {/* Modal for viewing full-size image */}
        <Modal
          visible={isImageModalVisible}
          transparent={true}
          animationType='fade'
          onRequestClose={() => setIsImageModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsImageModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  {selectedImage && (
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.fullImage}
                      resizeMode='contain'
                    />
                  )}
                  <Button
                    mode='contained'
                    style={styles.closeButton}
                    onPress={() => setIsImageModalVisible(false)}
                  >
                    {t('Close')}
                  </Button>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </CardComponent.Content>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 20,
  },
  cowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  noContentText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    marginBottom: 10,
    color: '#333',
  },
  editButton: {
    marginTop: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
  },
  textView: {
    marginTop: 10,
    padding: 10,
    color: '#333',
  },
  imageContainer: {
    flexDirection: 'row',
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    marginTop: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: 400, // Adjust as needed
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#6200ee',
  },
});

export default IllnessCowRecordForm;
