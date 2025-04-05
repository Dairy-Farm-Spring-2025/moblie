// import CardComponent, { LeftContent } from '@components/Card/CardComponent';
// import CustomPicker from '@components/CustomPicker/CustomPicker';
// import FormItem from '@components/Form/FormItem';
// import TextEditorComponent from '@components/Input/TextEditor/TextEditorComponent';
// import TextInputComponent from '@components/Input/TextInput/TextInputComponent';
// import apiClient from '@config/axios/axios';
// import { IllnessDetail, UserProfileData } from '@model/Cow/Cow';
// import { IllnessDetailPayload } from '@model/HealthRecord/HealthRecord';
// import dayjs from 'dayjs'; // Import dayjs
// import { Item } from '@model/Item/Item';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { RouteProp, useRoute } from '@react-navigation/native';
// import { OPTION_INJECTION_SITES, OPTIONS_ILLNESS_DETAIL_STATUS } from '@services/data/healthStatus';
// import { formatCamelCase } from '@utils/format';
// import { getAvatar } from '@utils/getImage';
// import React, { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { Alert, ScrollView, StyleSheet, View } from 'react-native';
// import { Avatar, Button, Text } from 'react-native-paper';
// import { useMutation, useQuery } from 'react-query';
// import { useSelector } from 'react-redux';
// import { RootState } from '@core/store/store';
// import { COLORS } from '@common/GlobalStyle';

// type RootStackParamList = {
//   IllnessDetailForm: {
//     illnessDetail: IllnessDetail;
//     illnessId: number;
//     refetch: any;
//   };
// };

// type IllnessDetailFormRouteProp = RouteProp<RootStackParamList, 'IllnessDetailForm'>;

// const fetchVeterinariansProfile = async (id: string): Promise<UserProfileData> => {
//   const response = await apiClient.get(`/users/${id}`);
//   return response.data;
// };

// const fetchItem = async (): Promise<Item> => {
//   const response = await apiClient.get(`/items`);
//   return response.data;
// };

// const fetchItemDetail = async (id: string): Promise<Item> => {
//   const response = await apiClient.get(`/items/${id}`);
//   return response.data;
// };

// const IllnessDetailForm = () => {
//   const route = useRoute<IllnessDetailFormRouteProp>();
//   const { illnessDetail, illnessId, refetch } = route.params;
//   const [idItem, setIdItem] = useState(illnessDetail.vaccine.itemId);
//   const [date, setDate] = useState(new Date(illnessDetail.date).toISOString());
//   const [optionsItemVaccine, setOptionsItemVaccine] = useState<any[]>([]);

//   const { roleName } = useSelector((state: RootState) => state.auth);
//   const getColorByrole = () => {
//     switch (roleName) {
//       case 'veterinarians':
//         return COLORS.veterinarian.primary;
//       case 'workers':
//         return COLORS.worker.primary;
//       default:
//         return COLORS.worker.primary;
//     }
//   };

//   const { data: veterinarianProfile } = useQuery<UserProfileData>(
//     ['veterinarians', illnessDetail?.veterinarian?.id],
//     () => fetchVeterinariansProfile(illnessDetail.veterinarian?.id.toString())
//   );
//   const { data: itemDetail } = useQuery<Item>(['items', idItem], () => fetchItemDetail(idItem));
//   const { data: items } = useQuery<Item[]>('items', fetchItem as any);
//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<IllnessDetailPayload>({
//     defaultValues: {
//       description: illnessDetail?.description,
//       itemId: idItem,
//       status: illnessDetail?.status,
//       veterinarianId: illnessDetail?.veterinarian?.id,
//       dosage: illnessDetail?.dosage?.toString(), // Convert number to string here
//       injectionSite: illnessDetail?.injectionSite,
//     },
//   });

//   useEffect(() => {
//     if (items) {
//       setOptionsItemVaccine(
//         items
//           .filter(
//             (element: Item) =>
//               element?.categoryEntity?.name === 'Vắc-xin' ||
//               element?.categoryEntity?.name === 'Thuốc'
//           )
//           .map((element) => ({
//             value: element.itemId,
//             label: element.name,
//           }))
//       );
//     }
//   }, []);

//   const handleStartDateChange = (_: any, selectedDate: any) => {
//     setDate(selectedDate?.toISOString());
//   };

//   const { mutate } = useMutation(
//     async (data: IllnessDetailPayload) =>
//       await apiClient.put(`illness-detail/${illnessDetail.illnessDetailId}`, data),
//     {
//       onSuccess: (response: any) => {
//         Alert.alert('Success', response.message);
//         refetch();
//       },
//       onError: (error: any) => {
//         Alert.alert('Error', error.response.data.message);
//       },
//     }
//   );

//   const onSubmit = async (values: IllnessDetailPayload) => {
//     const payload: IllnessDetailPayload = {
//       ...values,
//       date: dayjs(date).format('YYYY-MM-DD'),
//     };
//     console.log(payload);
//     mutate(payload);
//   };
//   return (
//     <ScrollView
//       style={{
//         flex: 1,
//         padding: 10,
//       }}
//     >
//       <CardComponent>
//         <CardComponent.Title
//           title={'Illness Detail'}
//           subTitle='You can edit information'
//           leftContent={(props: any) => <LeftContent {...props} icon='cards-heart' />}
//         />
//         <CardComponent.Content>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'flex-start',
//               marginVertical: 20,
//               flexWrap: 'wrap',
//               gap: 5,
//             }}
//           >
//             <View style={{ width: '48%' }}>
//               <FormItem
//                 control={control}
//                 label='Date'
//                 name='date'
//                 render={({ field: {} }) => (
//                   <DateTimePicker
//                     value={new Date(date)}
//                     mode='date'
//                     is24Hour={true}
//                     display='default'
//                     onChange={handleStartDateChange}
//                   />
//                 )}
//               />
//             </View>
//             <View style={{ width: '48%' }}>
//               <FormItem
//                 control={control}
//                 label='Status'
//                 name='status'
//                 render={({ field: { onChange, value } }) => (
//                   <CustomPicker
//                     onValueChange={onChange}
//                     selectedValue={value}
//                     options={OPTIONS_ILLNESS_DETAIL_STATUS}
//                     title={formatCamelCase(value)}
//                   />
//                 )}
//               />
//             </View>
//             <View style={{ width: '48%' }}>
//               <FormItem
//                 control={control}
//                 label='Injection site'
//                 name='injectionSite'
//                 render={({ field: { onChange, value } }) => (
//                   <CustomPicker
//                     onValueChange={onChange}
//                     selectedValue={value}
//                     options={OPTION_INJECTION_SITES()}
//                     title={formatCamelCase(value)}
//                   />
//                 )}
//               />
//             </View>
//             <View style={{ width: '48%' }}>
//               <FormItem
//                 control={control}
//                 label='Dosage'
//                 name='dosage'
//                 render={({ field: { onChange, onBlur, value } }) => (
//                   <TextInputComponent.Number
//                     error={errors.dosage ? errors.dosage.message : ''}
//                     onBlur={onBlur}
//                     onChangeText={(text) => {
//                       const numericValue = text.replace(/[^0-9]/g, '');
//                       onChange(numericValue);
//                     }}
//                     value={value as any}
//                     returnKeyType='done'
//                   />
//                 )}
//               />
//             </View>
//           </View>
//           <View
//             style={{
//               flexDirection: 'column',
//               gap: 10,
//             }}
//           >
//             {veterinarianProfile && (
//               <CardComponent style={styles.card}>
//                 <CardComponent.Title
//                   title={veterinarianProfile.name}
//                   subTitle={veterinarianProfile.roleId.name}
//                   leftContent={() => (
//                     <Avatar.Image
//                       source={{
//                         uri: getAvatar(veterinarianProfile.profilePhoto),
//                       }}
//                       size={45}
//                     />
//                   )}
//                 />
//               </CardComponent>
//             )}
//             <FormItem
//               control={control}
//               label='Item'
//               name='itemId'
//               rules={{ required: 'Must not be empty' }}
//               render={({ field: { onChange, value } }) => (
//                 <CustomPicker
//                   onValueChange={(value) => {
//                     onChange(value);
//                     setIdItem(value);
//                   }}
//                   selectedValue={value}
//                   options={optionsItemVaccine}
//                   title={itemDetail !== undefined ? itemDetail?.name : 'N/A'}
//                 />
//               )}
//             />
//             {itemDetail && (
//               <CardComponent style={styles.card}>
//                 <CardComponent.Title
//                   title={itemDetail?.name}
//                   subTitle={`Quantity: ${itemDetail?.quantity} (${itemDetail?.unit})`}
//                 />
//                 <CardComponent.Content>
//                   <View style={styles.cardItem}>
//                     <Text>Status: {itemDetail?.status}</Text>
//                     <Text>Warehouse: {itemDetail?.warehouseLocationEntity?.name}</Text>
//                   </View>
//                 </CardComponent.Content>
//               </CardComponent>
//             )}
//             <FormItem
//               control={control}
//               label='Description'
//               name='description'
//               render={({ field: { onChange, onBlur, value } }) => (
//                 <TextEditorComponent
//                   onChange={onChange}
//                   value={value}
//                   error={errors?.description?.message}
//                 />
//               )}
//             />
//             <Button
//               style={{ backgroundColor: getColorByrole() }}
//               mode='contained'
//               onPress={handleSubmit(onSubmit)}
//             >
//               Submit
//             </Button>
//           </View>
//         </CardComponent.Content>
//       </CardComponent>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   cardItem: {
//     flexDirection: 'column',
//     gap: 10,
//   },
//   card: {
//     marginBottom: 10,
//   },
// });

// export default IllnessDetailForm;
