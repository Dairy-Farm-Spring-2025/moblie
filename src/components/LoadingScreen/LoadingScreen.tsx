import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

interface LoadingScreenProps {
  message?: string; // Optional loading message
  size?: 'small' | 'large'; // Spinner size
  color?: string; // Spinner color
  backgroundColor?: string; // Background color of the screen
  fullScreen?: boolean; // Whether to take up the full screen
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  size = 'large',
  color = '#007bff',
  backgroundColor = 'rgba(255, 255, 255, 0.8)',
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, { backgroundColor }]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject, // Takes up full screen
    flex: 1,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default LoadingScreen;
