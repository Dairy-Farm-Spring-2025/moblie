// import React from 'react';
// import { ScrollView, StyleSheet, View } from 'react-native';
// import { Avatar, Button, Text } from 'react-native-paper';
// import CardComponent, { LeftContent } from '@components/Card/CardComponent';
// import { useQuery } from 'react-query';
// import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
// import apiClient from '@config/axios/axios';
// import { IllnessDetail, UserProfileData } from '@model/Cow/Cow';
// import { Item } from '@model/Item/Item';
// import { formatCamelCase } from '@utils/format';
// import { getAvatar } from '@utils/getImage';
// import dayjs from 'dayjs';
// import { COLORS } from '@common/GlobalStyle';

// type RootStackParamList = {
//   IllnessDetails: {
//     illnessDetail: IllnessDetail;
//   };
//   IllnessDetailsForm: {
//     illnessDetail: IllnessDetail;
//     illnessId: number;
//     refetch: () => void;
//   };
// };

// type IllnessDetailsRouteProp = RouteProp<RootStackParamList, 'IllnessDetails'>;

// const fetchVeterinariansProfile = async (id: string): Promise<UserProfileData> => {
//   const response = await apiClient.get(`/users/${id}`);
//   return response.data;
// };

// const fetchItemDetail = async (id: string): Promise<Item> => {
//   const response = await apiClient.get(`/items/${id}`);
//   return response.data;
// };

// const IllnessDetails = () => {
//   const navigation = useNavigation();
//   const route = useRoute<IllnessDetailsRouteProp>();
//   const { illnessDetail } = route.params;

//   const { data: veterinarianProfile } = useQuery<UserProfileData>(
//     ['veterinarians', illnessDetail?.veterinarian?.id],
//     () => fetchVeterinariansProfile(illnessDetail.veterinarian?.id.toString()),
//     { enabled: !!illnessDetail?.veterinarian?.id }
//   );

//   const { data: itemDetail } = useQuery<Item>(
//     ['items', illnessDetail.vaccine.itemId],
//     () => fetchItemDetail(illnessDetail.vaccine.itemId.toString()),
//     { enabled: !!illnessDetail.vaccine.itemId }
//   );

//   const handleEdit = () => {
//     (navigation.navigate as any)('IllnessDetailForm', {
//       illnessDetail,
//       illnessId: illnessDetail.illnessDetailId, // Assuming illnessId is derived from illnessDetailId
//       refetch: () => {}, // Placeholder; implement actual refetch if needed
//     });
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <CardComponent>
//         <CardComponent.Title
//           title='Illness Detail'
//           subTitle='View illness details'
//           leftContent={(props: any) => <LeftContent {...props} icon='cards-heart' />}
//         />
//         <CardComponent.Content>
//           <View style={styles.infoContainer}>
//             {/* Date */}
//             <View style={styles.infoRow}>
//               <Text style={styles.label}>Date:</Text>
//               <Text style={styles.value}>{dayjs(illnessDetail.date).format('YYYY-MM-DD')}</Text>
//             </View>

//             {/* Status */}
//             <View style={styles.infoRow}>
//               <Text style={styles.label}>Status:</Text>
//               <Text style={styles.value}>{formatCamelCase(illnessDetail.status)}</Text>
//             </View>

//             {/* Injection Site */}
//             <View style={styles.infoRow}>
//               <Text style={styles.label}>Injection Site:</Text>
//               <Text style={styles.value}>{formatCamelCase(illnessDetail.injectionSite)}</Text>
//             </View>

//             {/* Dosage */}
//             <View style={styles.infoRow}>
//               <Text style={styles.label}>Dosage:</Text>
//               <Text style={styles.value}>{illnessDetail.dosage}</Text>
//             </View>

//             {/* Veterinarian */}
//             {veterinarianProfile && (
//               <CardComponent style={styles.card}>
//                 <CardComponent.Title
//                   title={veterinarianProfile.name}
//                   subTitle={veterinarianProfile.roleId.name}
//                   leftContent={() => (
//                     <Avatar.Image
//                       source={{ uri: getAvatar(veterinarianProfile.profilePhoto) }}
//                       size={45}
//                     />
//                   )}
//                 />
//               </CardComponent>
//             )}

//             {/* Item */}
//             {itemDetail && (
//               <CardComponent style={styles.card}>
//                 <CardComponent.Title
//                   title={itemDetail.name}
//                   subTitle={`Quantity: ${itemDetail.quantity} (${itemDetail.unit})`}
//                 />
//                 <CardComponent.Content>
//                   <View style={styles.cardItem}>
//                     <Text>Status: {itemDetail.status}</Text>
//                     <Text>Warehouse: {itemDetail.warehouseLocationEntity?.name}</Text>
//                   </View>
//                 </CardComponent.Content>
//               </CardComponent>
//             )}

//             {/* Description */}
//             <View style={styles.infoRow}>
//               <Text style={styles.label}>Description:</Text>
//               <Text style={styles.value}>{illnessDetail.description}</Text>
//             </View>

//             {/* Edit Button */}
//             <Button
//               mode='contained'
//               style={{ backgroundColor: COLORS.veterinarian.primary, marginTop: 20 }}
//               onPress={handleEdit}
//             >
//               Edit
//             </Button>
//           </View>
//         </CardComponent.Content>
//       </CardComponent>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//   },
//   infoContainer: {
//     flexDirection: 'column',
//     gap: 10,
//     marginVertical: 20,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 5,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     flex: 1,
//   },
//   value: {
//     fontSize: 16,
//     flex: 2,
//     textAlign: 'left',
//   },
//   card: {
//     marginBottom: 10,
//   },
//   cardItem: {
//     flexDirection: 'column',
//     gap: 10,
//   },
// });

// export default IllnessDetails;
