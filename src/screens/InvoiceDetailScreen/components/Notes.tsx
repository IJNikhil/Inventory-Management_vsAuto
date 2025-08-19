import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../../context/ThemeContext';

interface NotesProps {
  notes?: string;
}

export default function Notes({ notes }: NotesProps) {
  const colors = useColors();

  if (!notes) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>Notes</Text>
      <Text style={[styles.text, { color: colors.mutedForeground }]}>{notes}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
