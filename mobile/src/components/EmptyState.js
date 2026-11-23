import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmptyState = ({ emoji = '🍽️', title, message }) => (
  <View style={styles.wrap}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E1B18',
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: '#8C857E',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default EmptyState;
