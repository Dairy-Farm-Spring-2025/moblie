import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface TagUIProps {
  children?: string | any;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
}

const TagUI = ({
  children,
  backgroundColor = 'green',
  color = 'white',
  fontSize = 12,
}: TagUIProps) => {
  return (
    <Text
      style={[
        styles.type,
        { backgroundColor: backgroundColor, color: color, fontSize: fontSize },
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  type: {
    padding: 4,
    borderRadius: 5,
  },
});

export default TagUI;
