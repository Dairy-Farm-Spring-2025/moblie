import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const LoadingSplashScreen = () => {
  const navigation = useNavigation();
  const animation = useRef<LottieView>(null);
  useEffect(() => {
    // You can control the ref programmatically, rather than using autoPlay
    // animation.current?.play();
  }, []);

  return (
    <View style={styles.animationContainer}>
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: 260,
          height: 260,
        }}
        // Find more Lottie files at https://lottiefiles.com/featured
        source={require('@assets/Animation-1745251675521.json')}
      />
      <View style={styles.buttonContainer}>
        <Text>{t('cow_management.loading', { defaultValue: 'Loading...' })}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 50,
    marginTop: -40,
  },
});

export default LoadingSplashScreen;
