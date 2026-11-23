import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/theme';

const SectionHeader = ({ title, subtitle, action, onAction }) => (
  <View style={styles.row}>
    <View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    {action && (
      <TouchableOpacity onPress={onAction} style={styles.action}>
        <Text style={styles.actionText}>{action}</Text>
        <Ionicons name="chevron-forward" size={15} color={colors.orange} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.orange,
  },
});

export default SectionHeader;
