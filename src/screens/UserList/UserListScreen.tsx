// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   Modal,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   StatusBar,
// } from 'react-native';
// import {
//   PlusCircle,
//   Edit3,
//   Trash2,
//   User as UserIcon,
//   X,
//   Eye,
//   EyeOff,
//   Shield,
//   RefreshCw,
//   Mail,
//   Crown,
//   Users,
//   ChevronRight,
//   MoreVertical,
// } from 'lucide-react-native';

// import type { User } from '../../types';
// import { useToast } from '../../hooks/use-toast';
// import { useColors, useTheme } from '../../context/ThemeContext';
// import { useUserList } from './hooks/useUserList';
// import { useAppSelector } from '../../lib/redux/hooks';
// import { selectAuth } from '../../lib/redux/slices/auth-slice';

// /* ────────────────────────── MAIN SCREEN ──────────────────────── */

// export default function UserListScreen() {
//   const colors = useColors();
//   const { isDark } = useTheme();
  
//   const {
//     users,
//     isLoading,
//     addModalOpen,
//     isMigrating,
//     isAdmin,
//     currentUser,
//     handleMigrateUsers,
//     handleAddUser,
//     handleUpdateUser,
//     handleDeleteUser,
//     handleForceDeleteUser,
//     openAddModal,
//     closeAddModal,
//   } = useUserList();

//   const styles = createStyles(colors, isDark);

//   if (isLoading) {
//     return (
//       <View style={styles.container}>
//         <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
//         <View style={styles.loadingContainer}>
//           <View style={styles.loadingSpinner}>
//             <ActivityIndicator size="large" color={colors.primary} />
//           </View>
//           <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
//             Loading team members...
//           </Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
      
//       {/* Header Stats */}
//       <View style={styles.headerSection}>
//         <View style={styles.statsRow}>
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.primary }]}>{users.length}</Text>
//             <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Members</Text>
//           </View>
//           <View style={styles.statDivider} />
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.accent }]}>
//               {users.filter(u => u.role === 'Admin').length}
//             </Text>
//             <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Administrators</Text>
//           </View>
//         </View>

//         {/* Action Buttons */}
//         {isAdmin && (
//           <View style={styles.actionsRow}>
//             <TouchableOpacity
//               style={[styles.actionBtn, styles.secondaryBtn, { backgroundColor: colors.muted }]}
//               onPress={handleMigrateUsers}
//               activeOpacity={0.6}
//               disabled={isMigrating}
//             >
//               {isMigrating ? (
//                 <ActivityIndicator size={14} color={colors.mutedForeground} />
//               ) : (
//                 <RefreshCw size={14} color={colors.mutedForeground} />
//               )}
//               <Text style={[styles.btnText, { color: colors.mutedForeground }]}>
//                 {isMigrating ? 'Syncing' : 'Sync'}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.actionBtn, styles.primaryBtn, { backgroundColor: colors.primary }]}
//               onPress={openAddModal}
//               activeOpacity={0.6}
//             >
//               <PlusCircle size={14} color={colors.primaryForeground} />
//               <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
//                 Add Member
//               </Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       {/* Users List */}
//       <View style={styles.listContainer}>
//         {users.length === 0 ? (
//           <EmptyState 
//             colors={colors} 
//             styles={styles} 
//             isAdmin={isAdmin} 
//             onMigrate={handleMigrateUsers} 
//             isMigrating={isMigrating} 
//           />
//         ) : (
//           <>
//             <View style={[styles.listHeader, { borderBottomColor: colors.border }]}>
//               <Text style={[styles.listHeaderText, { color: colors.mutedForeground }]}>
//                 Team Members ({users.length})
//               </Text>
//             </View>
            
//             <FlatList
//               data={users}
//               keyExtractor={(user) => user.id}
//               renderItem={({ item, index }) => (
//                 <UserRow
//                   key={item.id}
//                   user={item}
//                   colors={colors}
//                   styles={styles}
//                   currentUser={currentUser}
//                   onUpdate={handleUpdateUser}
//                   onDelete={handleDeleteUser}
//                   onForceDelete={handleForceDeleteUser}
//                   isFirst={index === 0}
//                   isLast={index === users.length - 1}
//                 />
//               )}
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ flexGrow: 1 }}
//             />
//           </>
//         )}
//       </View>

//       {/* Add User Modal */}
//       {isAdmin && (
//         <UserEditModal
//           visible={addModalOpen}
//           colors={colors}
//           styles={styles}
//           onClose={closeAddModal}
//           onSave={async (userData, adminEmail, adminPassword) => {
//             if (!userData.password || !adminEmail || !adminPassword) return;
            
//             const ok = await handleAddUser(
//               userData as Omit<User, 'id' | 'lastModified'> & { password: string },
//               adminEmail,
//               adminPassword
//             );
//             if (ok) closeAddModal();
//           }}
//         />
//       )}
//     </View>
//   );
// }

// /* ───────────────────────── COMPONENTS ──────────────────────── */

// function UserRow({
//   user,
//   currentUser,
//   onUpdate,
//   onDelete,
//   onForceDelete,
//   colors,
//   styles,
//   isFirst,
//   isLast,
// }: {
//   user: User;
//   currentUser: User | null;
//   onUpdate: (id: string, d: Partial<Omit<User, 'id' | 'lastModified'>>) => Promise<boolean>;
//   onDelete: (id: string, userName: string) => void;
//   onForceDelete: (id: string, userName: string, password: string) => void;
//   colors: any;
//   styles: any;
//   isFirst: boolean;
//   isLast: boolean;
// }) {
//   const [editOpen, setEditOpen] = useState(false);
//   const [deleteOpen, setDeleteOpen] = useState(false);
//   const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
//   const [showActions, setShowActions] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const isAdmin = currentUser?.role === 'Admin';
//   const isSelf = currentUser?.id === user.id;
//   const canEdit = isAdmin || isSelf;
//   const canDelete = isAdmin && !isSelf;

//   const handleDelete = async () => {
//     setIsDeleting(true);
//     try {
//       await onDelete(user.id, user.name);
//       setDeleteOpen(false);
//     } catch {
//       // Silent fail
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleForceDelete = async (password: string) => {
//     setIsDeleting(true);
//     try {
//       await onForceDelete(user.id, user.name, password);
//       setForceDeleteOpen(false);
//     } catch {
//       // Silent fail
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   return (
//     <>
//       <TouchableOpacity
//         style={[
//           styles.userRow,
//           { borderBottomColor: colors.border },
//           isFirst && styles.userRowFirst,
//           isLast && styles.userRowLast,
//         ]}
//         onPress={() => setShowActions(!showActions)}
//         activeOpacity={0.7}
//       >
//         <View style={styles.userRowContent}>
//           {/* Avatar */}
//           <View style={[
//             styles.avatar,
//             { backgroundColor: user.role === 'Admin' ? colors.primary + '15' : colors.muted }
//           ]}>
//             <Text style={[
//               styles.avatarText,
//               { color: user.role === 'Admin' ? colors.primary : colors.mutedForeground }
//             ]}>
//               {user.name?.charAt(0)?.toUpperCase() ?? '?'}
//             </Text>
//           </View>

//           {/* User Info */}
//           <View style={styles.userInfo}>
//             <View style={styles.nameRow}>
//               <Text style={[styles.userName, { color: colors.foreground }]}>
//                 {user.name}
//               </Text>
//               {user.role === 'Admin' && (
//                 <Crown size={12} color={colors.primary} style={styles.crownIcon} />
//               )}
//               {isSelf && (
//                 <View style={[styles.youTag, { backgroundColor: colors.primary + '15' }]}>
//                   <Text style={[styles.youTagText, { color: colors.primary }]}>YOU</Text>
//                 </View>
//               )}
//             </View>
            
//             <View style={styles.detailsRow}>
//               <Mail size={10} color={colors.mutedForeground} />
//               <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
//                 {user.email}
//               </Text>
//             </View>

//             <View style={styles.metaRow}>
//               <View style={[
//                 styles.roleBadge,
//                 { 
//                   backgroundColor: user.role === 'Admin' ? colors.primary + '10' : colors.accent + '10',
//                   borderColor: user.role === 'Admin' ? colors.primary + '20' : colors.accent + '20',
//                 }
//               ]}>
//                 <Text style={[
//                   styles.roleText,
//                   { color: user.role === 'Admin' ? colors.primary : colors.accent }
//                 ]}>
//                   {user.role}
//                 </Text>
//               </View>
              
//               {user.status && user.status !== 'active' && (
//                 <Text style={[styles.statusDot, { color: colors.mutedForeground }]}>
//                   • {user.status}
//                 </Text>
//               )}
//             </View>
//           </View>

//           {/* Arrow Icon */}
//           <View style={styles.arrowContainer}>
//             <ChevronRight 
//               size={16} 
//               color={colors.mutedForeground} 
//               style={{ 
//                 transform: [{ rotate: showActions ? '90deg' : '0deg' }]
//               }}
//             />
//           </View>
//         </View>

//         {/* Expandable Actions */}
//         {showActions && (
//           <View style={[styles.actionsPanel, { backgroundColor: colors.muted + '30' }]}>
//             <View style={styles.actionsList}>
//               {canEdit && (
//                 <TouchableOpacity
//                   style={[styles.actionItem, { borderBottomColor: colors.border }]}
//                   onPress={() => {
//                     setEditOpen(true);
//                     setShowActions(false);
//                   }}
//                   activeOpacity={0.6}
//                 >
//                   <Edit3 size={16} color={colors.primary} />
//                   <Text style={[styles.actionText, { color: colors.foreground }]}>
//                     Edit Member
//                   </Text>
//                 </TouchableOpacity>
//               )}

//               {canDelete && (
//                 <TouchableOpacity
//                   style={[styles.actionItem, { borderBottomColor: colors.border }]}
//                   onPress={() => {
//                     setDeleteOpen(true);
//                     setShowActions(false);
//                   }}
//                   activeOpacity={0.6}
//                   disabled={isDeleting}
//                 >
//                   {isDeleting ? (
//                     <ActivityIndicator size={16} color={colors.destructive} />
//                   ) : (
//                     <Trash2 size={16} color={colors.destructive} />
//                   )}
//                   <Text style={[styles.actionText, { color: colors.destructive }]}>
//                     {isDeleting ? 'Removing...' : 'Remove Member'}
//                   </Text>
//                 </TouchableOpacity>
//               )}

//               {isAdmin && !isSelf && (
//                 <TouchableOpacity
//                   style={styles.actionItem}
//                   onPress={() => {
//                     setForceDeleteOpen(true);
//                     setShowActions(false);
//                   }}
//                   activeOpacity={0.6}
//                 >
//                   <Shield size={16} color={colors.destructive} />
//                   <Text style={[styles.actionText, { color: colors.destructive }]}>
//                     Force Remove
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* Modals */}
//       <UserEditModal
//         visible={editOpen}
//         user={user}
//         colors={colors}
//         styles={styles}
//         onClose={() => setEditOpen(false)}
//         onSave={async (val) => {
//           const ok = await onUpdate(user.id, val);
//           if (ok) setEditOpen(false);
//         }}
//       />

//       <DeleteModal
//         visible={deleteOpen}
//         colors={colors}
//         styles={styles}
//         userName={user.name}
//         onClose={() => setDeleteOpen(false)}
//         onConfirm={handleDelete}
//         isLoading={isDeleting}
//       />

//       <ForceDeleteModal
//         visible={forceDeleteOpen}
//         colors={colors}
//         styles={styles}
//         userName={user.name}
//         onClose={() => setForceDeleteOpen(false)}
//         onConfirm={handleForceDelete}
//         isLoading={isDeleting}
//       />
//     </>
//   );
// }

// function EmptyState({ 
//   colors, 
//   styles, 
//   isAdmin, 
//   onMigrate, 
//   isMigrating 
// }: {
//   colors: any;
//   styles: any;
//   isAdmin: boolean;
//   onMigrate: () => void;
//   isMigrating: boolean;
// }) {
//   return (
//     <View style={styles.emptyContainer}>
//       <View style={[styles.emptyIcon, { backgroundColor: colors.muted + '40' }]}>
//         <Users size={28} color={colors.mutedForeground} />
//       </View>
//       <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
//         No team members found
//       </Text>
//       <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
//         Start building your team by syncing existing users or adding new members
//       </Text>
//       {isAdmin && (
//         <TouchableOpacity
//           style={[styles.actionBtn, styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
//           onPress={onMigrate}
//           activeOpacity={0.6}
//           disabled={isMigrating}
//         >
//           <RefreshCw size={14} color={colors.primaryForeground} />
//           <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
//             Sync Users
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// /* ───────────────────────── MODALS ──────────────────────── */

// function UserEditModal({
//   visible,
//   onClose,
//   onSave,
//   colors,
//   styles,
//   user,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   onSave: (v: Omit<User, 'id' | 'lastModified'> & { password?: string }, adminEmail?: string, adminPassword?: string) => void | Promise<void>;
//   colors: any;
//   styles: any;
//   user?: User;
// }) {
//   const { toast } = useToast();
//   const { user: currentUser } = useAppSelector(selectAuth);

//   const [name, setName] = useState(user?.name ?? '');
//   const [email, setEmail] = useState(user?.email ?? '');
//   const [role, setRole] = useState<User['role']>(user?.role ?? 'Shopkeeper');
//   const [password, setPassword] = useState('');
//   const [adminPassword, setAdminPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showAdminPassword, setShowAdminPassword] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     if (visible) {
//       setName(user?.name ?? '');
//       setEmail(user?.email ?? '');
//       setRole(user?.role ?? 'Shopkeeper');
//       setPassword('');
//       setAdminPassword('');
//       setShowPassword(false);
//       setShowAdminPassword(false);
//     }
//   }, [visible, user]);

//   const submit = async () => {
//     if (!name.trim() || !email.trim()) {
//       toast({
//         title: 'Missing fields',
//         description: 'Please fill in name and email fields.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     if (!user && !password.trim()) {
//       toast({
//         title: 'Password required',
//         description: 'Password is required for new users.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     if (password.trim() && password.length < 6) {
//       toast({
//         title: 'Password too short',
//         description: 'Password must be at least 6 characters long.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     // For new users, require admin password
//     if (!user && !adminPassword.trim()) {
//       toast({
//         title: 'Admin password required',
//         description: 'Please enter your admin password to create new users.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       toast({
//         title: 'Invalid email',
//         description: 'Please enter a valid email address.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     setIsSaving(true);
//     try {
//       const userData: Omit<User, 'id' | 'lastModified'> & { password?: string } = {
//         name: name.trim(),
//         email: email.trim().toLowerCase(),
//         role,
//         status: user?.status || 'active',
//         createdAt: user?.createdAt || new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         authAccountCreated: user?.authAccountCreated || false,
//         avatar: user?.avatar,
//         deletedAt: user?.deletedAt,
//         deletedBy: user?.deletedBy,
//         restoredAt: user?.restoredAt,
//         passwordChangeRequested: user?.passwordChangeRequested,
//         pendingPassword: user?.pendingPassword,
//         password: password.trim() || undefined,
//       };

//       if (!user) {
//         // New user creation - pass admin credentials
//         await onSave(userData, currentUser?.email, adminPassword.trim());
//       } else {
//         // User update
//         await onSave(userData);
//       }
//     } catch {
//       // Silent fail
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <Modal visible={visible} transparent animationType="slide">
//       <View style={styles.modalOverlay}>
//         <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
//           <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
//             <Text style={[styles.modalTitle, { color: colors.foreground }]}>
//               {user ? 'Edit Member' : 'Add Team Member'}
//             </Text>
//             <TouchableOpacity onPress={onClose} style={styles.modalClose} activeOpacity={0.6}>
//               <X size={20} color={colors.mutedForeground} />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
//             <Text style={[styles.modalDesc, { color: colors.mutedForeground }]}>
//               {user ? 'Update member information and permissions' : 'Add a new member to your team'}
//             </Text>

//             <View style={styles.formGroup}>
//               <Text style={[styles.label, { color: colors.foreground }]}>
//                 Full Name <Text style={[styles.required, { color: colors.destructive }]}>*</Text>
//               </Text>
//               <TextInput
//                 value={name}
//                 onChangeText={setName}
//                 placeholder="Enter full name"
//                 placeholderTextColor={colors.mutedForeground}
//                 style={[styles.input, { 
//                   borderColor: colors.border, 
//                   color: colors.foreground,
//                   backgroundColor: colors.background 
//                 }]}
//                 editable={!isSaving}
//                 autoCapitalize="words"
//               />
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={[styles.label, { color: colors.foreground }]}>
//                 Email Address <Text style={[styles.required, { color: colors.destructive }]}>*</Text>
//               </Text>
//               <TextInput
//                 value={email}
//                 onChangeText={setEmail}
//                 placeholder="Enter email address"
//                 placeholderTextColor={colors.mutedForeground}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 style={[styles.input, { 
//                   borderColor: colors.border, 
//                   color: colors.foreground,
//                   backgroundColor: colors.background 
//                 }]}
//                 editable={!isSaving}
//               />
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={[styles.label, { color: colors.foreground }]}>
//                 Password {!user && <Text style={[styles.required, { color: colors.destructive }]}>*</Text>}
//                 {user && <Text style={[styles.optional, { color: colors.mutedForeground }]}> (optional)</Text>}
//               </Text>
//               <View style={styles.passwordContainer}>
//                 <TextInput
//                   value={password}
//                   onChangeText={setPassword}
//                   placeholder={user ? 'Enter new password (optional)' : 'Enter password'}
//                   placeholderTextColor={colors.mutedForeground}
//                   secureTextEntry={!showPassword}
//                   style={[styles.input, styles.passwordInput, { 
//                     borderColor: colors.border, 
//                     color: colors.foreground,
//                     backgroundColor: colors.background 
//                   }]}
//                   editable={!isSaving}
//                   autoCapitalize="none"
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowPassword(!showPassword)}
//                   style={styles.passwordToggle}
//                   activeOpacity={0.6}
//                 >
//                   {showPassword ? (
//                     <EyeOff size={16} color={colors.mutedForeground} />
//                   ) : (
//                     <Eye size={16} color={colors.mutedForeground} />
//                   )}
//                 </TouchableOpacity>
//               </View>
//               {password.length > 0 && password.length < 6 && (
//                 <Text style={[styles.error, { color: colors.destructive }]}>
//                   Password must be at least 6 characters long
//                 </Text>
//               )}
//             </View>

//             {/* Admin Password Field for New Users */}
//             {!user && (
//               <View style={styles.formGroup}>
//                 <Text style={[styles.label, { color: colors.foreground }]}>
//                   Your Admin Password <Text style={[styles.required, { color: colors.destructive }]}>*</Text>
//                 </Text>
//                 <View style={styles.passwordContainer}>
//                   <TextInput
//                     value={adminPassword}
//                     onChangeText={setAdminPassword}
//                     placeholder="Enter your admin password"
//                     placeholderTextColor={colors.mutedForeground}
//                     secureTextEntry={!showAdminPassword}
//                     style={[styles.input, styles.passwordInput, { 
//                       borderColor: colors.border, 
//                       color: colors.foreground,
//                       backgroundColor: colors.background 
//                     }]}
//                     editable={!isSaving}
//                     autoCapitalize="none"
//                   />
//                   <TouchableOpacity
//                     onPress={() => setShowAdminPassword(!showAdminPassword)}
//                     style={styles.passwordToggle}
//                     activeOpacity={0.6}
//                   >
//                     {showAdminPassword ? (
//                       <EyeOff size={16} color={colors.mutedForeground} />
//                     ) : (
//                       <Eye size={16} color={colors.mutedForeground} />
//                     )}
//                   </TouchableOpacity>
//                 </View>
//                 <Text style={[styles.optional, { color: colors.mutedForeground, marginTop: 4 }]}>
//                   Required to maintain security during user creation
//                 </Text>
//               </View>
//             )}

//             <View style={styles.formGroup}>
//               <Text style={[styles.label, { color: colors.foreground }]}>
//                 Role <Text style={[styles.required, { color: colors.destructive }]}>*</Text>
//               </Text>
//               <View style={styles.roleSelector}>
//                 {(['Shopkeeper', 'Admin'] as User['role'][]).map((r) => (
//                   <TouchableOpacity
//                     key={r}
//                     style={[
//                       styles.roleBtn,
//                       {
//                         backgroundColor: role === r ? colors.primary : 'transparent',
//                         borderColor: role === r ? colors.primary : colors.border,
//                       },
//                     ]}
//                     onPress={() => setRole(r)}
//                     activeOpacity={0.6}
//                     disabled={isSaving}
//                   >
//                     {role === r && r === 'Admin' && <Crown size={10} color={colors.primaryForeground} />}
//                     <Text
//                       style={[
//                         styles.roleBtnText,
//                         { color: role === r ? colors.primaryForeground : colors.foreground },
//                       ]}
//                     >
//                       {r}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           </ScrollView>

//           <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
//             <TouchableOpacity
//               onPress={onClose}
//               style={[styles.modalBtn, styles.cancelBtn, { backgroundColor: colors.muted }]}
//               activeOpacity={0.6}
//               disabled={isSaving}
//             >
//               <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={submit}
//               style={[
//                 styles.modalBtn,
//                 styles.saveBtn,
//                 { backgroundColor: colors.primary, opacity: isSaving ? 0.6 : 1 }
//               ]}
//               activeOpacity={0.6}
//               disabled={isSaving}
//             >
//               {isSaving && (
//                 <ActivityIndicator
//                   size={14}
//                   color={colors.primaryForeground}
//                   style={{ marginRight: 4 }}
//                 />
//               )}
//               <Text style={[styles.modalBtnText, { color: colors.primaryForeground }]}>
//                 {isSaving ? 'Saving...' : user ? 'Update' : 'Add'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// function DeleteModal({
//   visible,
//   onClose,
//   onConfirm,
//   userName,
//   colors,
//   styles,
//   isLoading,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   userName: string;
//   colors: any;
//   styles: any;
//   isLoading?: boolean;
// }) {
//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <View style={styles.modalOverlay}>
//         <View style={[styles.alertModal, { backgroundColor: colors.card }]}>
//           <Text style={[styles.alertTitle, { color: colors.foreground }]}>
//             Remove Team Member?
//           </Text>
//           <Text style={[styles.alertMsg, { color: colors.mutedForeground }]}>
//             This will permanently remove "{userName}" from your team.{'\n'}This action cannot be undone.
//           </Text>

//           <View style={styles.alertActions}>
//             <TouchableOpacity
//               onPress={onClose}
//               style={[styles.modalBtn, styles.cancelBtn, { backgroundColor: colors.muted }]}
//               activeOpacity={0.6}
//               disabled={isLoading}
//             >
//               <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={onConfirm}
//               style={[
//                 styles.modalBtn,
//                 styles.deleteBtn,
//                 { backgroundColor: colors.destructive, opacity: isLoading ? 0.6 : 1 }
//               ]}
//               activeOpacity={0.6}
//               disabled={isLoading}
//             >
//               {isLoading && (
//                 <ActivityIndicator
//                   size={14}
//                   color={colors.destructiveForeground}
//                   style={{ marginRight: 4 }}
//                 />
//               )}
//               <Text style={[styles.modalBtnText, { color: colors.destructiveForeground }]}>
//                 {isLoading ? 'Removing...' : 'Remove'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// function ForceDeleteModal({
//   visible,
//   colors,
//   styles,
//   userName,
//   onClose,
//   onConfirm,
//   isLoading,
// }: {
//   visible: boolean;
//   colors: any;
//   styles: any;
//   userName: string;
//   onClose: () => void;
//   onConfirm: (password: string) => void;
//   isLoading?: boolean;
// }) {
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   const handleConfirm = () => {
//     if (!password.trim()) return;
//     onConfirm(password);
//   };

//   useEffect(() => {
//     if (visible) {
//       setPassword('');
//       setShowPassword(false);
//     }
//   }, [visible]);

//   return (
//     <Modal visible={visible} transparent animationType="slide">
//       <View style={styles.modalOverlay}>
//         <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
//           <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
//             <Text style={[styles.modalTitle, { color: colors.destructive }]}>
//               ⚠️ Admin Override
//             </Text>
//             <TouchableOpacity onPress={onClose} style={styles.modalClose} activeOpacity={0.6}>
//               <X size={20} color={colors.mutedForeground} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.modalBody}>
//             <Text style={[styles.modalDesc, { 
//               color: colors.mutedForeground, 
//               textAlign: 'center', 
//               marginBottom: 20 
//             }]}>
//               You are about to permanently remove "{userName}" using admin privileges.
//               This action bypasses normal security checks.
//             </Text>

//             <View style={styles.formGroup}>
//               <Text style={[styles.label, { color: colors.foreground }]}>
//                 Enter your admin password to confirm:
//               </Text>
//               <View style={styles.passwordContainer}>
//                 <TextInput
//                   value={password}
//                   onChangeText={setPassword}
//                   placeholder="Admin password"
//                   placeholderTextColor={colors.mutedForeground}
//                   secureTextEntry={!showPassword}
//                   style={[styles.input, styles.passwordInput, { 
//                     borderColor: colors.border, 
//                     color: colors.foreground,
//                     backgroundColor: colors.background 
//                   }]}
//                   editable={!isLoading}
//                   autoCapitalize="none"
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowPassword(!showPassword)}
//                   style={styles.passwordToggle}
//                   activeOpacity={0.6}
//                 >
//                   {showPassword ? (
//                     <EyeOff size={16} color={colors.mutedForeground} />
//                   ) : (
//                     <Eye size={16} color={colors.mutedForeground} />
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>

//           <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
//             <TouchableOpacity
//               onPress={onClose}
//               style={[styles.modalBtn, styles.cancelBtn, { backgroundColor: colors.muted }]}
//               activeOpacity={0.6}
//               disabled={isLoading}
//             >
//               <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={handleConfirm}
//               style={[
//                 styles.modalBtn,
//                 styles.deleteBtn,
//                 { 
//                   backgroundColor: colors.destructive, 
//                   opacity: isLoading || !password.trim() ? 0.4 : 1 
//                 }
//               ]}
//               activeOpacity={0.6}
//               disabled={isLoading || !password.trim()}
//             >
//               {isLoading && (
//                 <ActivityIndicator
//                   size={14}
//                   color={colors.destructiveForeground}
//                   style={{ marginRight: 4 }}
//                 />
//               )}
//               <Text style={[styles.modalBtnText, { color: colors.destructiveForeground }]}>
//                 {isLoading ? 'Removing...' : 'Force Remove'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

















// /* ───────────────────────── STYLES ──────────────────────── */

// const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },

//   // Loading State
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//   },
//   loadingSpinner: {
//     marginBottom: 16,
//   },
//   loadingText: {
//     fontWeight: '500',
//     textAlign: 'center',
//   },

//   // Header Section
//   headerSection: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     backgroundColor: colors.card,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   statValue: {
//     fontWeight: '800',
//     fontSize: 20,
//     marginBottom: 2,
//   },
//   statLabel: {
//     fontWeight: '500',
//     fontSize: 11,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   statDivider: {
//     width: 1,
//     height: 30,
//     backgroundColor: colors.border,
//     marginHorizontal: 20,
//   },

//   // Actions Row
//   actionsRow: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   actionBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     gap: 4,
//   },
//   primaryBtn: {
//     // backgroundColor handled dynamically
//   },
//   secondaryBtn: {
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   btnText: {
//     fontWeight: '600',
//     fontSize: 12,
//   },

//   // List Container
//   listContainer: {
//     flex: 1,
//   },
//   listHeader: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     backgroundColor: colors.muted + '20',
//   },
//   listHeaderText: {
//     fontWeight: '600',
//     fontSize: 11,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },

//   // User Row
//   userRow: {
//     backgroundColor: colors.card,
//     borderBottomWidth: 1,
//   },
//   userRowFirst: {
//     // No additional styles needed
//   },
//   userRowLast: {
//     borderBottomWidth: 0,
//   },
//   userRowContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     gap: 12,
//   },

//   // Avatar
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   avatarText: {
//     fontWeight: '700',
//     fontSize: 16,
//   },

//   // User Info
//   userInfo: {
//     flex: 1,
//   },
//   nameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   userName: {
//     fontWeight: '700',
//     fontSize: 16,
//   },
//   crownIcon: {
//     marginLeft: 6,
//   },
//   youTag: {
//     marginLeft: 8,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   youTagText: {
//     fontWeight: '700',
//     fontSize: 9,
//     letterSpacing: 0.5,
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginBottom: 6,
//   },
//   userEmail: {
//     fontSize: 13,
//   },
//   metaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   roleBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   roleText: {
//     fontWeight: '600',
//     fontSize: 10,
//     textTransform: 'uppercase',
//   },
//   statusDot: {
//     fontSize: 12,
//   },

//   // Arrow Container
//   arrowContainer: {
//     padding: 4,
//   },

//   // Actions Panel
//   actionsPanel: {
//     marginTop: 8,
//     marginHorizontal: 20,
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   actionsList: {
//     // No additional styles needed
//   },
//   actionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     gap: 12,
//     borderBottomWidth: 1,
//   },
//   actionText: {
//     fontWeight: '600',
//   },

//   // Empty State
//   emptyContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//     paddingHorizontal: 32,
//   },
//   emptyIcon: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 20,
//   },
//   emptyTitle: {
//     fontWeight: '700',
//     fontSize: 18,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptySubtitle: {
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 24,
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     justifyContent: 'flex-end',
//   },
//   modalSheet: {
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '85%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 24,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//   },
//   modalTitle: {
//     fontWeight: '800',
//     fontSize: 18,
//   },
//   modalClose: {
//     padding: 4,
//   },
//   modalBody: {
//     padding: 24,
//     paddingTop: 16,
//   },
//   modalDesc: {
//     lineHeight: 20,
//     marginBottom: 24,
//   },

//   // Form Styles
//   formGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   required: {
//     // color handled dynamically
//   },
//   optional: {
//     fontWeight: '400',
//     fontSize: 12,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 16,
//   },
//   passwordContainer: {
//     position: 'relative',
//   },
//   passwordInput: {
//     paddingRight: 44,
//   },
//   passwordToggle: {
//     position: 'absolute',
//     right: 14,
//     top: 14,
//     padding: 4,
//   },
//   error: {
//     fontSize: 12,
//     marginTop: 4,
//   },

//   // Role Selector
//   roleSelector: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   roleBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     borderWidth: 1,
//     gap: 4,
//   },
//   roleBtnText: {
//     fontWeight: '600',
//     fontSize: 14,
//   },

//   // Modal Footer
//   modalFooter: {
//     flexDirection: 'row',
//     gap: 12,
//     padding: 24,
//     paddingTop: 16,
//     borderTopWidth: 1,
//   },
//   modalBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     borderRadius: 12,
//     gap: 4,
//   },
//   cancelBtn: {
//     // backgroundColor handled dynamically
//   },
//   saveBtn: {
//     // backgroundColor handled dynamically
//   },
//   deleteBtn: {
//     // backgroundColor handled dynamically
//   },
//   modalBtnText: {
//     fontWeight: '700',
//     fontSize: 16,
//   },

//   // Alert Modal
//   alertModal: {
//     margin: 20,
//     borderRadius: 16,
//     padding: 24,
//     maxWidth: 360,
//     alignSelf: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   alertTitle: {
//     fontWeight: '800',
//     fontSize: 16,
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   alertMsg: {
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 24,
//   },
//   alertActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
// });
