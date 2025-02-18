import React from 'react';
import { Keyboard, StyleSheet, TextInput, TextInputProps } from 'react-native';

interface TextInputComponentProps extends TextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onBlur?: () => void;
  error: any;
}

const TextInputComponent = ({
  value,
  onChangeText,
  returnKeyType,
  error = '',
  onBlur,
  ...props
}: TextInputComponentProps) => {
  return (
    <TextInput
      style={[styles.input, error !== '' ? styles.inputError : null]}
      value={value}
      onChangeText={onChangeText}
      returnKeyType={returnKeyType}
      onBlur={onBlur}
      {...props}
    />
  );
};

const Number = ({
  value,
  onChangeText,
  returnKeyType,
  error = '',
  onBlur,
  ...props
}: TextInputComponentProps) => {
  return (
    <TextInput
      style={[styles.input, error !== '' ? styles.inputError : null]}
      value={value}
      onChangeText={onChangeText}
      returnKeyType={returnKeyType}
      onBlur={onBlur}
      keyboardType="numeric"
      onSubmitEditing={Keyboard.dismiss}
      {...props}
    />
  );
};

TextInputComponent.Number = Number;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  inputError: {
    borderColor: 'red',
  },
});

export default TextInputComponent;
