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
    <View style={[styles.screen, styles.pad20]}>
      <View style={[styles.section, styles.pad20, styles.mb16]}>
        <Text style={styles.title}>{user.fullName}</Text>
        <Text style={[styles.roleLabel, styles.mb12]}>
          {user.role === 'volunteer' ? 'Volunteer' : 'Requester'}
        </Text>
        <Text style={styles.metaCompact}>{user.email}</Text>
        <Text style={styles.metaCompact}>{user.phone}</Text>
        <Text style={styles.metaCompact}>{user.address}</Text>
      </View>

      <View style={[styles.section, styles.pad20, styles.mb16]}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bodyText}>{user.biography || 'No biography provided yet.'}</Text>
      </View>

      {user.role === 'volunteer' ? (
        <View style={[styles.section, styles.pad20, styles.mb16]}>
          <Text style={styles.sectionTitle}>Recognitions</Text>
          <Text style={styles.bodyText}>Completed jobs: {user.completedJobs}</Text>
          <Text style={styles.bodyText}>Rating: {user.rating.toFixed(1)}</Text>
          {!!user.skills?.length && <Text style={styles.bodyText}>Skills: {user.skills.join(', ')}</Text>}
        </View>
      ) : null}

      {user.role === 'requester' ? (
        <View style={[styles.section, styles.pad20, styles.mb16]}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <Text style={styles.bodyText}>
            {user.interests?.length ? user.interests.join(', ') : 'No specific interests recorded yet.'}
          </Text>
        </View>
      ) : null}

      <PrimaryButton title="Refresh profile" onPress={refreshProfile} disabled={isLoading} variant="secondary" />
      <PrimaryButton title="Log out" onPress={logout} variant="danger" />
    </View>
  );
};
