import { StyleSheet, Platform } from 'react-native';

const npLBlue = '#ADD8E6';

export default StyleSheet.create({
  droidSafeArea: {
    flex: 1,
    backgroundColor: npLBlue,
    paddingTop: Platform.OS === 'android' ? 5 : 0,
  } as const,
});

export const COLORS = {
  primary: '#166534', // Dark Green (default, can be for Veterinarians)
  secondary: '#E07A5F', // Coral (can be repurposed or kept as secondary)
  backgroundLayout: '#FFF', // White
  textWhite: '#fff', // Black
  textBlack: '#000',

  veterinarian: {
    primary: '#166534', // Dark Green for Veterinarians (reuse existing primary)
    inactive: '#757575', // Inactive tab icons: Gray (#757575).
    accent: '#2a802f', // Light Green for backgrounds or highlights
  },
  worker: {
    primary: '#0288D1', // Medium Blue for Workers
    inactive: '#757575', // Inactive tab icons: Gray (#757575).
    accent: '#5295cc', // Light Blue for backgrounds or highlights
  },
};
