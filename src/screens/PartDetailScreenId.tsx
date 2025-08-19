// import React, { useEffect, useState, useCallback } from 'react'
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   FlatList,
//   Dimensions,
//   StyleSheet,
//   Platform,
//   RefreshControl,
// } from 'react-native'
// import {
//   ArrowLeft,
//   Package,
//   Building,
//   Tag,
//   IndianRupee,
//   Percent,
//   CheckCircle,
//   AlertTriangle,
//   XCircle,
// } from 'lucide-react-native'
// import { useToast } from '../hooks/use-toast'
// import { getPartById } from '../services/part-service'
// import { getSupplierById } from '../services/supplier-service'
// import { useColors, useTheme } from '../context/ThemeContext'
// import type { Part, Supplier } from '../types'

// const SCREEN_WIDTH = Dimensions.get('window').width

// export default function PartDetailScreenId({ route, navigation }: any) {
//   const partId = route?.params?.id as string
//   const { toast } = useToast()

//   // Theme hooks
//   const colors = useColors()
//   const { isDark } = useTheme()

//   const [part, setPart] = useState<Part | null>(null)
//   const [supplier, setSupplier] = useState<Supplier | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isRefreshing, setIsRefreshing] = useState(false)

//   const loadPartData = useCallback(async (showLoading = true) => {
//     if (!partId) return
//     if (showLoading) setIsLoading(true)
    
//     try {
//       const fetchedPart = await getPartById(partId)
//       if (fetchedPart) {
//         setPart(fetchedPart)
//         if (fetchedPart.supplierId) {
//           const partSupplier = await getSupplierById(fetchedPart.supplierId)
//           setSupplier(partSupplier || null)
//         }
//       } else {
//         toast({ title: 'Error', description: 'Part not found', variant: 'destructive' })
//         navigation.navigate('Inventory')
//       }
//     } catch {
//       toast({ title: 'Error', description: 'Failed to fetch part details', variant: 'destructive' })
//     } finally {
//       if (showLoading) setIsLoading(false)
//     }
//   }, [partId, navigation, toast])

//   useEffect(() => {
//     loadPartData(true)
//   }, [loadPartData])

//   // Refresh function
//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true)
//     try {
//       await loadPartData(false)
//       toast({ title: 'Refreshed', description: 'Part data updated successfully.' })
//     } catch (error) {
//       console.error('Error refreshing part:', error)
//     } finally {
//       setIsRefreshing(false)
//     }
//   }, [loadPartData, toast])

//   // Returns stock badge info with theme colors
//   const getStockBadge = () => {
//     if (!part) return null
    
//     if (part.status === 'deleted') {
//       return {
//         text: 'Deleted',
//         icon: XCircle,
//         backgroundColor: colors.muted,
//         borderColor: colors.border,
//         iconColor: colors.mutedForeground,
//         textColor: colors.mutedForeground,
//       }
//     }
//     if (part.quantity === 0) {
//       return {
//         text: 'Out of Stock',
//         icon: XCircle,
//         backgroundColor: colors.destructive + '20',
//         borderColor: colors.destructive,
//         iconColor: colors.destructive,
//         textColor: colors.destructive,
//       }
//     }
//     if (part.isLowStock) {
//       return {
//         text: 'Low Stock',
//         icon: AlertTriangle,
//         backgroundColor: colors.accent + '20',
//         borderColor: colors.accent,
//         iconColor: colors.accent,
//         textColor: colors.accent,
//       }
//     }
//     return {
//       text: 'In Stock',
//       icon: CheckCircle,
//       backgroundColor: colors.primary + '20',
//       borderColor: colors.primary,
//       iconColor: colors.primary,
//       textColor: colors.primary,
//     }
//   }

//   // Loading skeleton
//   if (isLoading) {
//     return (
//       <View style={[styles.container, { backgroundColor: colors.background }]}>
//         <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
//           <Skeleton style={{ height: 40, width: 176 }} colors={colors} />
//         </View>
//         <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
//           <View style={[styles.card, { backgroundColor: colors.card }]}>
//             <View style={[styles.imageSection, { backgroundColor: colors.muted }]}>
//               <Skeleton style={{ width: SCREEN_WIDTH * 0.8, height: SCREEN_WIDTH * 0.8, borderRadius: 16 }} colors={colors} />
//             </View>
//             <View style={styles.contentSection}>
//               <Skeleton style={{ height: 32, width: '75%', marginBottom: 8 }} colors={colors} />
//               <Skeleton style={{ height: 20, width: '50%', marginBottom: 24 }} colors={colors} />
//               <Skeleton style={{ height: 24, width: '33%', marginBottom: 16 }} colors={colors} />
//               {Array(6).fill(0).map((_, i) => (
//                 <Skeleton key={i} style={{ height: 48, width: '100%', marginBottom: 8 }} colors={colors} />
//               ))}
//             </View>
//           </View>
//         </ScrollView>
//       </View>
//     )
//   }

//   // Not found state
//   if (!part) {
//     return (
//       <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
//         <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Part Not Found</Text>
//         <Text style={[styles.notFoundSubtitle, { color: colors.mutedForeground }]}>
//           The requested part could not be found.
//         </Text>
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Inventory')}
//           style={[styles.backPrimaryBtn, { backgroundColor: colors.primary }]}
//           activeOpacity={0.8}
//         >
//           <ArrowLeft size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
//           <Text style={[styles.backPrimaryBtnText, { color: colors.primaryForeground }]}>
//             Back to Inventory
//           </Text>
//         </TouchableOpacity>
//       </View>
//     )
//   }

//   // Main render
//   const stockInfo = getStockBadge()
//   const images = part.images || []

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* Header */}
//       <View style={[styles.header, { 
//         backgroundColor: colors.card,
//         borderBottomColor: colors.border 
//       }]}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={[styles.backBtn, {
//             backgroundColor: colors.background,
//             borderColor: colors.border
//           }]}
//           activeOpacity={0.7}
//         >
//           <ArrowLeft size={18} color={colors.primary} style={{ marginRight: 8 }} />
//           <Text style={[styles.backBtnText, { color: colors.primary }]}>Back to Inventory</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         style={{ flex: 1 }}
//         contentContainerStyle={{ padding: 16 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         <View style={[styles.card, { backgroundColor: colors.card }]}>
//           {/* Image Section */}
//           <View style={[styles.imageSection, { backgroundColor: colors.muted }]}>
//             {images.length > 0 ? (
//               <ImageSwiper images={images} partName={part.name} colors={colors} />
//             ) : (
//               <View style={[styles.noImageContainer, { backgroundColor: colors.muted }]}>
//                 <Package size={60} color={colors.mutedForeground} />
//                 <Text style={[styles.noImageText, { color: colors.mutedForeground }]}>
//                   No Image Available
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Content Section */}
//           <View style={styles.contentSection}>
//             {/* Part Title and Info */}
//             <View style={styles.titleSection}>
//               <Text style={[styles.partTitle, { color: colors.foreground }]}>{part.name}</Text>
//               <View style={styles.partMeta}>
//                 <Badge label={part.partNumber || 'N/A'} colors={colors} />
//                 <Text style={[styles.byLabel, { color: colors.mutedForeground }]}>by</Text>
//                 <Text style={[styles.supplierName, { color: colors.primary }]}>
//                   {supplier?.name || 'N/A'}
//                 </Text>
//               </View>
//             </View>

//             {/* Details Section */}
//             <View style={styles.detailsSection}>
//               <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Details</Text>
//               <View style={styles.detailsGrid}>
//                 <View style={styles.detailColumn}>
//                   <InfoItem 
//                     icon={Building} 
//                     label="Supplier" 
//                     value={supplier?.name || 'N/A'} 
//                     colors={colors}
//                   />
//                 </View>
//                 <View style={styles.detailColumn}>
//                   <InfoItem 
//                     icon={Tag} 
//                     label="Part Number" 
//                     value={part.partNumber} 
//                     colors={colors}
//                   />
//                 </View>
//                 <View style={styles.detailColumn}>
//                   <InfoItem 
//                     icon={IndianRupee} 
//                     label="Purchase Price" 
//                     value={`₹${part.purchasePrice.toFixed(2)}`} 
//                     colors={colors}
//                   />
//                 </View>
//                 <View style={styles.detailColumn}>
//                   <InfoItem 
//                     icon={IndianRupee} 
//                     label="MRP" 
//                     value={`₹${part.mrp.toFixed(2)}`} 
//                     colors={colors}
//                   />
//                 </View>
//                 <View style={styles.detailColumn}>
//                   <InfoItem 
//                     icon={IndianRupee} 
//                     label="Selling Price" 
//                     value={`₹${part.sellingPrice.toFixed(2)}`} 
//                     colors={colors}
//                     isHighlight={true}
//                   />
//                 </View>
//                 <View style={styles.detailColumn}>
//                   <InfoItem 
//                     icon={Percent} 
//                     label="Discount on MRP" 
//                     value={part.mrp > 0
//                       ? `${(((part.mrp - part.sellingPrice) / part.mrp) * 100).toFixed(1)}%`
//                       : `0%`
//                     } 
//                     colors={colors}
//                   />
//                 </View>
//               </View>
//             </View>

//             {/* Stock Status */}
//             {stockInfo && (
//               <View style={[styles.stockBadge, {
//                 backgroundColor: stockInfo.backgroundColor,
//                 borderColor: stockInfo.borderColor,
//               }]}>
//                 <stockInfo.icon size={20} color={stockInfo.iconColor} style={{ marginRight: 8 }} />
//                 <Text style={[styles.stockText, { color: stockInfo.textColor }]}>
//                   {part.quantity} units - {stockInfo.text}
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   )
// }

// // InfoItem Component
// function InfoItem({
//   icon: Icon,
//   label,
//   value,
//   colors,
//   isHighlight = false,
// }: {
//   icon: React.ElementType
//   label: string
//   value: string
//   colors: any
//   isHighlight?: boolean
// }) {
//   return (
//     <View style={styles.infoItem}>
//       <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
//         <Icon size={18} color={colors.mutedForeground} />
//       </View>
//       <View style={styles.infoContent}>
//         <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
//         <Text style={[
//           styles.infoValue, 
//           { color: isHighlight ? colors.primary : colors.foreground },
//           isHighlight && styles.infoValueHighlight
//         ]}>
//           {value}
//         </Text>
//       </View>
//     </View>
//   )
// }

// // Image Swiper Component
// function ImageSwiper({ 
//   images, 
//   partName, 
//   colors 
// }: { 
//   images: string[]
//   partName: string
//   colors: any
// }) {
//   const [currentIndex, setCurrentIndex] = useState(0)
  
//   return (
//     <View style={styles.swiperContainer}>
//       <FlatList
//         data={images}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         snapToAlignment="center"
//         keyExtractor={(_, i) => i.toString()}
//         renderItem={({ item, index: imgIdx }) => (
//           <Image
//             source={{ uri: item }}
//             resizeMode="cover"
//             style={styles.partImage}
//             accessibilityLabel={`${partName} image ${imgIdx + 1}`}
//           />
//         )}
//         onMomentumScrollEnd={ev => {
//           const newIdx = Math.round(ev.nativeEvent.contentOffset.x / (SCREEN_WIDTH * 0.8))
//           setCurrentIndex(newIdx)
//         }}
//       />
//       {images.length > 1 && (
//         <View style={styles.dotsContainer}>
//           {images.map((_, i) => (
//             <View
//               key={i}
//               style={[
//                 styles.dot,
//                 {
//                   backgroundColor: currentIndex === i ? colors.primary : colors.border
//                 }
//               ]}
//             />
//           ))}
//         </View>
//       )}
//     </View>
//   )
// }

// // Badge Component
// function Badge({ label, colors }: { label: string; colors: any }) {
//   return (
//     <View style={[styles.badge, {
//       backgroundColor: colors.muted,
//       borderColor: colors.border,
//     }]}>
//       <Text style={[styles.badgeText, { color: colors.foreground }]}>{label}</Text>
//     </View>
//   )
// }

// // Skeleton Component
// function Skeleton({ style, colors }: { style?: any; colors: any }) {
//   return <View style={[styles.skeletonBase, { backgroundColor: colors.muted }, style]} />
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   backBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 8,
//     borderWidth: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     alignSelf: 'flex-start',
//   },
//   backBtnText: {
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   card: {
//     borderRadius: 12,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 3,
//   },
//   imageSection: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   noImageContainer: {
//     width: SCREEN_WIDTH * 0.8,
//     height: SCREEN_WIDTH * 0.8,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   noImageText: {
//     marginTop: 12,
//     fontSize: 13,
//   },
//   contentSection: {
//     padding: 24,
//   },
//   titleSection: {
//     marginBottom: 24,
//   },
//   partTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   partMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//   },
//   byLabel: {
//     marginLeft: 8,
//     fontSize: 14,
//   },
//   supplierName: {
//     fontWeight: '600',
//     marginLeft: 6,
//     fontSize: 14,
//   },
//   detailsSection: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontWeight: '600',
//     fontSize: 18,
//     marginBottom: 16,
//   },
//   detailsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginHorizontal: -8,
//   },
//   detailColumn: {
//     width: '50%',
//     paddingHorizontal: 8,
//     marginBottom: 16,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   iconContainer: {
//     padding: 8,
//     borderRadius: 20,
//     marginRight: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 2,
//   },
//   infoContent: {
//     flex: 1,
//   },
//   infoLabel: {
//     fontSize: 12,
//     marginBottom: 2,
//   },
//   infoValue: {
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   infoValueHighlight: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   stockBadge: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     borderWidth: 1,
//   },
//   stockText: {
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   badge: {
//     borderWidth: 1,
//     alignSelf: 'flex-start',
//     borderRadius: 16,
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//     marginRight: 8,
//   },
//   badgeText: {
//     fontWeight: '600',
//     fontSize: 12,
//   },
//   swiperContainer: {
//     width: SCREEN_WIDTH * 0.8,
//     height: SCREEN_WIDTH * 0.8,
//   },
//   partImage: {
//     width: SCREEN_WIDTH * 0.8,
//     height: SCREEN_WIDTH * 0.8,
//     borderRadius: 16,
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 12,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 3,
//   },
//   skeletonBase: {
//     borderRadius: 8,
//   },
//   // Not Found Styles
//   notFoundContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//   },
//   notFoundTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   notFoundSubtitle: {
//     marginBottom: 24,
//     textAlign: 'center',
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   backPrimaryBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 12,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//   },
//   backPrimaryBtnText: {
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });
