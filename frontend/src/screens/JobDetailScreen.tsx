import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api/client';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { JobDetail } from '../types';
import { colors } from '../theme/colors';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

export const JobDetailScreen: React.FC<Props> = ({ route }) => {
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail>();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Ready to support you!');
  const [volunteerId, setVolunteerId] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const response = await api.getJob(route.params.jobId);
        setJob(response);
      } catch (error) {
        Alert.alert('Failed to load job', error instanceof Error ? error.message : 'Please try again later');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [route.params.jobId]);

  const handleApply = async () => {
    if (!user) return;
    try {
      await api.applyToJob(route.params.jobId, {
        volunteerId: user.id,
        message,
      });
      Alert.alert('Application sent', 'The requester has been notified of your interest.');
    } catch (error) {
      Alert.alert('Could not apply', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleComplete = async () => {
    if (!volunteerId.trim()) {
      Alert.alert('Volunteer required', 'Enter the volunteer ID to record feedback.');
      return;
    }
    const ratingValue = Number(rating);
    if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
      Alert.alert('Invalid rating', 'Rating should be between 0 and 5.');
      return;
    }

    try {
      await api.completeJob(route.params.jobId, {
        volunteerId: volunteerId.trim(),
        rating: ratingValue,
        comment,
      });
      Alert.alert('Job closed', 'Feedback saved successfully.');
    } catch (error) {
      Alert.alert('Unable to close job', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const openMap = () => {
    if (!job) return;
    const { latitude, longitude } = job;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open maps');
    });
  };

  if (loading || !job) {
    return (
      <View style={styles.jobDetailLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isVolunteer = user?.role === 'volunteer';
  const isRequester = user?.role === 'requester';

  return (
    <ScrollView style={styles.jobDetailContainer} contentContainerStyle={styles.jobDetailContent}> 
      <Text style={styles.jobDetailTitle}>{job.title}</Text>
      <Text style={styles.jobDetailMeta}>{job.location}</Text>
      <Text style={styles.jobDetailMeta}>Scheduled on {job.scheduledOn}</Text>
      <View style={styles.jobDetailSection}>
        <Text style={styles.jobDetailSectionTitle}>Details</Text>
        <Text style={styles.jobDetailBodyText}>{job.description}</Text>
        <Text style={styles.jobDetailBodyText}>Meeting point: {job.meetingPoint}</Text>
        <Text style={[styles.jobDetailSectionTitle, { marginTop: 12 }]}>Requirements</Text>
        {job.requirements.map((item) => (
          <Text key={item} style={styles.jobDetailBullet}>• {item}</Text>
        ))}
      </View>
      <PrimaryButton title="Open in Maps" onPress={openMap} variant="secondary" />

      {isVolunteer ? (
        <View style={styles.jobDetailSection}>
          <Text style={styles.jobDetailSectionTitle}>Apply now</Text>
          <Text style={styles.jobDetailBodyText}>Let the requester know how you can help.</Text>
          <TextInput
            style={[styles.jobDetailTextArea, styles.jobDetailInput]}
            placeholder="Message for requester"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />
          <PrimaryButton title="Send application" onPress={handleApply} />
        </View>
      ) : null}

      {isRequester ? (
        <View style={styles.jobDetailSection}>
          <Text style={styles.jobDetailSectionTitle}>Complete job</Text>
          <Text style={styles.jobDetailBodyText}>
            Enter the volunteer ID and share a quick rating once the support has been provided.
          </Text>
          <FormField
            label="Volunteer ID"
            value={volunteerId}
            onChangeText={setVolunteerId}
            placeholder="volunteer-1"
          />
          <FormField
            label="Rating (0-5)"
            value={rating}
            onChangeText={setRating}
            keyboardType="decimal-pad"
          />
          <FormField
            label="Comment"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            style={styles.jobDetailTextArea}
          />
          <PrimaryButton title="Record feedback" onPress={handleComplete} variant="secondary" />
        </View>
      ) : null}
    </ScrollView>
  );
};
