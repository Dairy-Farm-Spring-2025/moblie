import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FloatingButtonProps = {
  onPress: () => void;
  icon?: any;
};

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  icon = 'add',
}) => {
  return (
    <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
      <Ionicons name={icon ? icon : 'add'} size={32} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default FloatingButton;
