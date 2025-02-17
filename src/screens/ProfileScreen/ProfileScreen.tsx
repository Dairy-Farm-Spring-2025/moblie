import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@core/store/store';
import { Avatar, Text, Button, Divider, List, Badge } from 'react-native-paper';
import Layout from '@components/layout/Layout';
import { useDispatch } from 'react-redux';
import { logout } from '@core/store/authSlice';

const ProfileScreen: React.FC = () => {
  const { isAuthenticated, roleName, userId, fullName } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch: AppDispatch = useDispatch();

  return (
    <Layout>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Avatar.Image
            size={100}
            source={{ uri: 'https://via.placeholder.com/150' }} // Replace with actual image
          />
          <Text variant="headlineMedium" style={styles.fullName}>
            {fullName}
          </Text>
          <Text variant="bodyMedium" style={styles.role}>
            {roleName || 'No Role'}
          </Text>
          <Badge
            style={[
              styles.statusBadge,
              { backgroundColor: isAuthenticated ? 'green' : 'red' },
            ]}
          >
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Badge>
        </View>

        <Divider style={styles.divider} />

        {/* User Info */}
        <List.Section>
          <List.Item
            title="User ID"
            description={userId || 'N/A'}
            left={() => <List.Icon icon="identifier" />}
          />
          <List.Item
            title="Role"
            description={roleName || 'N/A'}
            left={() => <List.Icon icon="account" />}
          />
        </List.Section>

        <Divider style={styles.divider} />

        {/* Actions */}
        <View style={styles.actions}>
          <Button mode="contained" style={styles.button}>
            Edit Profile
          </Button>
          <Button mode="contained-tonal" style={styles.button}>
            Change Password
          </Button>
          <Button
            onPress={() => dispatch(logout())}
            mode="outlined"
            textColor="red"
            style={styles.button}
          >
            Logout
          </Button>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fullName: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  role: {
    color: '#666',
  },
  statusBadge: {
    marginTop: 5,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  divider: {
    marginVertical: 15,
  },
  actions: {
    marginTop: 20,
  },
  button: {
    marginBottom: 10,
  },
});

export default ProfileScreen;
