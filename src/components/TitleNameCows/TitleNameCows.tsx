import { COLORS } from '@common/GlobalStyle';
import { RootState } from '@core/store/store';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

const TitleNameCows = ({ title, cowName }: { cowName: string; title: string }) => {
  const { isAuthenticated, roleName } = useSelector((state: RootState) => state.auth);

  // Determine roleColors based on roleName, defaulting to worker if roleName is undefined
  const roleColors =
    roleName?.toLowerCase() === 'veterinarians' ? COLORS.veterinarian : COLORS.worker;

  return (
    <View style={[styles.header, { backgroundColor: roleColors.accent }]}>
      <Text style={[styles.headerTitle, { color: '#fff' }]}>
        {title} {cowName}
      </Text>
      {/* Uncomment and adjust if you want to show roleName instead of cowName */}
      {/* <Badge style={[styles.roleBadge, { backgroundColor: roleColors.primary }]}>
        {roleName || 'Unknown Role'}
      </Badge> */}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleBadge: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TitleNameCows;
