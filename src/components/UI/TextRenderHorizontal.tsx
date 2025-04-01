import React from 'react';
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import { Text } from 'react-native-paper';

interface TextRenderHorizontalProps {
  title: string;
  content: string;
  styleTextTitle?: StyleProp<TextStyle>;
  styleTextContent?: StyleProp<TextStyle>;
  styleContainer?: StyleProp<TextStyle>;
}

const TextRenderHorizontal = ({
  title,
  content,
  styleContainer,
  styleTextContent,
  styleTextTitle,
}: TextRenderHorizontalProps) => {
  return (
    <View style={[styles.content, styleContainer]}>
      <Text style={[styles.title, styleTextTitle]}>{title}:</Text>
      <Text style={[styles.contentText, styleTextContent]}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    gap: 5,
  },
  title: {
    color: 'gray',
    fontWeight: '300',
  },
  contentText: {
    color: '#000',
  },
});

export default TextRenderHorizontal;
