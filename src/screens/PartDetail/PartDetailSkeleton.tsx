import React from 'react';
import { View, ScrollView } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { SCREEN_WIDTH, styles } from './part-detail-styles';
import { Skeleton } from '../../components/ui/Skeleton';


export function PartDetailSkeleton() {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Skeleton style={{ height: 40, width: 176 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.imageSection, { backgroundColor: colors.muted }]}>
            <Skeleton style={{ width: SCREEN_WIDTH * 0.8, height: SCREEN_WIDTH * 0.8, borderRadius: 16 }} />
          </View>
          <View style={styles.contentSection}>
            <Skeleton style={{ height: 32, width: '75%', marginBottom: 8 }} />
            <Skeleton style={{ height: 20, width: '50%', marginBottom: 24 }} />
            <Skeleton style={{ height: 24, width: '33%', marginBottom: 16 }} />
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} style={{ height: 48, width: '100%', marginBottom: 8 }} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
