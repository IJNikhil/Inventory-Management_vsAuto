import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
} from 'react-native'
import { Boxes, Building, Loader2, Store, Phone, Mail, MapPin, DollarSign, IndianRupee } from 'lucide-react-native'

import { useToast } from '../hooks/use-toast'
import { useColors, useTheme } from '../context/ThemeContext'
import type { ShopSettings } from '../types/database' // ✅ FIXED: Use database types
import { shopSettingsService } from '../services/shop-service' // ✅ FIXED: Use service objects
import { partService } from '../services/part-service' // ✅ FIXED: Use service objects
import { supplierService } from '../services/supplier-service' // ✅ FIXED: Use service objects

export default function ShopScreen() {
  const { toast } = useToast()

  // Theme hooks
  const colors = useColors()
  const { isDark } = useTheme()

  const [details, setDetails] = useState<ShopSettings | null>(null) // ✅ FIXED: ShopSettings type
  const [partCount, setPartCount] = useState(0)
  const [supplierCount, setSupplierCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const [shopSettingsArray, parts, suppliers] = await Promise.all([
        shopSettingsService.findAll(), // ✅ FIXED: Use service object method
        partService.findAll(), // ✅ FIXED: Use service object method
        supplierService.findAll(), // ✅ FIXED: Use service object method
      ])
      
      // ✅ FIXED: Get first shop settings since findAll returns array
      setDetails(shopSettingsArray[0] || null)
      setPartCount(parts.length)
      setSupplierCount(suppliers.filter((s) => s.status === 'active').length)
    } catch (error) {
      console.error('Error fetching shop data:', error)
      toast({
        title: 'Error',
        description: 'Could not fetch shop data.',
        variant: 'destructive',
      })
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  // Refresh function
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await fetchData(false)
      toast({ title: 'Refreshed', description: 'Shop data updated successfully.' })
    } catch (error) {
      console.error('Error refreshing shop data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchData, toast])

  // const handleInputChange = (field: keyof Omit<ShopSettings, 'id' | 'created_at' | 'updated_at' | 'version'>, value: string) => { // ✅ FIXED: Exclude database fields
  //   if (details) {
  //     setDetails({ 
  //       ...details, 
  //       [field]: value,
  //       updated_at: new Date().toISOString() // ✅ ADDED: Update timestamp
  //     })
  //   }
  // }

  const handleInputChange = (
  field: keyof Omit<ShopSettings, 'id' | 'created_at' | 'updated_at' | 'version'>, 
  value: string
) => {
  if (details) {
    setDetails({ 
      ...details, 
      [field]: value,
      updated_at: new Date().toISOString()
    })
  }
}


  const validateForm = () => {
    if (!details?.shop_name?.trim()) { // ✅ FIXED: shop_name
      toast({
        title: 'Validation Error',
        description: 'Shop name is required.',
        variant: 'destructive',
      })
      return false
    }
    return true
  }

const handleSubmit = async () => {
  if (!details || !validateForm()) return

  setIsSaving(true)
  try {
    if (details.id) {
      // ✅ FIXED: Update existing shop settings with currency
      await shopSettingsService.update(details.id, {
        shop_name: details.shop_name,
        phone: details.phone,
        email: details.email,
        address: details.address,
        currency: details.currency || 'INR', // ✅ ADDED: Include currency field
      })
    } else {
      // ✅ FIXED: Create new shop settings with currency
      const newSettings = await shopSettingsService.create({
        shop_name: details.shop_name,
        phone: details.phone || '',
        email: details.email || '',
        address: details.address || '',
        currency: details.currency || 'INR', // ✅ ADDED: Include currency field with default
      })
      setDetails(newSettings)
    }
    
    toast({
      title: 'Success',
      description: 'Shop details updated successfully.',
    })
  } catch (error) {
    console.error('Error updating shop details:', error)
    toast({
      title: 'Error',
      description: 'Failed to update shop details.',
      variant: 'destructive',
    })
  } finally {
    setIsSaving(false)
  }
}

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading shop details...
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Store size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.foreground }]}>Shop Management</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon={Boxes}
            title="Total Products"
            value={partCount.toString()}
            colors={colors}
          />
          <StatCard
            icon={Building}
            title="Active Suppliers"
            value={supplierCount.toString()}
            colors={colors}
          />
        </View>

        {/* Shop Details Form */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>
              Business Information
            </Text>
            <Text style={[styles.infoSubtitle, { color: colors.mutedForeground }]}>
              Manage your shop's public details and contact information.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Shop Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                Shop Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Store size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  value={details?.shop_name || ''} 
                  onChangeText={(text) => handleInputChange('shop_name', text)}
                  style={[styles.input, styles.inputWithIcon, {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.foreground,
                  }]}
                  placeholder="Enter your shop name"
                  placeholderTextColor={colors.mutedForeground}
                  editable={!isSaving}
                  selectionColor={colors.primary}
                />
              </View>
            </View>

            {/* Phone and Email Row */}
            <View style={styles.twoColumnRow}>
              <View style={[styles.columnLeft, styles.formGroup]}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                  Phone Number
                </Text>
                <View style={styles.inputContainer}>
                  <Phone size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    value={details?.phone || ''}
                    keyboardType="phone-pad"
                    onChangeText={(text) => handleInputChange('phone', text)}
                    style={[styles.input, styles.inputWithIcon, {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.foreground,
                    }]}
                    placeholder="Phone number"
                    placeholderTextColor={colors.mutedForeground}
                    editable={!isSaving}
                    selectionColor={colors.primary}
                  />
                </View>
              </View>

              <View style={[styles.columnRight, styles.formGroup]}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                  Email Address
                </Text>
                <View style={styles.inputContainer}>
                  <Mail size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    value={details?.email || ''}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={(text) => handleInputChange('email', text)}
                    style={[styles.input, styles.inputWithIcon, {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.foreground,
                    }]}
                    placeholder="Email address"
                    placeholderTextColor={colors.mutedForeground}
                    editable={!isSaving}
                    selectionColor={colors.primary}
                  />
                </View>
              </View>
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                Business Address
              </Text>
              <View style={styles.inputContainer}>
                <MapPin size={16} color={colors.mutedForeground} style={[styles.inputIcon, styles.textAreaIcon]} />
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={details?.address || ''}
                  onChangeText={(text) => handleInputChange('address', text)}
                  style={[styles.input, styles.textArea, styles.inputWithIcon, {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.foreground,
                  }]}
                  placeholder="Enter your complete business address"
                  placeholderTextColor={colors.mutedForeground}
                  editable={!isSaving}
                  selectionColor={colors.primary}
                  textAlignVertical="top"
                />
              </View>
            </View>


            {/* Currency Selection */}
<View style={styles.formGroup}>
  <Text style={[styles.inputLabel, { color: colors.foreground }]}>
    Currency
  </Text>
  <View style={styles.inputContainer}>
    <IndianRupee size={16} color={colors.mutedForeground} style={styles.inputIcon} />
    <TextInput
      value={details?.currency || 'INR'}
      onChangeText={(text) => handleInputChange('currency', text)}
      style={[styles.input, styles.inputWithIcon, {
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.foreground,
      }]}
      placeholder="Currency (e.g., INR, USD)"
      placeholderTextColor={colors.mutedForeground}
      editable={!isSaving}
      selectionColor={colors.primary}
      autoCapitalize="characters"
      maxLength={3}
    />
  </View>
</View>


            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSaving}
              style={[styles.saveButton, {
                backgroundColor: colors.primary,
                opacity: isSaving ? 0.7 : 1
              }]}
              activeOpacity={0.8}
            >
              {isSaving && (
                <Loader2 size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
              )}
              <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  colors 
}: { 
  icon: React.ElementType
  title: string
  value: string
  colors: any
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={styles.statHeader}>
        <Icon size={20} color={colors.primary} />
        <Text style={[styles.statTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  formContainer: {
    gap: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  required: {
    color: '#dc2626',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 50,
  },
  inputWithIcon: {
    paddingLeft: 44,
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 17,
    zIndex: 1,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  textAreaIcon: {
    top: 18,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  columnLeft: {
    flex: 1,
  },
  columnRight: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})



// import React, { useEffect, useState, useCallback } from 'react'
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   StyleSheet,
//   Platform,
//   RefreshControl,
// } from 'react-native'
// import { Boxes, Building, Loader2, Store, Phone, Mail, MapPin } from 'lucide-react-native'

// import { useToast } from '../hooks/use-toast'
// import { useColors, useTheme } from '../context/ThemeContext'
// import type { ShopDetails } from '../types'
// import { getShopDetails, updateShopDetails } from '../services/shop-service'
// import { getParts } from '../services/part-service'
// import { getSuppliers } from '../services/supplier-service'

// export default function ShopScreen() {
//   const { toast } = useToast()

//   // Theme hooks
//   const colors = useColors()
//   const { isDark } = useTheme()

//   const [details, setDetails] = useState<ShopDetails | null>(null)
//   const [partCount, setPartCount] = useState(0)
//   const [supplierCount, setSupplierCount] = useState(0)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isRefreshing, setIsRefreshing] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)

//   const fetchData = useCallback(async (showLoading = true) => {
//     if (showLoading) setIsLoading(true)
//     try {
//       const [shopDetails, parts, suppliers] = await Promise.all([
//         getShopDetails(),
//         getParts(),
//         getSuppliers(),
//       ])
//       setDetails(shopDetails)
//       setPartCount(parts.length)
//       setSupplierCount(suppliers.filter((s) => s.status === 'active').length)
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Could not fetch shop data.',
//         variant: 'destructive',
//       })
//     } finally {
//       if (showLoading) setIsLoading(false)
//     }
//   }, [toast])

//   useEffect(() => {
//     fetchData(true)
//   }, [fetchData])

//   // Refresh function
//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true)
//     try {
//       await fetchData(false)
//       toast({ title: 'Refreshed', description: 'Shop data updated successfully.' })
//     } catch (error) {
//       console.error('Error refreshing shop data:', error)
//     } finally {
//       setIsRefreshing(false)
//     }
//   }, [fetchData, toast])

//   const handleInputChange = (field: keyof Omit<ShopDetails, 'id'>, value: string) => {
//     if (details) {
//       setDetails({ ...details, [field]: value })
//     }
//   }

//   const validateForm = () => {
//     if (!details?.name?.trim()) {
//       toast({
//         title: 'Validation Error',
//         description: 'Shop name is required.',
//         variant: 'destructive',
//       })
//       return false
//     }
//     return true
//   }

//   const handleSubmit = async () => {
//     if (!details || !validateForm()) return

//     setIsSaving(true)
//     try {
//       await updateShopDetails(details)
//       toast({
//         title: 'Success',
//         description: 'Shop details updated successfully.',
//       })
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to update shop details.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   if (isLoading) {
//     return (
//       <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
//         <ActivityIndicator size="large" color={colors.primary} />
//         <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
//           Loading shop details...
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
//         {/* Header */}
//         <View style={styles.header}>
//           <Store size={24} color={colors.primary} />
//           <Text style={[styles.title, { color: colors.foreground }]}>Shop Management</Text>
//         </View>

//         {/* Stats Row */}
//         <View style={styles.statsRow}>
//           <StatCard
//             icon={Boxes}
//             title="Total Products"
//             value={partCount.toString()}
//             colors={colors}
//           />
//           <StatCard
//             icon={Building}
//             title="Active Suppliers"
//             value={supplierCount.toString()}
//             colors={colors}
//           />
//         </View>

//         {/* Shop Details Form */}
//         <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
//           <View style={styles.cardHeader}>
//             <Text style={[styles.infoTitle, { color: colors.foreground }]}>
//               Business Information
//             </Text>
//             <Text style={[styles.infoSubtitle, { color: colors.mutedForeground }]}>
//               Manage your shop's public details and contact information.
//             </Text>
//           </View>

//           <View style={styles.formContainer}>
//             {/* Shop Name */}
//             <View style={styles.formGroup}>
//               <Text style={[styles.inputLabel, { color: colors.foreground }]}>
//                 Shop Name <Text style={styles.required}>*</Text>
//               </Text>
//               <View style={styles.inputContainer}>
//                 <Store size={16} color={colors.mutedForeground} style={styles.inputIcon} />
//                 <TextInput
//                   value={details?.name}
//                   onChangeText={(text) => handleInputChange('name', text)}
//                   style={[styles.input, styles.inputWithIcon, {
//                     backgroundColor: colors.background,
//                     borderColor: colors.border,
//                     color: colors.foreground,
//                   }]}
//                   placeholder="Enter your shop name"
//                   placeholderTextColor={colors.mutedForeground}
//                   editable={!isSaving}
//                   selectionColor={colors.primary}
//                 />
//               </View>
//             </View>

//             {/* Phone and Email Row */}
//             <View style={styles.twoColumnRow}>
//               <View style={[styles.columnLeft, styles.formGroup]}>
//                 <Text style={[styles.inputLabel, { color: colors.foreground }]}>
//                   Phone Number
//                 </Text>
//                 <View style={styles.inputContainer}>
//                   <Phone size={16} color={colors.mutedForeground} style={styles.inputIcon} />
//                   <TextInput
//                     value={details?.phone}
//                     keyboardType="phone-pad"
//                     onChangeText={(text) => handleInputChange('phone', text)}
//                     style={[styles.input, styles.inputWithIcon, {
//                       backgroundColor: colors.background,
//                       borderColor: colors.border,
//                       color: colors.foreground,
//                     }]}
//                     placeholder="Phone number"
//                     placeholderTextColor={colors.mutedForeground}
//                     editable={!isSaving}
//                     selectionColor={colors.primary}
//                   />
//                 </View>
//               </View>

//               <View style={[styles.columnRight, styles.formGroup]}>
//                 <Text style={[styles.inputLabel, { color: colors.foreground }]}>
//                   Email Address
//                 </Text>
//                 <View style={styles.inputContainer}>
//                   <Mail size={16} color={colors.mutedForeground} style={styles.inputIcon} />
//                   <TextInput
//                     value={details?.email}
//                     keyboardType="email-address"
//                     autoCapitalize="none"
//                     onChangeText={(text) => handleInputChange('email', text)}
//                     style={[styles.input, styles.inputWithIcon, {
//                       backgroundColor: colors.background,
//                       borderColor: colors.border,
//                       color: colors.foreground,
//                     }]}
//                     placeholder="Email address"
//                     placeholderTextColor={colors.mutedForeground}
//                     editable={!isSaving}
//                     selectionColor={colors.primary}
//                   />
//                 </View>
//               </View>
//             </View>

//             {/* Address */}
//             <View style={styles.formGroup}>
//               <Text style={[styles.inputLabel, { color: colors.foreground }]}>
//                 Business Address
//               </Text>
//               <View style={styles.inputContainer}>
//                 <MapPin size={16} color={colors.mutedForeground} style={[styles.inputIcon, styles.textAreaIcon]} />
//                 <TextInput
//                   multiline
//                   numberOfLines={4}
//                   value={details?.address}
//                   onChangeText={(text) => handleInputChange('address', text)}
//                   style={[styles.input, styles.textArea, styles.inputWithIcon, {
//                     backgroundColor: colors.background,
//                     borderColor: colors.border,
//                     color: colors.foreground,
//                   }]}
//                   placeholder="Enter your complete business address"
//                   placeholderTextColor={colors.mutedForeground}
//                   editable={!isSaving}
//                   selectionColor={colors.primary}
//                   textAlignVertical="top"
//                 />
//               </View>
//             </View>

//             {/* Save Button */}
//             <TouchableOpacity
//               onPress={handleSubmit}
//               disabled={isSaving}
//               style={[styles.saveButton, {
//                 backgroundColor: colors.primary,
//                 opacity: isSaving ? 0.7 : 1
//               }]}
//               activeOpacity={0.8}
//             >
//               {isSaving && (
//                 <Loader2 size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//               )}
//               <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>
//                 {isSaving ? 'Saving Changes...' : 'Save Changes'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   )
// }

// // Stat Card Component
// function StatCard({ 
//   icon: Icon, 
//   title, 
//   value, 
//   colors 
// }: { 
//   icon: React.ElementType
//   title: string
//   value: string
//   colors: any
// }) {
//   return (
//     <View style={[styles.statCard, { backgroundColor: colors.card }]}>
//       <View style={styles.statHeader}>
//         <Icon size={20} color={colors.primary} />
//         <Text style={[styles.statTitle, { color: colors.foreground }]}>{title}</Text>
//       </View>
//       <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginLeft: 12,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     gap: 16,
//     marginBottom: 24,
//   },
//   statCard: {
//     flex: 1,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   statHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   statTitle: {
//     fontWeight: '500',
//     fontSize: 14,
//     marginLeft: 8,
//   },
//   statValue: {
//     fontSize: 28,
//     fontWeight: '700',
//   },
//   infoCard: {
//     borderRadius: 16,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cardHeader: {
//     marginBottom: 24,
//   },
//   infoTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   infoSubtitle: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   formContainer: {
//     gap: 4,
//   },
//   formGroup: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     marginBottom: 8,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   required: {
//     color: '#dc2626',
//   },
//   inputContainer: {
//     position: 'relative',
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 16,
//     minHeight: 50,
//   },
//   inputWithIcon: {
//     paddingLeft: 44,
//   },
//   inputIcon: {
//     position: 'absolute',
//     left: 14,
//     top: 17,
//     zIndex: 1,
//   },
//   textArea: {
//     minHeight: 100,
//     paddingTop: 14,
//   },
//   textAreaIcon: {
//     top: 18,
//   },
//   twoColumnRow: {
//     flexDirection: 'row',
//     gap: 16,
//   },
//   columnLeft: {
//     flex: 1,
//   },
//   columnRight: {
//     flex: 1,
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 12,
//     paddingVertical: 16,
//     marginTop: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   saveButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// })
