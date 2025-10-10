import React from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { styles } from './styles';

export const ProfileScreen: React.FC = () => {
  const { user, refreshProfile, logout, isLoading } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeaderCard}>
        <Text style={styles.profileTitle}>{user.fullName}</Text>
        <Text style={styles.profileRole}>{user.role === 'volunteer' ? 'Volunteer' : 'Requester'}</Text>
        <Text style={styles.profileMeta}>{user.email}</Text>
        <Text style={styles.profileMeta}>{user.phone}</Text>
        <Text style={styles.profileMeta}>{user.address}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>About</Text>
        <Text style={styles.profileBody}>{user.biography || 'No biography provided yet.'}</Text>
      </View>

      {user.role === 'volunteer' ? (
        <View style={styles.profileSection}>
          <Text style={styles.profileSectionTitle}>Recognitions</Text>
          <Text style={styles.profileBody}>Completed jobs: {user.completedJobs}</Text>
          <Text style={styles.profileBody}>Rating: {user.rating.toFixed(1)}</Text>
          {!!user.skills?.length && <Text style={styles.profileBody}>Skills: {user.skills.join(', ')}</Text>}
        </View>
      ) : null}

      {user.role === 'requester' ? (
        <View style={styles.profileSection}>
          <Text style={styles.profileSectionTitle}>Interests</Text>
          <Text style={styles.profileBody}>
            {user.interests?.length ? user.interests.join(', ') : 'No specific interests recorded yet.'}
          </Text>
        </View>
      ) : null}

      <PrimaryButton title="Refresh profile" onPress={refreshProfile} disabled={isLoading} variant="secondary" />
      <PrimaryButton title="Log out" onPress={logout} variant="danger" />
    </View>
  );
};
