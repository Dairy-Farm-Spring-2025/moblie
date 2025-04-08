import React from 'react';
import { Keyboard, StyleSheet, TextInput, TextInputProps } from 'react-native';

interface TextInputComponentProps extends TextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onBlur?: () => void;
  error: any;
  readOnly?: boolean;
}

const TextInputComponent = ({
  value,
  onChangeText,
  returnKeyType,
  error = '',
  onBlur,
  readOnly = false,
  ...props
}: TextInputComponentProps) => {
  return (
    <TextInput
      style={[
        styles.input,
        error !== '' ? styles.inputError : null,
        readOnly && styles.readOnlyBackground,
      ]}
      value={value}
      onChangeText={onChangeText}
      returnKeyType={returnKeyType}
      readOnly={readOnly}
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
  readOnly = false,
  ...props
}: TextInputComponentProps) => {
  return (
    <TextInput
      style={[
        styles.input,
        error !== '' ? styles.inputError : null,
        readOnly && styles.readOnlyBackground,
      ]}
      value={value}
      onChangeText={onChangeText}
      returnKeyType={returnKeyType}
      onBlur={onBlur}
      keyboardType="numeric"
      readOnly={readOnly}
      onSubmitEditing={Keyboard.dismiss}
      {...props}
    />
  );
};

TextInputComponent.Number = Number;

const styles = StyleSheet.create({
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  readOnlyBackground: {
    backgroundColor: '#e5e7eb',
  },
});

export default TextInputComponent;
