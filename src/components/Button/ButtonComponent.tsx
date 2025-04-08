import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  DimensionValue,
} from 'react-native';

interface ButtonComponentProps {
  children?: React.ReactNode;
  type?:
    | 'primary'
    | 'secondary'
    | 'warning'
    | 'thirdly'
    | 'amber'
    | 'cyan'
    | 'geekblue'
    | 'magenta'
    | 'volcano'
    | 'lime'
    | 'gold'
    | 'purple'
    | 'danger';
  onPress?: () => void;
  width?: 'auto' | number | string;
  fontSize?: number;
}

const buttonTypeColor = {
  primary: '#15803D', // Green
  secondary: '#0958d9', // Blue
  warning: '#FFA500', // Orange
  thirdly: '#8B5CF6', // Purple
  amber: '#FFC107', // Amber
  cyan: '#13C2C2', // Cyan
  geekblue: '#2F54EB', // Geek Blue
  magenta: '#EB2F96', // Magenta
  volcano: '#FA541C', // Volcano Red-Orange
  lime: '#A0D911', // Lime Green
  gold: '#FAAD14', // Gold
  purple: '#722ED1', // Deep Purple
  danger: '#DC2626', // Red
};

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  children,
  type = 'primary',
  onPress,
  width = 'auto',
  fontSize = 15,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonTypeColor[type],
          width: width as DimensionValue,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, { fontSize: fontSize }]}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ButtonComponent;
