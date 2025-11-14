import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
  size?: number;
};

export const StarRating: React.FC<Props> = ({ rating, onRatingChange, disabled = false, size = 32 }) => {
  const handlePress = (selectedRating: number) => {
    if (!disabled) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handlePress(star)}
          disabled={disabled}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#FFD700' : colors.muted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
});

