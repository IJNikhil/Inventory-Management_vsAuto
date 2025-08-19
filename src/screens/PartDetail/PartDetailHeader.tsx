import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './part-detail-styles';

interface PartDetailHeaderProps {
  onBackPress: () => void;
}

export function PartDetailHeader({ onBackPress }: PartDetailHeaderProps) {
  const colors = useColors();

  return (
    <SafeAreaView 
      style={{ backgroundColor: colors.card }} 
      edges={['top']}
    >
      <View style={[styles.header, { 
        backgroundColor: colors.card,
        borderBottomColor: colors.border 
      }]}>
        <TouchableOpacity
          onPress={onBackPress}
          style={[styles.backBtn, {
            backgroundColor: colors.background,
            borderColor: colors.border
          }]}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.backBtnText, { color: colors.primary }]}>Back to Inventory</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
