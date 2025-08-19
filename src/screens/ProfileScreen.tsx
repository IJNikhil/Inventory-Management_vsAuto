// import React, { useState, useEffect, useCallback } from 'react'
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   StyleSheet,
//   Platform,
//   RefreshControl,
//   ActivityIndicator,
// } from 'react-native'
// import { Lock, Camera, User, Mail, Shield } from 'lucide-react-native'
// import { launchImageLibrary } from 'react-native-image-picker'

// import { useToast } from '../hooks/use-toast'
// import { useAppDispatch, useAppSelector } from '../lib/redux/hooks'
// import {
//   selectAuth,
//   setUser,
//   updateUserPassword,
// } from '../lib/redux/slices/auth-slice'
// import { useColors, useTheme } from '../context/ThemeContext'
// import {getUserById, updateUser } from '../services/user-service'

// export default function ProfileScreen() {
//   const { user } = useAppSelector(selectAuth)
//   const dispatch = useAppDispatch()
//   const { toast } = useToast()

//   // Theme hooks
//   const colors = useColors()
//   const { isDark } = useTheme()

//   const [name, setName] = useState(user?.name ?? '')
//   const [avatar, setAvatar] = useState(
//     user?.avatar ??
//       `https://placehold.co/128x128.png?text=${user?.name?.charAt(0)}`
//   )
//   const [currentPassword, setCurrentPassword] = useState('')
//   const [newPassword, setNewPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
//   const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
//   const [isUploadingImage, setIsUploadingImage] = useState(false)
//   const [isRefreshing, setIsRefreshing] = useState(false)

//   useEffect(() => {
//     if (user) {
//       setName(user.name ?? '')
//       setAvatar(
//         user.avatar ??
//           `https://placehold.co/128x128.png?text=${user.name?.charAt(0)}`
//       )
//     }
//   }, [user])

//   // Refresh function
//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true)
//     try {
//       // Fetch the latest user data
//       if (user?.id) {
//         const updatedUser = await getUserById(user.id)
//         if (updatedUser) {
//           dispatch(setUser(updatedUser))
//           setName(updatedUser.name ?? '')
//           setAvatar(
//             updatedUser.avatar ??
//               `https://placehold.co/128x128.png?text=${updatedUser.name?.charAt(0)}`
//           )
//         }
//       }
//       toast({ title: 'Refreshed', description: 'Profile data updated successfully.' })
//     } catch (error) {
//       console.error('Error refreshing profile:', error)
//       toast({ 
//         title: 'Error', 
//         description: 'Failed to refresh profile data.', 
//         variant: 'destructive' 
//       })
//     } finally {
//       setIsRefreshing(false)
//     }
//   }, [toast, user?.id, dispatch])

//   const handleImagePick = async () => {
//     if (!user) return

//     try {
//       setIsUploadingImage(true)
//       const result = await launchImageLibrary({
//         mediaType: 'photo',
//         includeBase64: true,
//         quality: 0.8,
//       })

//       if (result.didCancel) return

//       const selected = result.assets?.[0]

//       if (selected?.base64 && selected?.type) {
//         const base64Img = `data:${selected.type};base64,${selected.base64}`
//         setAvatar(base64Img)
        
//         // Update user avatar in repository
//         await updateUser(user.id, { avatar: base64Img })
        
//         // Fetch the updated user object
//         const updatedUser = await getUserById(user.id)
//         if (updatedUser) {
//           dispatch(setUser(updatedUser))
//           toast({
//             title: 'Success',
//             description: 'Profile picture updated successfully.',
//           })
//         } else {
//           throw new Error('Failed to fetch updated user')
//         }
//       }
//     } catch (error) {
//       console.error('Error updating profile picture:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to update profile picture.',
//         variant: 'destructive',
//       })
//       // Revert avatar on error
//       setAvatar(
//         user?.avatar ??
//           `https://placehold.co/128x128.png?text=${user?.name?.charAt(0)}`
//       )
//     } finally {
//       setIsUploadingImage(false)
//     }
//   }

//   const handleProfileUpdate = async () => {
//     if (!user) return

//     if (!name.trim()) {
//       toast({
//         title: 'Error',
//         description: 'Name cannot be empty.',
//         variant: 'destructive',
//       })
//       return
//     }

//     try {
//       setIsUpdatingProfile(true)
      
//       // Update user name in repository
//       await updateUser(user.id, { name: name.trim() })
      
//       // Fetch the updated user object
//       const updatedUser = await getUserById(user.id)
//       if (updatedUser) {
//         dispatch(setUser(updatedUser))
//         toast({
//           title: 'Success',
//           description: 'Account details updated successfully.',
//         })
//       } else {
//         throw new Error('Failed to fetch updated user')
//       }
//     } catch (error) {
//       console.error('Error updating profile:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to update profile.',
//         variant: 'destructive',
//       })
//       // Revert name on error
//       setName(user?.name ?? '')
//     } finally {
//       setIsUpdatingProfile(false)
//     }
//   }

//   const handlePasswordUpdate = async () => {
//     if (!currentPassword || !newPassword || !confirmPassword) {
//       toast({
//         title: 'Error',
//         description: 'Please fill in all password fields.',
//         variant: 'destructive',
//       })
//       return
//     }

//     if (newPassword !== confirmPassword) {
//       toast({
//         title: 'Error',
//         description: 'New passwords do not match.',
//         variant: 'destructive',
//       })
//       return
//     }

//     if (newPassword.length < 6) {
//       toast({
//         title: 'Error',
//         description: 'Password must be at least 6 characters long.',
//         variant: 'destructive',
//       })
//       return
//     }

//     try {
//       setIsUpdatingPassword(true)
//       const result = await dispatch(
//         updateUserPassword({
//           currentPass: currentPassword,
//           newPass: newPassword,
//         })
//       )

//       if (updateUserPassword.fulfilled.match(result)) {
//         toast({
//           title: 'Success',
//           description: 'Password updated successfully.',
//         })
//         setCurrentPassword('')
//         setNewPassword('')
//         setConfirmPassword('')
//       } else {
//         toast({
//           title: 'Failed',
//           description: result.payload as string,
//           variant: 'destructive',
//         })
//       }
//     } catch (error) {
//       console.error('Error updating password:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to update password.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsUpdatingPassword(false)
//     }
//   }

//   if (!user) {
//     return (
//       <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
//         <ActivityIndicator size="large" color={colors.primary} />
//         <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
//           Loading profile...
//         </Text>
//       </View>
//     )
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <ScrollView 
//         style={{ flex: 1 }}
//         contentContainerStyle={styles.scrollContent}
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
//         {/* Profile Header */}
//         <View style={styles.profileHeader}>
//           <View style={styles.avatarContainer}>
//             <Image
//               source={{ uri: avatar }}
//               style={[styles.avatar, { borderColor: colors.primary }]}
//             />
//             <TouchableOpacity
//               onPress={handleImagePick}
//               style={[styles.cameraButton, { backgroundColor: colors.primary }]}
//               activeOpacity={0.8}
//               disabled={isUploadingImage}
//             >
//               {isUploadingImage ? (
//                 <ActivityIndicator size={16} color={colors.primaryForeground} />
//               ) : (
//                 <Camera size={16} color={colors.primaryForeground} />
//               )}
//             </TouchableOpacity>
//           </View>
//           <Text style={[styles.userName, { color: colors.foreground }]}>{user.name}</Text>
//           <Text style={[styles.userRole, { color: colors.mutedForeground }]}>{user.role}</Text>
//           <Text style={[styles.tapPhoto, { color: colors.mutedForeground }]}>
//             Tap camera icon to change photo
//           </Text>
//         </View>

//         {/* Account Details Card */}
//         <View style={[styles.card, { backgroundColor: colors.card }]}>
//           <View style={styles.cardHeader}>
//             <User size={20} color={colors.primary} />
//             <Text style={[styles.cardTitle, { color: colors.foreground }]}>Account Details</Text>
//           </View>
          
//           <View style={styles.fieldContainer}>
//             <View style={styles.fieldBlock}>
//               <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
//               <TextInput
//                 style={[styles.input, {
//                   backgroundColor: colors.background,
//                   borderColor: colors.border,
//                   color: colors.foreground,
//                 }]}
//                 value={name}
//                 onChangeText={setName}
//                 placeholder="Enter your full name"
//                 placeholderTextColor={colors.mutedForeground}
//                 editable={!isUpdatingProfile}
//                 selectionColor={colors.primary}
//               />
//             </View>

//             <View style={styles.fieldBlock}>
//               <Text style={[styles.label, { color: colors.foreground }]}>Email Address</Text>
//               <View style={styles.inputWithIcon}>
//                 <Mail size={16} color={colors.mutedForeground} style={styles.inputIcon} />
//                 <TextInput
//                   style={[styles.input, styles.disabledInput, {
//                     backgroundColor: colors.muted,
//                     borderColor: colors.border,
//                     color: colors.mutedForeground,
//                     paddingLeft: 40,
//                   }]}
//                   editable={false}
//                   value={user.email}
//                   placeholderTextColor={colors.mutedForeground}
//                 />
//               </View>
//               <Text style={[styles.helpText, { color: colors.mutedForeground }]}>
//                 Email cannot be changed
//               </Text>
//             </View>

//             <View style={styles.fieldBlock}>
//               <Text style={[styles.label, { color: colors.foreground }]}>Role</Text>
//               <View style={styles.inputWithIcon}>
//                 <Shield size={16} color={colors.mutedForeground} style={styles.inputIcon} />
//                 <TextInput
//                   style={[styles.input, styles.disabledInput, {
//                     backgroundColor: colors.muted,
//                     borderColor: colors.border,
//                     color: colors.mutedForeground,
//                     paddingLeft: 40,
//                   }]}
//                   editable={false}
//                   value={user.role}
//                   placeholderTextColor={colors.mutedForeground}
//                 />
//               </View>
//               <Text style={[styles.helpText, { color: colors.mutedForeground }]}>
//                 Role is assigned by admin
//               </Text>
//             </View>

//             <TouchableOpacity
//               onPress={handleProfileUpdate}
//               style={[styles.saveButton, { 
//                 backgroundColor: colors.primary,
//                 opacity: isUpdatingProfile ? 0.7 : 1
//               }]}
//               disabled={isUpdatingProfile}
//               activeOpacity={0.8}
//             >
//               {isUpdatingProfile ? (
//                 <ActivityIndicator size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//               ) : null}
//               <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>
//                 {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Password Change Card */}
//         <View style={[styles.card, { backgroundColor: colors.card }]}>
//           <View style={styles.cardHeader}>
//             <Lock size={20} color={colors.primary} />
//             <Text style={[styles.cardTitle, { color: colors.foreground }]}>Change Password</Text>
//           </View>
          
//           <Text style={[styles.cardDescription, { color: colors.mutedForeground }]}>
//             Use a strong password to keep your account secure.
//           </Text>

//           <View style={styles.fieldContainer}>
//             <View style={styles.fieldBlock}>
//               <Text style={[styles.label, { color: colors.foreground }]}>Current Password</Text>
//               <TextInput
//                 style={[styles.input, {
//                   backgroundColor: colors.background,
//                   borderColor: colors.border,
//                   color: colors.foreground,
//                 }]}
//                 value={currentPassword}
//                 onChangeText={setCurrentPassword}
//                 secureTextEntry
//                 placeholder="Enter current password"
//                 placeholderTextColor={colors.mutedForeground}
//                 editable={!isUpdatingPassword}
//                 selectionColor={colors.primary}
//               />
//             </View>

//             <View style={styles.fieldBlock}>
//               <Text style={[styles.label, { color: colors.foreground }]}>New Password</Text>
//               <TextInput
//                 style={[styles.input, {
//                   backgroundColor: colors.background,
//                   borderColor: colors.border,
//                   color: colors.foreground,
//                 }]}
//                 value={newPassword}
//                 onChangeText={setNewPassword}
//                 secureTextEntry
//                 placeholder="Enter new password"
//                 placeholderTextColor={colors.mutedForeground}
//                 editable={!isUpdatingPassword}
//                 selectionColor={colors.primary}
//               />
//             </View>

//             <View style={styles.fieldBlock}>
//               <Text style={[styles.label, { color: colors.foreground }]}>Confirm New Password</Text>
//               <TextInput
//                 style={[styles.input, {
//                   backgroundColor: colors.background,
//                   borderColor: colors.border,
//                   color: colors.foreground,
//                 }]}
//                 value={confirmPassword}
//                 onChangeText={setConfirmPassword}
//                 secureTextEntry
//                 placeholder="Confirm new password"
//                 placeholderTextColor={colors.mutedForeground}
//                 editable={!isUpdatingPassword}
//                 selectionColor={colors.primary}
//               />
//               <Text style={[styles.helpText, { color: colors.mutedForeground }]}>
//                 Password must be at least 6 characters long
//               </Text>
//             </View>

//             <TouchableOpacity
//               onPress={handlePasswordUpdate}
//               style={[styles.updateButton, { 
//                 backgroundColor: colors.primary,
//                 opacity: isUpdatingPassword ? 0.7 : 1
//               }]}
//               disabled={isUpdatingPassword}
//               activeOpacity={0.8}
//             >
//               {isUpdatingPassword ? (
//                 <ActivityIndicator size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//               ) : null}
//               <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>
//                 {isUpdatingPassword ? 'Updating...' : 'Update Password'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingVertical: 24,
//   },
//   profileHeader: {
//     alignItems: 'center',
//     marginBottom: 32,
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginBottom: 16,
//   },
//   avatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 3,
//   },
//   cameraButton: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   userRole: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   tapPhoto: {
//     fontSize: 14,
//     fontStyle: 'italic',
//   },
//   card: {
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginLeft: 12,
//   },
//   cardDescription: {
//     fontSize: 14,
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   fieldContainer: {
//     gap: 16,
//   },
//   fieldBlock: {
//     marginBottom: 4,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     fontSize: 16,
//   },
//   disabledInput: {
//     opacity: 0.6,
//   },
//   inputWithIcon: {
//     position: 'relative',
//   },
//   inputIcon: {
//     position: 'absolute',
//     left: 12,
//     top: '50%',
//     marginTop: -8,
//     zIndex: 1,
//   },
//   helpText: {
//     fontSize: 12,
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   updateButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   saveButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// })
