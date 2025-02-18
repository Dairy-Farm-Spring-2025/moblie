import { IllnessCow } from '@model/Cow/Cow';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import IllnessCowRecordForm from './components/IllnessCowRecordForm.tsx/IllnessCowRecordForm';
type RootStackParamList = {
  IllnessCowRecordScreen: { illness: IllnessCow };
};

type IllnessCowRecordScreenRouteProp = RouteProp<
  RootStackParamList,
  'IllnessCowRecordScreen'
>;
const IllnessCowRecordScreen = () => {
  const [selectedSegment, setSelectedSegment] = useState('illness-record');
  const route = useRoute<IllnessCowRecordScreenRouteProp>();
  const { illness } = route.params;
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <SegmentedButtons
        style={styles.segmentedButtons}
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          { value: 'illness-record', label: 'Illness Record', icon: 'cow' },
          { value: 'illness-detail', label: 'Illness Detail', icon: 'plus' },
        ]}
      />
      {selectedSegment === 'illness-record' ? (
        <ScrollView
          style={{
            padding: 10,
          }}
        >
          <IllnessCowRecordForm illness={illness} />
        </ScrollView>
      ) : (
        <View>
          <Text>tex11111t</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  segmentedButtons: {
    margin: 10,
  },
});

export default IllnessCowRecordScreen;
