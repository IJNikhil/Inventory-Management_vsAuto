// src/screens/profile/hooks/useProfileData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hooks';
import { 
  selectAuth, 
  setUser, 
  changePassword, 
  updateUserProfile,
  authActions 
} from '../../../lib/redux/slices/auth-slice'; // ✅ FIXED: Import correct actions
import { userService } from '../../../services/user-service';
import type { User } from '../../../types/database';

export interface ProfileData {
  name: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileLoadingStates {
  isUpdatingProfile: boolean;
  isUpdatingPassword: boolean;
  isUploadingImage: boolean;
  isRefreshing: boolean;
}

export interface UseProfileDataReturn {
  user: User | null;
  profileData: ProfileData;
  loadingStates: ProfileLoadingStates;
  setName: (name: string) => void;
  setCurrentPassword: (password: string) => void;
  setNewPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  handleProfileUpdate: () => Promise<{ success: boolean; error?: string }>;
  handlePasswordUpdate: () => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => Promise<void>;
}

export default function useProfileData(): UseProfileDataReturn {
  const { user } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  const [name, setName] = useState(user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingImage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const fresh = await userService.getCurrentUser();
      if (fresh) {
        dispatch(setUser(fresh)); // ✅ FIXED: Use setUser instead of loginSuccess
        setName(fresh.name ?? '');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

  const handleProfileUpdate = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) {
      return { success: false, error: 'Name cannot be empty' };
    }
    
    if (!user?.id) {
      return { success: false, error: 'User not found' };
    }

    try {
      setIsUpdatingProfile(true);
      
      // ✅ FIXED: Use the updateUserProfile thunk from auth slice
      const result = await dispatch(updateUserProfile({ name: name.trim() }));
      
      if (updateUserProfile.fulfilled.match(result)) {
        return { success: true };
      } else {
        return { success: false, error: result.payload as string || 'Failed to update profile' };
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      return { success: false, error: err?.message || 'Failed to update profile' };
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [name, user?.id, dispatch]);

  const handlePasswordUpdate = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: 'Please fill in all password fields' };
    }
    if (newPassword !== confirmPassword) {
      return { success: false, error: 'New passwords do not match' };
    }
    if (newPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    try {
      setIsUpdatingPassword(true);
      
      // ✅ FIXED: Use the changePassword thunk from auth slice
      const result = await dispatch(changePassword({ 
        oldPassword: currentPassword, 
        newPassword: newPassword 
      }));
      
      if (changePassword.fulfilled.match(result)) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        return { success: true };
      } else {
        return { success: false, error: result.payload as string || 'Failed to change password' };
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      return { success: false, error: err?.message || 'Failed to change password' };
    } finally {
      setIsUpdatingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, dispatch]);

  return {
    user,
    profileData: { name, currentPassword, newPassword, confirmPassword },
    loadingStates: { isUpdatingProfile, isUpdatingPassword, isUploadingImage, isRefreshing },
    setName,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleProfileUpdate,
    handlePasswordUpdate,
    onRefresh,
  };
}


// // src/screens/profile/hooks/useProfileData.ts
// import { useState, useEffect, useCallback } from 'react';
// import { useAppDispatch, useAppSelector } from '../../../lib/redux/hooks';
// import { selectAuth, loginSuccess, authActions } from '../../../lib/redux/slices/auth-slice';
// import { getCurrentUser, updateProfile as updateProfileLocal } from '../../../services/user-service';

// export interface ProfileData {
//   name: string;
//   currentPassword: string;
//   newPassword: string;
//   confirmPassword: string;
// }

// export interface ProfileLoadingStates {
//   isUpdatingProfile: boolean;
//   isUpdatingPassword: boolean;
//   isUploadingImage: boolean;
//   isRefreshing: boolean;
// }

// export interface UseProfileDataReturn {
//   user: any;
//   profileData: ProfileData;
//   loadingStates: ProfileLoadingStates;
//   setName: (name: string) => void;
//   setCurrentPassword: (password: string) => void;
//   setNewPassword: (password: string) => void;
//   setConfirmPassword: (password: string) => void;
//   handleProfileUpdate: () => Promise<{ success: boolean; error?: string }>;
//   handlePasswordUpdate: () => Promise<{ success: boolean; error?: string }>;
//   onRefresh: () => Promise<void>;
// }

// export default function useProfileData(): UseProfileDataReturn {
//   const { user } = useAppSelector(selectAuth);
//   const dispatch = useAppDispatch();

//   const [name, setName] = useState(user?.name ?? '');
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
//   const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
//   const [isUploadingImage] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setName(user.name ?? '');
//     }
//   }, [user]);

//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       const fresh = await getCurrentUser();
//       if (fresh) {
//         dispatch(loginSuccess({ name: fresh.name }));
//         setName(fresh.name ?? '');
//       }
//     } finally {
//       setIsRefreshing(false);
//     }
//   }, [dispatch]);

//   const handleProfileUpdate = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
//     if (!name.trim()) {
//       return { success: false, error: 'Name cannot be empty' };
//     }
//     try {
//       setIsUpdatingProfile(true);
//       const updated = await updateProfileLocal({ name: name.trim() });
//       if (updated) {
//         dispatch(loginSuccess({ name: updated.name }));
//         return { success: true };
//       }
//       return { success: false, error: 'Failed to update profile' };
//     } catch (err: any) {
//       return { success: false, error: err?.message || 'Failed to update profile' };
//     } finally {
//       setIsUpdatingProfile(false);
//     }
//   }, [name, dispatch]);

//   const handlePasswordUpdate = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
//     if (!currentPassword || !newPassword || !confirmPassword) {
//       return { success: false, error: 'Please fill in all password fields' };
//     }
//     if (newPassword !== confirmPassword) {
//       return { success: false, error: 'New passwords do not match' };
//     }
//     if (newPassword.length < 4) {
//       return { success: false, error: 'Password must be at least 4 characters' };
//     }
//     try {
//       setIsUpdatingPassword(true);
//       await dispatch<any>(authActions.changePassword(currentPassword, newPassword));
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmPassword('');
//       return { success: true };
//     } catch (err: any) {
//       return { success: false, error: err?.message || 'Failed to change password' };
//     } finally {
//       setIsUpdatingPassword(false);
//     }
//   }, [currentPassword, newPassword, confirmPassword, dispatch]);

//   return {
//     user,
//     profileData: { name, currentPassword, newPassword, confirmPassword },
//     loadingStates: { isUpdatingProfile, isUpdatingPassword, isUploadingImage, isRefreshing },
//     setName,
//     setCurrentPassword,
//     setNewPassword,
//     setConfirmPassword,
//     handleProfileUpdate,
//     handlePasswordUpdate,
//     onRefresh,
//   };
// }
