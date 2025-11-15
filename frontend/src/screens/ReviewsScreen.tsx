import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { StarRating } from '../components/StarRating';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { getDynamicTopPadding, styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Reviews'>;

export const ReviewsScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { volunteerId } = route.params;
  const [reviews, setReviews] = useState<Array<{ jobTitle: string; rating: number; review: string; requesterName: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [volunteerId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const reviewsData = await api.getVolunteerReviews(volunteerId);
      setReviews(reviewsData);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerContent, getDynamicTopPadding(insets.top)]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, styles.padHorizontal16, getDynamicTopPadding(insets.top)]}>
      <Text style={styles.heading}>ความคิดเห็นทั้งหมด</Text>
      {reviews.length === 0 ? (
        <Text style={styles.empty}>ยังไม่มีความคิดเห็น</Text>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item, index) => `review-${index}-${item.jobTitle}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: index < reviews.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.bodyText, { fontWeight: '600', flex: 1 }]}>{item.jobTitle}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                  <StarRating
                    rating={item.rating}
                    onRatingChange={() => {}}
                    disabled={true}
                    size={16}
                  />
                </View>
              </View>
              <Text style={[styles.metaCompact, { marginBottom: 4 }]}>จาก: {item.requesterName}</Text>
              <Text style={styles.bodyText}>{item.review}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

