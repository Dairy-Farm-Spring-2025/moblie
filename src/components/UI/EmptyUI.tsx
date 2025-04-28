import React from 'react';
import { View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text } from 'react-native-paper';
import { t } from 'i18next';

const EmptyUI = () => {
  return (
    <View
      style={{
        padding: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        width: '100%',
      }}
    >
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <MaterialCommunityIcons name="application-variable-outline" size={50} />
        <Text
          style={{
            fontSize: 17,
          }}
        >
          {t('Empty')}
        </Text>
      </View>
    </View>
  );
};

export default EmptyUI;
