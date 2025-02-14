import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider, DividerProps } from 'react-native-paper';

interface DividerUIProps extends DividerProps {}

const DividerUI = ({ ...props }: DividerUIProps) => {
  return <Divider {...props} style={styles.divider} />;
};

const styles = StyleSheet.create({
  divider: {
    marginVertical: 7,
  },
});

export default DividerUI;
