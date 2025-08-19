import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Receipt, ArrowLeft } from 'lucide-react-native';
import { useColors } from '../../../context/ThemeContext';

interface NotFoundProps {
  onBack: () => void;
}

export default function NotFound({ onBack }: NotFoundProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Receipt size={56} color={colors.mutedForeground} />
      <Text style={[styles.title, { color: colors.foreground }]}>Invoice Not Found</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        The requested invoice or customer could not be found.
      </Text>
      <TouchableOpacity
        onPress={onBack}
        style={[styles.backBtn, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
      >
        <ArrowLeft size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
        <Text style={[styles.backBtnText, { color: colors.primaryForeground }]}>Back to Invoices</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
