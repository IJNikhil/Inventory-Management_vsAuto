// import React, { useEffect, useState, useCallback } from 'react';
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
//   RefreshControl,
// } from 'react-native';
// import {
//   PlusCircle,
//   Edit,
//   Trash2,
//   User as UserIcon,
//   X,
//   Eye,
//   EyeOff,
//   Shield,
//   RefreshCw,
// } from 'lucide-react-native';

// import type { User } from '../types';
// import { useToast } from '../hooks/use-toast';
// import { useColors, useTheme } from '../context/ThemeContext';
// import { useAppSelector } from '../lib/redux/hooks';
// import { selectAuth } from '../lib/redux/slices/auth-slice';
// import { getUsers, updateUser, addUser, deleteUser, getUserById } from '../services/user-service';

// /* ───────────────────────── HELPER FUNCTIONS ──────────────────────── */

// // Helper function to get active users (filter out deleted ones)
// async function getActiveUsers(): Promise<User[]> {
//   const allUsers = await getUsers();
//   return allUsers.filter(user => 
//     user.status !== 'deleted' && 
//     user.status !== 'force_deleted' && 
//     user.status !== 'pending_deletion'
//   );
// }

// // Helper function to migrate users status (add status field to existing users)
// async function migrateUsersStatus(): Promise<void> {
//   const allUsers = await getUsers();
//   const usersToUpdate = allUsers.filter(user => !user.status);
  
//   for (const user of usersToUpdate) {
//     await updateUser(user.id, { status: 'active' });
//   }
// }

// // Helper function for admin force delete
// async function adminForceDeleteUser(userId: string, adminPassword: string): Promise<void> {
//   // In a real implementation, you'd verify the admin password here
//   // For now, we'll just use the regular delete function
//   await deleteUser(userId);
// }

// /* ───────────────────────── UI HELPERS ──────────────────────── */

// function AvatarDisplay({
//   name,
//   avatar,
//   colors,
// }: {
//   name?: string;
//   avatar?: string;
//   colors: any;
// }) {
//   return (
//     <View style={[styles.avatarWrap, { backgroundColor: colors.muted }]}>
//       {avatar ? (
//         <UserIcon color={colors.mutedForeground} size={32} />
//       ) : (
//         <Text style={[styles.avatarInitial, { color: colors.mutedForeground }]}>
//           {name?.charAt(0)?.toUpperCase() ?? '?'}
//         </Text>
//       )}
//     </View>
//   );
// }

// function Badge({ label, admin, colors }: { label: string; admin?: boolean; colors: any }) {
//   return (
//     <View
//       style={[
//         styles.badge,
//         {
//           backgroundColor: admin ? colors.primary + '20' : colors.accent + '20',
//           borderColor: admin ? colors.primary : colors.accent,
//         },
//       ]}
//     >
//       <Text style={[styles.badgeText, { color: admin ? colors.primary : colors.accent }]}>
//         {label}
//       </Text>
//     </View>
//   );
// }

// function SkeletonBox({ width, height, colors }: { width: number; height: number; colors: any }) {
//   return (
//     <View
//       style={{
//         width,
//         height,
//         backgroundColor: colors.muted,
//         borderRadius: 8,
//         marginBottom: 14,
//         alignSelf: 'center',
//       }}
//     />
//   );
// }

// /* ────────────────────────── MAIN SCREEN ──────────────────────── */

// export default function UserListScreen() {
//   const colors = useColors();
//   const { isDark } = useTheme();
//   const { toast } = useToast();
//   const { user: currentUser } = useAppSelector(selectAuth);

//   const [users, setUsers] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [addModalOpen, setAddModalOpen] = useState(false);
//   const [isMigrating, setIsMigrating] = useState(false);

//   const isAdmin = currentUser?.role === 'Admin';

//   /* ▸ Fetch users on mount */
//   const loadUsers = useCallback(async (showLoading = true) => {
//     if (showLoading) setIsLoading(true);
//     try {
//       console.log("[UserListScreen] Loading users...");
//       const data = await getActiveUsers();
//       console.log("[UserListScreen] Loaded users:", data.length);
//       setUsers(data);
//     } catch (error: any) {
//       console.error('Error loading users:', error);
//       toast({
//         title: 'Error',
//         description: error.message || 'Could not load users.',
//         variant: 'destructive',
//       });
//     } finally {
//       if (showLoading) setIsLoading(false);
//     }
//   }, [toast]);

//   useEffect(() => {
//     loadUsers(true);
//   }, [loadUsers]);

//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       await loadUsers(false);
//       toast({ title: 'Refreshed', description: 'Users data updated successfully.' });
//     } catch (error) {
//       console.error('Error refreshing users:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [loadUsers, toast]);

//   /* ▸ Migration function for existing users */
//   const handleMigrateUsers = useCallback(async () => {
//     setIsMigrating(true);
//     try {
//       await migrateUsersStatus();
//       await loadUsers(false);
//       toast({ 
//         title: 'Migration Complete', 
//         description: 'All users have been updated with status fields.' 
//       });
//     } catch (error) {
//       console.error('Error migrating users:', error);
//       toast({
//         title: 'Migration Failed',
//         description: 'Could not migrate users. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsMigrating(false);
//     }
//   }, [loadUsers, toast]);

//   /* ▸ CRUD HANDLERS */
//   const handleAddUser = async (body: Omit<User, 'id' | 'lastModified'> & { password: string }) => {
//     try {
//       console.log("[UserListScreen] Adding user...");
      
//       // Add required fields including lastModified
//       const userWithMeta: Omit<User, 'id'> & { password: string } = {
//         ...body,
//         status: body.status || 'active',
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         lastModified: Date.now(),
//         password: body.password,
//       };
      
//       const newUser = await addUser(userWithMeta);
      
//       if (newUser) {
//         console.log("[UserListScreen] User added:", newUser);
//         setUsers((prev) => [newUser, ...prev]);
//         toast({
//           title: 'User Added',
//           description: `${newUser.name} has been created successfully.`,
//         });
//         return true;
//       } else {
//         throw new Error('Failed to create user');
//       }
//     } catch (error: any) {
//       console.error('Error adding user:', error);
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to add user.',
//         variant: 'destructive',
//       });
//       return false;
//     }
//   };

//   const handleUpdateUser = async (id: string, body: Partial<Omit<User, 'id' | 'lastModified'>>) => {
//     try {
//       console.log("[UserListScreen] Updating user:", id);
      
//       const updateData = {
//         ...body,
//         updatedAt: new Date().toISOString(),
//         lastModified: Date.now(),
//       };
      
//       await updateUser(id, updateData);
//       const updatedUser = await getUserById(id);
      
//       if (updatedUser) {
//         setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
//         toast({
//           title: 'User Updated',
//           description: `${updatedUser.name} has been updated successfully.`,
//         });
//         return true;
//       } else {
//         throw new Error('Failed to fetch updated user');
//       }
//     } catch (error: any) {
//       console.error('Error updating user:', error);
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to update user.',
//         variant: 'destructive',
//       });
//       return false;
//     }
//   };

//   const handleDeleteUser = async (id: string, userName: string) => {
//     try {
//       console.log("[UserListScreen] Deleting user:", id);
//       await deleteUser(id);
//       console.log("[UserListScreen] User deleted, removing from list");
//       setUsers((prev) => prev.filter((u) => u.id !== id));
//       toast({
//         title: 'User Deleted',
//         description: `${userName} has been completely removed from the system.`,
//       });
//     } catch (error: any) {
//       console.error('Error deleting user:', error);
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to delete user.',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleForceDeleteUser = async (id: string, userName: string, adminPassword: string) => {
//     try {
//       console.log("[UserListScreen] Force deleting user:", id);
//       await adminForceDeleteUser(id, adminPassword);
//       console.log("[UserListScreen] User force deleted, removing from list");
//       setUsers((prev) => prev.filter((u) => u.id !== id));
//       toast({
//         title: 'User Force Deleted',
//         description: `${userName} has been permanently removed by admin.`,
//       });
//     } catch (error: any) {
//       console.error('Error force deleting user:', error);
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to force delete user.',
//         variant: 'destructive',
//       });
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={styles.contentContainer}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ‣ HEADER */}
//         <View style={styles.headerRow}>
//           <Text style={[styles.headerTitle, { color: colors.foreground }]}>
//             User Management
//           </Text>

//           <View style={styles.headerActions}>
//             {/* Migration Button (only for admin and when needed) */}
//             {isAdmin && (
//               <TouchableOpacity
//                 style={[styles.migrateBtn, { backgroundColor: colors.accent }]}
//                 onPress={handleMigrateUsers}
//                 activeOpacity={0.8}
//                 disabled={isMigrating}
//               >
//                 {isMigrating ? (
//                   <ActivityIndicator size={16} color={colors.accentForeground} />
//                 ) : (
//                   <RefreshCw size={16} color={colors.accentForeground} />
//                 )}
//                 <Text style={[styles.migrateBtnText, { color: colors.accentForeground }]}>
//                   {isMigrating ? 'Migrating...' : 'Migrate'}
//                 </Text>
//               </TouchableOpacity>
//             )}

//             {/* Add User Button */}
//             {isAdmin && (
//               <TouchableOpacity
//                 style={[styles.addBtn, { backgroundColor: colors.primary }]}
//                 onPress={() => setAddModalOpen(true)}
//                 activeOpacity={0.8}
//               >
//                 <PlusCircle color={colors.primaryForeground} size={18} style={styles.addIcon} />
//                 <Text style={[styles.addLabel, { color: colors.primaryForeground }]}>
//                   Add User
//                 </Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>

//         <Text style={[styles.subHeader, { color: colors.mutedForeground }]}>
//           Manage user accounts and permissions for your store.
//         </Text>

//         {/* ‣ USER LIST */}
//         <View style={[styles.listCard, { backgroundColor: colors.card }]}>
//           {isLoading ? (
//             <View style={styles.loadingContainer}>
//               {[...Array(3)].map((_, i) => (
//                 <SkeletonBox key={i} width={320} height={64} colors={colors} />
//               ))}
//               <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
//               <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
//                 Loading users...
//               </Text>
//             </View>
//           ) : (
//             <FlatList
//               data={users}
//               keyExtractor={(u) => u.id}
//               renderItem={({ item }) => (
//                 <UserRow
//                   user={item}
//                   colors={colors}
//                   currentUser={currentUser}
//                   onUpdate={handleUpdateUser}
//                   onDelete={handleDeleteUser}
//                   onForceDelete={handleForceDeleteUser}
//                 />
//               )}
//               ListEmptyComponent={
//                 <View style={styles.emptyContainer}>
//                   <UserIcon size={48} color={colors.mutedForeground} />
//                   <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
//                     No Users Found
//                   </Text>
//                   <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
//                     {users.length === 0 
//                       ? "Add your first user to get started with user management."
//                       : "Try refreshing to see if there are users to load."
//                     }
//                   </Text>
//                   {isAdmin && (
//                     <TouchableOpacity
//                       style={[styles.migrateBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
//                       onPress={handleMigrateUsers}
//                       activeOpacity={0.8}
//                       disabled={isMigrating}
//                     >
//                       <RefreshCw size={16} color={colors.primaryForeground} />
//                       <Text style={[styles.migrateBtnText, { color: colors.primaryForeground }]}>
//                         Load All Users
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               }
//               showsVerticalScrollIndicator={false}
//               scrollEnabled={false}
//             />
//           )}
//         </View>
//       </ScrollView>

//       {/* ‣ ADD-USER MODAL */}
//       {isAdmin && (
//         <UserEditModal
//           visible={addModalOpen}
//           colors={styles}
//           onClose={() => setAddModalOpen(false)}
//           onSave={async (u) => {
//             // Ensure password is provided for new users
//             if (!u.password) {
//               toast({
//                 title: 'Password required',
//                 description: 'Password is required for new users.',
//                 variant: 'destructive',
//               });
//               return;
//             }
//             const ok = await handleAddUser(u as Omit<User, 'id' | 'lastModified'> & { password: string });
//             if (ok) setAddModalOpen(false);
//           }}
//         />
//       )}
//     </View>
//   );
// }

// /* ───────────────────────── USER ROW ──────────────────────── */

// function UserRow({
//   user,
//   currentUser,
//   onUpdate,
//   onDelete,
//   onForceDelete,
//   colors,
// }: {
//   user: User;
//   currentUser: User | null;
//   onUpdate: (id: string, d: Partial<Omit<User, 'id' | 'lastModified'>>) => Promise<boolean>;
//   onDelete: (id: string, userName: string) => void;
//   onForceDelete: (id: string, userName: string, password: string) => void;
//   colors: any;
// }) {
//   const [editOpen, setEditOpen] = useState(false);
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const isAdmin = currentUser?.role === 'Admin';
//   const isSelf = currentUser?.id === user.id;
//   const canEdit = isAdmin || isSelf;
//   const canDelete = isAdmin;

//   const handleDelete = async () => {
//     setIsDeleting(true);
//     try {
//       await onDelete(user.id, user.name);
//       setConfirmOpen(false);
//     } catch (error) {
//       console.error('Error in handleDelete:', error);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleForceDelete = async (password: string) => {
//     setIsDeleting(true);
//     try {
//       await onForceDelete(user.id, user.name, password);
//       setForceDeleteOpen(false);
//     } catch (error) {
//       console.error('Error in handleForceDelete:', error);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   return (
//     <>
//       <View style={[styles.row, { borderColor: colors.border }]}>
//         <AvatarDisplay name={user.name} avatar={user.avatar ?? undefined} colors={colors} />

//         <View style={styles.userInfo}>
//           <Text style={[styles.userName, { color: colors.foreground }]}>{user.name}</Text>
//           <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user.email}</Text>
//           {user.status && (
//             <Text style={[styles.userStatus, { color: colors.mutedForeground }]}>
//               Status: {user.status}
//             </Text>
//           )}
//         </View>

//         <Badge label={user.role} admin={user.role === 'Admin'} colors={colors} />

//         {/* Actions */}
//         {canEdit && (
//           <TouchableOpacity style={styles.iconBtn} onPress={() => setEditOpen(true)} activeOpacity={0.7}>
//             <Edit color={colors.primary} size={18} />
//           </TouchableOpacity>
//         )}

//         {canDelete && (
//           <TouchableOpacity
//             style={styles.iconBtn}
//             onPress={() => setConfirmOpen(true)}
//             activeOpacity={0.7}
//             disabled={isDeleting}
//           >
//             {isDeleting ? (
//               <ActivityIndicator size={18} color={colors.destructive} />
//             ) : (
//               <Trash2 color={colors.destructive} size={18} />
//             )}
//           </TouchableOpacity>
//         )}

//         {isAdmin && !isSelf && (
//           <TouchableOpacity
//             style={styles.iconBtn}
//             onPress={() => setForceDeleteOpen(true)}
//             activeOpacity={0.7}
//           >
//             <Shield color={colors.destructive} size={18} />
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* EDIT MODAL */}
//       <UserEditModal
//         visible={editOpen}
//         user={user}
//         colors={styles}
//         onClose={() => setEditOpen(false)}
//         onSave={async (val) => {
//           const ok = await onUpdate(user.id, val);
//           if (ok) setEditOpen(false);
//         }}
//       />

//       {/* DELETE CONFIRMATION */}
//       <DeleteConfirmationModal
//         visible={confirmOpen}
//         colors={styles}
//         onClose={() => setConfirmOpen(false)}
//         onConfirm={handleDelete}
//         itemName={user.name}
//         isLoading={isDeleting}
//       />

//       {/* FORCE DELETE MODAL */}
//       <ForceDeleteModal
//         visible={forceDeleteOpen}
//         colors={styles}
//         userName={user.name}
//         onClose={() => setForceDeleteOpen(false)}
//         onConfirm={handleForceDelete}
//         isLoading={isDeleting}
//       />
//     </>
//   );
// }

// /* ───────────────────────── FORCE DELETE MODAL ──────────────────────── */

// function ForceDeleteModal({
//   visible,
//   colors,
//   userName,
//   onClose,
//   onConfirm,
//   isLoading,
// }: {
//   visible: boolean;
//   colors: any;
//   userName: string;
//   onClose: () => void;
//   onConfirm: (password: string) => void;
//   isLoading?: boolean;
// }) {
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   const handleConfirm = () => {
//     if (!password.trim()) {
//       return;
//     }
//     onConfirm(password);
//   };

//   useEffect(() => {
//     if (visible) {
//       setPassword('');
//       setShowPassword(false);
//     }
//   }, [visible]);

//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
//       <View style={[styles.modalOverlay]}>
//         <View style={[styles.forceDeleteCard, { backgroundColor: colors.card }]}>
//           <Text style={[styles.forceDeleteTitle, { color: colors.destructive }]}>
//             ⚠️ Admin Force Delete
//           </Text>
//           <Text style={[styles.forceDeleteMsg, { color: colors.foreground }]}>
//             You are about to permanently delete "{userName}". This will completely remove their document from Firestore.
//           </Text>
//           <Text style={[styles.forceDeleteWarning, { color: colors.mutedForeground }]}>
//             Enter your admin password to confirm:
//           </Text>

//           <View style={styles.passwordInputContainer}>
//             <TextInput
//               value={password}
//               onChangeText={setPassword}
//               placeholder="Admin password"
//               placeholderTextColor={colors.mutedForeground}
//               secureTextEntry={!showPassword}
//               style={[
//                 styles.forceDeleteInput,
//                 {
//                   borderColor: colors.border,
//                   color: colors.foreground,
//                   backgroundColor: colors.background,
//                 },
//               ]}
//               editable={!isLoading}
//               autoCapitalize="none"
//             />
//             <TouchableOpacity
//               onPress={() => setShowPassword(!showPassword)}
//               style={styles.passwordToggle}
//               activeOpacity={0.7}
//             >
//               {showPassword ? (
//                 <EyeOff size={20} color={colors.mutedForeground} />
//               ) : (
//                 <Eye size={20} color={colors.mutedForeground} />
//               )}
//             </TouchableOpacity>
//           </View>

//           <View style={styles.forceDeleteActions}>
//             <TouchableOpacity
//               onPress={onClose}
//               style={[styles.cancelBtn, { backgroundColor: colors.muted }]}
//               activeOpacity={0.7}
//               disabled={isLoading}
//             >
//               <Text style={{ color: colors.mutedForeground, fontWeight: '600' }}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={handleConfirm}
//               style={[
//                 styles.forceDeleteConfirmBtn,
//                 {
//                   backgroundColor: colors.destructive,
//                   opacity: isLoading || !password.trim() ? 0.5 : 1,
//                 },
//               ]}
//               activeOpacity={0.8}
//               disabled={isLoading || !password.trim()}
//             >
//               {isLoading && (
//                 <ActivityIndicator
//                   size={16}
//                   color={colors.destructiveForeground}
//                   style={{ marginRight: 8 }}
//                 />
//               )}
//               <Text style={{ color: colors.destructiveForeground, fontWeight: '600' }}>
//                 {isLoading ? 'Deleting...' : 'Force Delete'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// /* ───────────────────────── OTHER MODALS ──────────────────────── */

// function UserEditModal({
//   visible,
//   onClose,
//   onSave,
//   colors,
//   user,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   onSave: (v: Omit<User, 'id' | 'lastModified'> & { password?: string }) => void | Promise<void>;
//   colors: any;
//   user?: User;
// }) {
//   const { toast } = useToast();

//   const [name, setName] = useState(user?.name ?? '');
//   const [email, setEmail] = useState(user?.email ?? '');
//   const [role, setRole] = useState<User['role']>(user?.role ?? 'Shopkeeper');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     if (visible) {
//       setName(user?.name ?? '');
//       setEmail(user?.email ?? '');
//       setRole(user?.role ?? 'Shopkeeper');
//       setPassword('');
//       setShowPassword(false);
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

//       await onSave(userData);
//     } catch (error) {
//       console.error('Error in submit:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
//       <View style={[styles.modalOverlay]}>
//         <ScrollView contentContainerStyle={[styles.modalScrollContainer]}>
//           <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
//             <View style={[styles.modalHeader]}>
//               <Text style={[styles.modalTitle, { color: colors.foreground }]}>
//                 {user ? 'Edit User' : 'Add User'}
//               </Text>
//               <TouchableOpacity onPress={onClose} style={[styles.modalCloseButton]} activeOpacity={0.7}>
//                 <X size={24} color={colors.mutedForeground} />
//               </TouchableOpacity>
//             </View>

//             <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
//               {user ? 'Update user details.' : 'Create a new user account.'}
//             </Text>

//             <View style={[styles.inputContainer]}>
//               <Text style={[styles.inputLabel, { color: colors.foreground }]}>
//                 Name <Text style={[styles.required]}>*</Text>
//               </Text>
//               <TextInput
//                 value={name}
//                 onChangeText={setName}
//                 placeholder="Full name"
//                 placeholderTextColor={colors.mutedForeground}
//                 style={[
//                   styles.textInput,
//                   {
//                     borderColor: colors.border,
//                     color: colors.foreground,
//                     backgroundColor: colors.background,
//                   },
//                 ]}
//                 editable={!isSaving}
//                 autoCapitalize="words"
//               />

//               <Text style={[styles.inputLabel, { color: colors.foreground }]}>
//                 Email <Text style={[styles.required]}>*</Text>
//               </Text>
//               <TextInput
//                 value={email}
//                 onChangeText={setEmail}
//                 placeholder="Email address"
//                 placeholderTextColor={colors.mutedForeground}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 style={[ 
//                   styles.textInput,
//                   {
//                     borderColor: colors.border,
//                     color: colors.foreground,
//                     backgroundColor: colors.background,
//                   },
//                 ]}
//                 editable={!isSaving}
//               />

//               <Text style={[styles.inputLabel, { color: colors.foreground }]}>
//                 Password {!user && <Text style={[styles.required]}>*</Text>}
//                 {user && (
//                   <Text style={[styles.optional, { color: colors.mutedForeground }]}>
//                     {' '}
//                     (leave blank to keep current)
//                   </Text>
//                 )}
//               </Text>
//               <View style={[styles.passwordInputContainer]}>
//                 <TextInput
//                   value={password}
//                   onChangeText={setPassword}
//                   placeholder={user ? 'Enter new password (optional)' : 'Enter password'}
//                   placeholderTextColor={colors.mutedForeground}
//                   secureTextEntry={!showPassword}
//                   style={[
//                     styles.textInput,
//                     styles.passwordInput,
//                     {
//                       borderColor: colors.border,
//                       color: colors.foreground,
//                       backgroundColor: colors.background,
//                     },
//                   ]}
//                   editable={!isSaving}
//                   autoCapitalize="none"
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowPassword(!showPassword)}
//                   style={[styles.passwordToggle]}
//                   activeOpacity={0.7}
//                 >
//                   {showPassword ? (
//                     <EyeOff size={20} color={colors.mutedForeground} />
//                   ) : (
//                     <Eye size={20} color={colors.mutedForeground} />
//                   )}
//                 </TouchableOpacity>
//               </View>
//               {password.length > 0 && password.length < 6 && (
//                 <Text style={[styles.passwordHint, { color: colors.destructive }]}>
//                   Password must be at least 6 characters long
//                 </Text>
//               )}

//               <Text style={[styles.inputLabel, { color: colors.foreground }]}>
//                 Role <Text style={[styles.required]}>*</Text>
//               </Text>
//               <View style={[styles.roleRow]}>
//                 {(['Shopkeeper', 'Admin'] as User['role'][]).map((r) => (
//                   <TouchableOpacity
//                     key={r}
//                     style={[
//                       styles.roleBtn,
//                       {
//                         backgroundColor: role === r ? colors.primary : colors.background,
//                         borderColor: role === r ? colors.primary : colors.border,
//                       },
//                     ]}
//                     onPress={() => setRole(r)}
//                     activeOpacity={0.7}
//                     disabled={isSaving}
//                   >
//                     <Text
//                       style={{
//                         color: role === r ? colors.primaryForeground : colors.foreground,
//                         fontWeight: '600',
//                         fontSize: 14,
//                       }}
//                     >
//                       {r}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             <View style={[styles.modalActions]}>
//               <TouchableOpacity
//                 onPress={onClose}
//                 style={[styles.cancelBtn, { backgroundColor: colors.muted }]}
//                 activeOpacity={0.7}
//                 disabled={isSaving}
//               >
//                 <Text style={{ color: colors.mutedForeground, fontWeight: '600' }}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={submit}
//                 style={[
//                   styles.saveBtn,
//                   {
//                     backgroundColor: colors.primary,
//                     opacity: isSaving ? 0.7 : 1,
//                   },
//                 ]}
//                 activeOpacity={0.8}
//                 disabled={isSaving}
//               >
//                 {isSaving && (
//                   <ActivityIndicator
//                     size={16}
//                     color={colors.primaryForeground}
//                     style={{ marginRight: 8 }}
//                   />
//                 )}
//                 <Text style={{ color: colors.primaryForeground, fontWeight: '600' }}>
//                   {isSaving ? 'Saving...' : user ? 'Save' : 'Add'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </ScrollView>
//       </View>
//     </Modal>
//   );
// }

// function DeleteConfirmationModal({
//   visible,
//   onClose,
//   onConfirm,
//   itemName,
//   colors,
//   isLoading,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   itemName: string;
//   colors: any;
//   isLoading?: boolean;
// }) {
//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
//       <View style={[styles.modalOverlay]}>
//         <View style={[styles.confirmCard, { backgroundColor: colors.card }]}>
//           <Text style={[styles.confirmTitle, { color: colors.foreground }]}>
//             Are you absolutely sure?
//           </Text>
//           <Text style={[styles.confirmMsg, { color: colors.destructive }]}>
//             This will completely delete "{itemName}" from the database. This action cannot be undone.
//           </Text>

//           <View style={[styles.confirmActions]}>
//             <TouchableOpacity
//               onPress={onClose}
//               style={[styles.cancelBtn, { backgroundColor: colors.muted }]}
//               activeOpacity={0.7}
//               disabled={isLoading}
//             >
//               <Text style={{ color: colors.mutedForeground, fontWeight: '600' }}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={onConfirm}
//               style={[
//                 styles.deactivateBtn,
//                 {
//                   backgroundColor: colors.destructive,
//                   opacity: isLoading ? 0.7 : 1,
//                 },
//               ]}
//               activeOpacity={0.8}
//               disabled={isLoading}
//             >
//               {isLoading && (
//                 <ActivityIndicator
//                   size={16}
//                   color={colors.destructiveForeground}
//                   style={{ marginRight: 8 }}
//                 />
//               )}
//               <Text style={{ color: colors.destructiveForeground, fontWeight: '600' }}>
//                 {isLoading ? 'Deleting...' : 'Delete Completely'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   contentContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 24,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     flex: 1,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   migrateBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 6,
//   },
//   migrateBtnText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   addBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 8,
//     gap: 8,
//   },
//   addIcon: {
//     marginRight: 0,
//   },
//   addLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   subHeader: {
//     fontSize: 16,
//     marginBottom: 24,
//     lineHeight: 22,
//   },
//   listCard: {
//     borderRadius: 12,
//     padding: 20,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     paddingVertical: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyText: {
//     fontSize: 16,
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     gap: 12,
//   },
//   avatarWrap: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   avatarInitial: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   userEmail: {
//     fontSize: 14,
//     marginBottom: 2,
//   },
//   userStatus: {
//     fontSize: 12,
//     fontStyle: 'italic',
//   },
//   badge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     borderWidth: 1,
//   },
//   badgeText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   iconBtn: {
//     padding: 8,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalScrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   modalCard: {
//     width: '90%',
//     maxWidth: 400,
//     borderRadius: 16,
//     padding: 24,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   modalSub: {
//     fontSize: 14,
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   inputContainer: {
//     gap: 16,
//     marginBottom: 24,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   required: {
//     color: '#ef4444',
//   },
//   optional: {
//     fontSize: 12,
//     fontWeight: '400',
//   },
//   textInput: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     fontSize: 16,
//   },
//   passwordInputContainer: {
//     position: 'relative',
//   },
//   passwordInput: {
//     paddingRight: 48,
//   },
//   passwordToggle: {
//     position: 'absolute',
//     right: 12,
//     top: '50%',
//     marginTop: -10,
//     padding: 4,
//   },
//   passwordHint: {
//     fontSize: 12,
//     marginTop: 4,
//   },
//   roleRow: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   roleBtn: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     alignItems: 'center',
//   },
//   modalActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   cancelBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   saveBtn: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   forceDeleteCard: {
//     width: '90%',
//     maxWidth: 400,
//     borderRadius: 16,
//     padding: 24,
//   },
//   forceDeleteTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 12,
//   },
//   forceDeleteMsg: {
//     fontSize: 14,
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   forceDeleteWarning: {
//     fontSize: 14,
//     marginBottom: 16,
//   },
//   forceDeleteInput: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     fontSize: 16,
//     paddingRight: 48,
//   },
//   forceDeleteActions: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 20,
//   },
//   forceDeleteConfirmBtn: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   confirmCard: {
//     width: '85%',
//     maxWidth: 350,
//     borderRadius: 16,
//     padding: 24,
//   },
//   confirmTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   confirmMsg: {
//     fontSize: 14,
//     lineHeight: 20,
//     marginBottom: 24,
//   },
//   confirmActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   deactivateBtn: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
// });