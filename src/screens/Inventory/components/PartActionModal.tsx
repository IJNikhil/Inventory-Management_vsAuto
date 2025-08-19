import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, Edit, Trash2, ArchiveRestore } from 'lucide-react-native';

export default function PartActionModal({
  part, colors, onView, onEdit, onDelete, onRestore, onClose,
}: any) {
  if (!part) return null;
  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.actionModalCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.modalTitle, { color: colors.primary }]}>{part.name}</Text>
        <Text style={[styles.modalSubTitle, { color: colors.mutedForeground }]}>
          {part.partNumber} • {part.supplierName}
        </Text>
        <TouchableOpacity onPress={onView} style={[styles.actionModalBtn, { borderBottomColor: colors.border }]} activeOpacity={0.7}>
          <Eye size={16} color={colors.primary} style={{ marginRight: 12 }} />
          <Text style={[styles.actionBtnText, { color: colors.foreground }]}>View Details</Text>
        </TouchableOpacity>

        {part.status === 'active' ? (
          <>
            <TouchableOpacity onPress={onDelete} style={[styles.actionModalBtn, { borderBottomColor: colors.border }]} activeOpacity={0.7}>
              <Trash2 size={16} color={colors.destructive} style={{ marginRight: 12 }} />
              <Text style={[styles.actionBtnText, { color: colors.destructive, fontWeight: '600' }]}>Delete Part</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={onRestore} style={[styles.actionModalBtn, { borderBottomColor: colors.border }]} activeOpacity={0.7}>
            <ArchiveRestore size={16} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Restore Part</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onClose} style={styles.cancelActionBtn} activeOpacity={0.7}>
          <Text style={[styles.cancelActionBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionModalCard: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  modalTitle: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 4,
  },
  modalSubTitle: {
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 18,
  },
  actionModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelActionBtn: {
    alignSelf: 'stretch',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelActionBtnText: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});
