import React from 'react';
import { View, Text, StyleSheet, TextInput, Keyboard } from 'react-native';
import { Controller, ControllerProps } from 'react-hook-form';
import { Tooltip } from 'react-native-paper';

interface FormItemProps extends ControllerProps {
  name: string;
  control: any;
  label: string;
  rules?: object;
  error?: any;
  render: ({
    field: { onChange, onBlur, value },
  }: {
    field: {
      onChange: (value: any) => void;
      onBlur: () => void;
      value: any;
    };
  }) => React.ReactNode | any; // Custom render prop
}

const FormItem = ({ name, control, label, rules, error, render, ...props }: FormItemProps) => {
  return (
    <View style={styles.container}>
      {/* Label */}
      <Tooltip title={`${label}`}>
        <Text style={styles.label} numberOfLines={1} ellipsizeMode='tail'>
          <Text style={styles.required}>*</Text> {label}
        </Text>
      </Tooltip>

      {/* Input Field */}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={(props) => render(props) as any}
      />

      {/* Validation Error */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 5,
  },
  required: {
    color: 'red',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  error: {
    color: 'red',
    fontSize: 14,
  },
});

export default FormItem;
