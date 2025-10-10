import React from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { profileStyles as styles } from './styles';

export const ProfileScreen: React.FC = () => {
  const { user, refreshProfile, logout, isLoading } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>{user.fullName}</Text>
        <Text style={styles.role}>{user.role === 'volunteer' ? 'Volunteer' : 'Requester'}</Text>
        <Text style={styles.meta}>{user.email}</Text>
        <Text style={styles.meta}>{user.phone}</Text>
        <Text style={styles.meta}>{user.address}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.body}>{user.biography || 'No biography provided yet.'}</Text>
      </View>

      {user.role === 'volunteer' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recognitions</Text>
          <Text style={styles.body}>Completed jobs: {user.completedJobs}</Text>
          <Text style={styles.body}>Rating: {user.rating.toFixed(1)}</Text>
          {!!user.skills?.length && <Text style={styles.body}>Skills: {user.skills.join(', ')}</Text>}
        </View>
      ) : null}

      {user.role === 'requester' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <Text style={styles.body}>
            {user.interests?.length ? user.interests.join(', ') : 'No specific interests recorded yet.'}
          </Text>
        </View>
      ) : null}

      <PrimaryButton title="Refresh profile" onPress={refreshProfile} disabled={isLoading} variant="secondary" />
      <PrimaryButton title="Log out" onPress={logout} variant="danger" />
    </View>
  );
};
