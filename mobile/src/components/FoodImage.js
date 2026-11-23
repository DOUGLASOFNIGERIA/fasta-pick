import React, { useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme/theme';

const FoodImage = ({ uri, style, emoji = '🍽️', contentFit, children }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !uri) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.emoji}>{emoji}</Text>
        {children}
      </View>
    );
  }

  return (
    <View style={[style, styles.clip]}>
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.yellowPale,
  },
  emoji: {
    fontSize: 38,
  },
});

export default FoodImage;
