import React from 'react';
import { View } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './ExpenseDetailStyles';
import { Skeleton } from '../../components/ui/Skeleton';

export function ExpenseDetailSkeleton() {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Skeleton style={{ height: 36, width: 144 }} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Skeleton style={{ height: 36, width: 96 }} />
          <Skeleton style={{ height: 36, width: 96 }} />
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Skeleton style={{ height: 32, width: '50%', marginBottom: 16 }} />
        <Skeleton style={{ height: 160, width: '100%' }} />
      </View>
    </View>
  );
}
