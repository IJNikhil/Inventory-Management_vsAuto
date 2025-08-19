// import React from 'react';
// import { View, Text, StyleSheet, Dimensions } from 'react-native';
// import { useTheme } from '../../../context/ThemeContext';

// const { width: screenWidth } = Dimensions.get('window');

// interface MetricCardProps {
//   title: string;
//   value: string;
//   change?: string;
//   colors: any;
// }

// export default function MetricCard({ title, value, change, colors }: MetricCardProps) {
//   const { isDark } = useTheme();
//   const styles = createStyles(colors, isDark);
  
//   const isPositive = change && (change.startsWith('+') || !change.startsWith('-'));

//   return (
//     <View style={styles.metricCard}>
//       <Text style={styles.metricTitle}>{title}</Text>
//       <Text style={styles.metricValue}>{value}</Text>
//       {change && (
//         <Text style={[styles.metricChange, isPositive ? styles.metricChangePositive : styles.metricChangeNegative]}>
//           {change}
//         </Text>
//       )}
//     </View>
//   );
// }

// const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
//   metricCard: { 
//     width: (screenWidth - 60) / 2, 
//     backgroundColor: colors.card, 
//     borderRadius: 12, 
//     padding: 20, 
//     marginBottom: 12, 
//     borderWidth: 1, 
//     borderColor: colors.border,
//   },
//   metricTitle: { 
//     fontSize: 14, 
//     color: colors.mutedForeground, 
//     fontWeight: '500', 
//     marginBottom: 8 
//   },
//   metricValue: { 
//     fontSize: 20, 
//     fontWeight: '600', 
//     color: colors.foreground, 
//     marginBottom: 4 
//   },
//   metricChange: { 
//     fontSize: 12, 
//     fontWeight: '500' 
//   },
//   metricChangePositive: { 
//     color: colors.accent 
//   },
//   metricChangeNegative: { 
//     color: colors.destructive 
//   },
// });
