import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DeleteConfirmationModal({ colors, onConfirm, onCancel, itemName }: any) {
  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.deleteModalCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.deleteModalTitle, { color: colors.foreground }]}>Are you absolutely sure?</Text>
        <Text style={[styles.deleteModalSubTitle, { color: colors.mutedForeground }]}>
          This will delete the part "{itemName}" and remove it from active inventory.
          You can restore it later from the Deleted Items list.
        </Text>
        <View style={styles.deleteModalActions}>
          <TouchableOpacity onPress={onCancel} style={[styles.cancelDeleteBtn, { backgroundColor: colors.muted }]} activeOpacity={0.7}>
            <Text style={[styles.cancelDeleteBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} style={[styles.deleteSureBtn, { backgroundColor: colors.destructive }]} activeOpacity={0.7}>
            <Text style={[styles.deleteSureBtnText, { color: colors.destructiveForeground }]}>Delete</Text>
          </TouchableOpacity>
        </View>
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
  deleteModalCard: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  deleteModalTitle: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 8,
  },
  deleteModalSubTitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelDeleteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelDeleteBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  deleteSureBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteSureBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
