import React from 'react';
import { View, Text, StyleSheet, TextInput, Keyboard } from 'react-native';
import { Controller, ControllerProps } from 'react-hook-form';

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

const FormItem = ({
  name,
  control,
  label,
  rules,
  error,
  render,
  ...props
}: FormItemProps) => {
  console.log(error);
  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>
        <Text style={styles.required}>*</Text> {label}
      </Text>

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
    fontSize: 16,
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
