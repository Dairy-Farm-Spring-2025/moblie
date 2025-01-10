import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation(); // Access the navigation object
  return (
    <View style={styles.container}>
      <Text>Welcome</Text>
      <Button
        title='Navigate'
        onPress={() => {
          (navigation.navigate as any)('Login');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WelcomeScreen;
