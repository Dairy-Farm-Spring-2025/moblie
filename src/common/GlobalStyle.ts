import { StyleSheet, Platform } from 'react-native';

const npLBlue = '#ADD8E6';

export default StyleSheet.create({
  droidSafeArea: {
    flex: 1,
    backgroundColor: npLBlue,
    paddingTop: Platform.OS === 'android' ? 5 : 0,
  } as const,
});
