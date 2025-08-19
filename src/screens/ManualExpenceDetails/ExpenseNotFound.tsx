import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './ExpenseDetailStyles';

interface ExpenseNotFoundProps {
  onBackPress: () => void;
}

export function ExpenseNotFound({ onBackPress }: ExpenseNotFoundProps) {
  const colors = useColors();

  return (
    <View style={[styles.notFoundRoot, { backgroundColor: colors.background }]}>
      <Text style={[styles.notFoundHeadline, { color: colors.foreground }]}>
        Expense Record Not Found
      </Text>
      <Text style={[styles.notFoundSub, { color: colors.mutedForeground }]}>
        The requested expense could not be found.
      </Text>
      <TouchableOpacity
        onPress={onBackPress}
        style={[styles.backPrimaryBtn, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
      >
        <ArrowLeft size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
        <Text style={[styles.backPrimaryBtnText, { color: colors.primaryForeground }]}>
          Back to Cash Flow
        </Text>
      </TouchableOpacity>
    </View>
  );
}
