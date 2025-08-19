// src/screens/profile/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Edit3, Lock, X } from 'lucide-react-native';
import { useToast } from '../../hooks/use-toast';
import { useColors, useTheme } from '../../context/ThemeContext';
import useProfileData from './hook/useProfileData';

export default function ProfileScreen() {
  const { toast } = useToast();
  const colors = useColors();
  const { isDark } = useTheme();

  const {
    user,
    profileData,
    loadingStates,
    setName,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleProfileUpdate,
    handlePasswordUpdate,
    onRefresh,
  } = useProfileData();

  const [isEditingName, setIsEditingName] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const styles = createStyles(colors, isDark);

  // Handle name save
  const onSaveName = async () => {
    const result = await handleProfileUpdate();
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Name updated successfully.',
      });
      setIsEditingName(false);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update name.',
        variant: 'destructive',
      });
    }
  };

  // Handle password change
  const onChangePassword = async () => {
    const result = await handlePasswordUpdate();
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Password changed successfully.',
      });
      setShowPasswordModal(false);
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to change password.',
        variant: 'destructive',
      });
    }
  };

  // Handle refresh
  const onRefreshWithToast = async () => {
    try {
      await onRefresh();
      toast({ 
        title: 'Refreshed', 
        description: 'Profile updated successfully.' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to refresh profile data.', 
        variant: 'destructive' 
      });
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loadingStates.isRefreshing}
            onRefresh={onRefreshWithToast}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Manage your account information
          </Text>
        </View>

        {/* User Information */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Email */}
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>{user.email}</Text>
          </View>

          {/* Role */}
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Role</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>{user.role}</Text>
          </View>

          {/* Name with Edit */}
          <View style={styles.nameRow}>
            <View style={styles.nameInfo}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Name</Text>
              {isEditingName ? (
                <TextInput
                  style={[styles.nameInput, { 
                    color: colors.foreground, 
                    borderColor: colors.border,
                    backgroundColor: colors.background 
                  }]}
                  value={profileData.name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.mutedForeground}
                  editable={!loadingStates.isUpdatingProfile}
                  selectionColor={colors.primary}
                  autoFocus
                />
              ) : (
                <Text style={[styles.value, { color: colors.foreground }]}>{profileData.name}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                if (isEditingName) {
                  onSaveName();
                } else {
                  setIsEditingName(true);
                }
              }}
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              disabled={isEditingName && loadingStates.isUpdatingProfile}
              activeOpacity={0.8}
            >
              {loadingStates.isUpdatingProfile ? (
                <ActivityIndicator size={16} color={colors.primaryForeground} />
              ) : (
                <>
                  <Edit3 size={16} color={colors.primaryForeground} />
                  <Text style={[styles.editButtonText, { color: colors.primaryForeground }]}>
                    {isEditingName ? 'Save' : 'Edit'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          onPress={() => setShowPasswordModal(true)}
          style={[styles.passwordButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Lock size={18} color={colors.primaryForeground} />
          <Text style={[styles.passwordButtonText, { color: colors.primaryForeground }]}>
            Change Password
          </Text>
        </TouchableOpacity>

        {/* UPDATED: Bottom Sheet Style Password Modal */}
        <Modal visible={showPasswordModal} transparent animationType="slide">
          <View style={styles.bottomSheetOverlay}>
            <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
              <View style={styles.bottomSheetHeader}>
                <Text style={[styles.bottomSheetTitle, { color: colors.foreground }]}>Change Password</Text>
                <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                  <X size={24} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.passwordSection}>
                  <Text style={[styles.sectionDescription, { color: colors.mutedForeground }]}>
                    Use a strong password to keep your account secure.
                  </Text>

                  <View style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Current Password</Text>
                    <TextInput
                      style={[styles.passwordInput, { 
                        color: colors.foreground, 
                        borderColor: colors.border,
                        backgroundColor: colors.background 
                      }]}
                      value={profileData.currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Enter current password"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry
                      editable={!loadingStates.isUpdatingPassword}
                      selectionColor={colors.primary}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>New Password</Text>
                    <TextInput
                      style={[styles.passwordInput, { 
                        color: colors.foreground, 
                        borderColor: colors.border,
                        backgroundColor: colors.background 
                      }]}
                      value={profileData.newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Enter new password"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry
                      editable={!loadingStates.isUpdatingPassword}
                      selectionColor={colors.primary}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Confirm Password</Text>
                    <TextInput
                      style={[styles.passwordInput, { 
                        color: colors.foreground, 
                        borderColor: colors.border,
                        backgroundColor: colors.background 
                      }]}
                      value={profileData.confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry
                      editable={!loadingStates.isUpdatingPassword}
                      selectionColor={colors.primary}
                    />
                  </View>

                  <Text style={[styles.helpText, { color: colors.mutedForeground }]}>
                    Password must be at least 6 characters long
                  </Text>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      onPress={() => setShowPasswordModal(false)}
                      style={[styles.cancelButton, { backgroundColor: colors.muted }]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.cancelButtonText, { color: colors.mutedForeground }]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={onChangePassword}
                      style={[styles.updateButton, { 
                        backgroundColor: colors.primary,
                        opacity: loadingStates.isUpdatingPassword ? 0.6 : 1,
                      }]}
                      disabled={loadingStates.isUpdatingPassword}
                      activeOpacity={0.8}
                    >
                      {loadingStates.isUpdatingPassword ? (
                        <ActivityIndicator size={16} color={colors.primaryForeground} />
                      ) : (
                        <Text style={[styles.updateButtonText, { color: colors.primaryForeground }]}>
                          Update Password
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  infoRow: {
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  nameInfo: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  nameInput: {
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
  },
  passwordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // UPDATED: Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  passwordSection: {
    padding: 20,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
