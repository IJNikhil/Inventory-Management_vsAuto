// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import FeatherIcon from "react-native-vector-icons/Feather";
// import Reanimated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
// } from "react-native-reanimated";

// interface CollapsibleSectionProps {
//   title: string;
//   icon: string;
//   children: React.ReactNode;
//   defaultOpen?: boolean;
//   count?: number;
//   colors: any;
//   isDark: boolean;
// }

// export default function CollapsibleSection({
//   title,
//   icon,
//   children,
//   defaultOpen = false,
//   count,
//   colors,
//   isDark,
// }: CollapsibleSectionProps) {
//   const [isOpen, setIsOpen] = useState(defaultOpen);
//   const styles = createStyles(colors, isDark);
//   const rotation = useSharedValue(defaultOpen ? 180 : 0);
//   const height = useSharedValue(defaultOpen ? 1 : 0);

//   const animatedChevronStyle = useAnimatedStyle(() => ({
//     transform: [{ rotate: `${rotation.value}deg` }],
//   }));

//   const animatedContentStyle = useAnimatedStyle(() => ({
//     opacity: height.value,
//     transform: [{ scaleY: height.value }],
//   }));

//   const toggle = () => {
//     const newOpen = !isOpen;
//     setIsOpen(newOpen);
//     rotation.value = withSpring(newOpen ? 180 : 0);
//     height.value = withTiming(newOpen ? 1 : 0, { duration: 200 });
//   };

//   return (
//     <View style={styles.sectionCard}>
//       <TouchableOpacity style={styles.sectionHeader} onPress={toggle} activeOpacity={0.7}>
//         <View style={styles.sectionHeaderLeft}>
//           <FeatherIcon name={icon} size={18} color={colors.mutedForeground} style={styles.sectionIcon} />
//           <Text style={styles.sectionTitleText}>
//             {title} {count !== undefined && `(${count})`}
//           </Text>
//         </View>
//         <Reanimated.View style={animatedChevronStyle}>
//           <FeatherIcon name="chevron-down" size={18} color={colors.mutedForeground} />
//         </Reanimated.View>
//       </TouchableOpacity>
//       <Reanimated.View style={animatedContentStyle}>
//         {isOpen && <View style={styles.sectionContent}>{children}</View>}
//       </Reanimated.View>
//     </View>
//   );
// }

// const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
//   sectionCard: { 
//     backgroundColor: colors.card, 
//     borderRadius: 12, 
//     marginBottom: 16, 
//     borderWidth: 1, 
//     borderColor: colors.border, 
//     overflow: 'hidden',
//   },
//   sectionHeader: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between', 
//     alignItems: 'center', 
//     padding: 20, 
//     borderBottomWidth: 1, 
//     borderBottomColor: colors.border 
//   },
//   sectionHeaderLeft: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     flex: 1 
//   },
//   sectionIcon: { 
//     marginRight: 12 
//   },
//   sectionTitleText: { 
//     fontSize: 16, 
//     fontWeight: '600', 
//     color: colors.foreground, 
//     flex: 1 
//   },
//   sectionContent: { 
//     padding: 20 
//   },
// });
