// import { useState, useCallback, useEffect } from 'react';
// import type { User } from '../../../types';
// import { useToast } from '../../../hooks/use-toast';
// import { useAppSelector } from '../../../lib/redux/hooks';
// import { selectAuth } from '../../../lib/redux/slices/auth-slice';
// import { getUsers, updateUser, addUser, deleteUser, getUserById } from '../../../services/user-service';

// // Helper function to get active users (filter out deleted ones)
// async function getActiveUsers(): Promise<User[]> {
//   const allUsers = await getUsers();
//   return allUsers.filter(user => 
//     user.status !== 'deleted' && 
//     user.status !== 'force_deleted' && 
//     user.status !== 'pending_deletion'
//   );
// }

// // Helper function to migrate users status
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
//   await deleteUser(userId);
// }

// export const useUserList = () => {
//   const { toast } = useToast();
//   const { user: currentUser } = useAppSelector(selectAuth);

//   // State
//   const [users, setUsers] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [addModalOpen, setAddModalOpen] = useState(false);
//   const [isMigrating, setIsMigrating] = useState(false);

//   // Computed values
//   const isAdmin = currentUser?.role === 'Admin';

//   // Load users function
//   const loadUsers = useCallback(async (showLoading = true) => {
//     if (showLoading) setIsLoading(true);
//     try {
//       const data = await getActiveUsers();
//       setUsers(data);
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message || 'Could not load users.',
//         variant: 'destructive',
//       });
//     } finally {
//       if (showLoading) setIsLoading(false);
//     }
//   }, [toast]);

//   // Load users on mount
//   useEffect(() => {
//     loadUsers(true);
//   }, [loadUsers]);

//   // Migration function
//   const handleMigrateUsers = useCallback(async () => {
//     setIsMigrating(true);
//     try {
//       await migrateUsersStatus();
//       await loadUsers(false);
//       toast({ 
//         title: 'Migration Complete', 
//         description: 'All users have been updated with status fields.' 
//       });
//     } catch {
//       toast({
//         title: 'Migration Failed',
//         description: 'Could not migrate users. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsMigrating(false);
//     }
//   }, [loadUsers, toast]);

//   // Add user function with admin credentials
//   const handleAddUser = useCallback(async (
//     body: Omit<User, 'id' | 'lastModified'> & { password: string },
//     adminEmail: string,
//     adminPassword: string
//   ) => {
//     try {
//       const userWithMeta = {
//         ...body,
//         status: body.status || 'active',
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         password: body.password,
//         adminEmail,
//         adminPassword,
//       };
      
//       const newUser = await addUser(userWithMeta);
      
//       if (newUser) {
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
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to add user.',
//         variant: 'destructive',
//       });
//       return false;
//     }
//   }, [toast]);

//   // Update user function
//   const handleUpdateUser = useCallback(async (id: string, body: Partial<Omit<User, 'id' | 'lastModified'>>) => {
//     try {
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
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to update user.',
//         variant: 'destructive',
//       });
//       return false;
//     }
//   }, [toast]);

//   // Delete user function
//   const handleDeleteUser = useCallback(async (id: string, userName: string) => {
//     try {
//       await deleteUser(id);
//       setUsers((prev) => prev.filter((u) => u.id !== id));
//       toast({
//         title: 'User Deleted',
//         description: `${userName} has been completely removed from the system.`,
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to delete user.',
//         variant: 'destructive',
//       });
//     }
//   }, [toast]);

//   // Force delete user function
//   const handleForceDeleteUser = useCallback(async (id: string, userName: string, adminPassword: string) => {
//     try {
//       await adminForceDeleteUser(id, adminPassword);
//       setUsers((prev) => prev.filter((u) => u.id !== id));
//       toast({
//         title: 'User Force Deleted',
//         description: `${userName} has been permanently removed by admin.`,
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to force delete user.',
//         variant: 'destructive',
//       });
//     }
//   }, [toast]);

//   // Modal controls
//   const openAddModal = () => setAddModalOpen(true);
//   const closeAddModal = () => setAddModalOpen(false);

//   return {
//     // State
//     users,
//     isLoading,
//     isRefreshing,
//     addModalOpen,
//     isMigrating,
    
//     // Computed
//     isAdmin,
//     currentUser,
    
//     // Actions
//     loadUsers,
//     handleMigrateUsers,
//     handleAddUser,
//     handleUpdateUser,
//     handleDeleteUser,
//     handleForceDeleteUser,
//     openAddModal,
//     closeAddModal,
//   };
// };



// // import { useState, useCallback, useEffect } from 'react';
// // import type { User } from '../../../types';
// // import { useToast } from '../../../hooks/use-toast';
// // import { useAppSelector } from '../../../lib/redux/hooks';
// // import { selectAuth } from '../../../lib/redux/slices/auth-slice';
// // import { getUsers, updateUser, addUser, deleteUser, getUserById } from '../../../services/user-service';

// // // Helper function to get active users (filter out deleted ones)
// // async function getActiveUsers(): Promise<User[]> {
// //   const allUsers = await getUsers();
// //   return allUsers.filter(user => 
// //     user.status !== 'deleted' && 
// //     user.status !== 'force_deleted' && 
// //     user.status !== 'pending_deletion'
// //   );
// // }

// // // Helper function to migrate users status
// // async function migrateUsersStatus(): Promise<void> {
// //   const allUsers = await getUsers();
// //   const usersToUpdate = allUsers.filter(user => !user.status);
  
// //   for (const user of usersToUpdate) {
// //     await updateUser(user.id, { status: 'active' });
// //   }
// // }

// // // Helper function for admin force delete
// // async function adminForceDeleteUser(userId: string, adminPassword: string): Promise<void> {
// //   // In a real implementation, you'd verify the admin password here
// //   await deleteUser(userId);
// // }

// // export const useUserList = () => {
// //   const { toast } = useToast();
// //   const { user: currentUser } = useAppSelector(selectAuth);

// //   // State
// //   const [users, setUsers] = useState<User[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [isRefreshing, setIsRefreshing] = useState(false);
// //   const [addModalOpen, setAddModalOpen] = useState(false);
// //   const [isMigrating, setIsMigrating] = useState(false);

// //   // Computed values
// //   const isAdmin = currentUser?.role === 'Admin';

// //   // Load users function
// //   const loadUsers = useCallback(async (showLoading = true) => {
// //     if (showLoading) setIsLoading(true);
// //     try {
// //       const data = await getActiveUsers();
// //       setUsers(data);
// //     } catch (error: any) {
// //       toast({
// //         title: 'Error',
// //         description: error.message || 'Could not load users.',
// //         variant: 'destructive',
// //       });
// //     } finally {
// //       if (showLoading) setIsLoading(false);
// //     }
// //   }, [toast]);

// //   // Load users on mount
// //   useEffect(() => {
// //     loadUsers(true);
// //   }, [loadUsers]);

// //   // Refresh function
// //   const onRefresh = useCallback(async () => {
// //     setIsRefreshing(true);
// //     try {
// //       await loadUsers(false);
// //       toast({ title: 'Refreshed', description: 'Users data updated successfully.' });
// //     } catch {
// //       // Silent fail
// //     } finally {
// //       setIsRefreshing(false);
// //     }
// //   }, [loadUsers, toast]);

// //   // Migration function
// //   const handleMigrateUsers = useCallback(async () => {
// //     setIsMigrating(true);
// //     try {
// //       await migrateUsersStatus();
// //       await loadUsers(false);
// //       toast({ 
// //         title: 'Migration Complete', 
// //         description: 'All users have been updated with status fields.' 
// //       });
// //     } catch {
// //       toast({
// //         title: 'Migration Failed',
// //         description: 'Could not migrate users. Please try again.',
// //         variant: 'destructive',
// //       });
// //     } finally {
// //       setIsMigrating(false);
// //     }
// //   }, [loadUsers, toast]);

// //   // Add user function
// //   const handleAddUser = useCallback(async (body: Omit<User, 'id' | 'lastModified'> & { password: string }) => {
// //     try {
// //       const userWithMeta: Omit<User, 'id'> & { password: string } = {
// //         ...body,
// //         status: body.status || 'active',
// //         createdAt: new Date().toISOString(),
// //         updatedAt: new Date().toISOString(),
// //         lastModified: Date.now(),
// //         password: body.password,
// //       };
      
// //       const newUser = await addUser(userWithMeta);
      
// //       if (newUser) {
// //         setUsers((prev) => [newUser, ...prev]);
// //         toast({
// //           title: 'User Added',
// //           description: `${newUser.name} has been created successfully.`,
// //         });
// //         return true;
// //       } else {
// //         throw new Error('Failed to create user');
// //       }
// //     } catch (error: any) {
// //       toast({
// //         title: 'Error',
// //         description: error.message || 'Failed to add user.',
// //         variant: 'destructive',
// //       });
// //       return false;
// //     }
// //   }, [toast]);

// //   // Update user function
// //   const handleUpdateUser = useCallback(async (id: string, body: Partial<Omit<User, 'id' | 'lastModified'>>) => {
// //     try {
// //       const updateData = {
// //         ...body,
// //         updatedAt: new Date().toISOString(),
// //         lastModified: Date.now(),
// //       };
      
// //       await updateUser(id, updateData);
// //       const updatedUser = await getUserById(id);
      
// //       if (updatedUser) {
// //         setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
// //         toast({
// //           title: 'User Updated',
// //           description: `${updatedUser.name} has been updated successfully.`,
// //         });
// //         return true;
// //       } else {
// //         throw new Error('Failed to fetch updated user');
// //       }
// //     } catch (error: any) {
// //       toast({
// //         title: 'Error',
// //         description: error.message || 'Failed to update user.',
// //         variant: 'destructive',
// //       });
// //       return false;
// //     }
// //   }, [toast]);

// //   // Delete user function
// //   const handleDeleteUser = useCallback(async (id: string, userName: string) => {
// //     try {
// //       await deleteUser(id);
// //       setUsers((prev) => prev.filter((u) => u.id !== id));
// //       toast({
// //         title: 'User Deleted',
// //         description: `${userName} has been completely removed from the system.`,
// //       });
// //     } catch (error: any) {
// //       toast({
// //         title: 'Error',
// //         description: error.message || 'Failed to delete user.',
// //         variant: 'destructive',
// //       });
// //     }
// //   }, [toast]);

// //   // Force delete user function
// //   const handleForceDeleteUser = useCallback(async (id: string, userName: string, adminPassword: string) => {
// //     try {
// //       await adminForceDeleteUser(id, adminPassword);
// //       setUsers((prev) => prev.filter((u) => u.id !== id));
// //       toast({
// //         title: 'User Force Deleted',
// //         description: `${userName} has been permanently removed by admin.`,
// //       });
// //     } catch (error: any) {
// //       toast({
// //         title: 'Error',
// //         description: error.message || 'Failed to force delete user.',
// //         variant: 'destructive',
// //       });
// //     }
// //   }, [toast]);

// //   // Modal controls
// //   const openAddModal = () => setAddModalOpen(true);
// //   const closeAddModal = () => setAddModalOpen(false);

// //   return {
// //     // State
// //     users,
// //     isLoading,
// //     isRefreshing,
// //     addModalOpen,
// //     isMigrating,
    
// //     // Computed
// //     isAdmin,
// //     currentUser,
    
// //     // Actions
// //     loadUsers,
// //     onRefresh,
// //     handleMigrateUsers,
// //     handleAddUser,
// //     handleUpdateUser,
// //     handleDeleteUser,
// //     handleForceDeleteUser,
// //     openAddModal,
// //     closeAddModal,
// //   };
// // };
