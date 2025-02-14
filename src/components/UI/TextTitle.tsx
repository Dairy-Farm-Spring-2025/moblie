import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface TextTitleProps {
  title: string;
  content: string;
}

const TextTitle = ({ title, content }: TextTitleProps) => {
  return (
    <View style={styles.content}>
      <Text style={styles.title}>{title}:</Text>
      <Text>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
    gap: 3,
  },
  title: {
    fontWeight: 'bold',
  },
});

export default TextTitle;
