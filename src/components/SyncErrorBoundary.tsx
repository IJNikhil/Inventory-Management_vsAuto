// import React, { ErrorInfo, ReactNode } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { useColors } from '../context/ThemeContext';

// interface Props {
//   children: ReactNode;
// }

// interface State {
//   hasError: boolean;
// }

// export class SyncErrorBoundary extends React.Component<Props, State> {
//   state: State = { hasError: false };

//   static getDerivedStateFromError(): State {
//     return { hasError: true };
//   }

//   componentDidCatch(error: Error, info: ErrorInfo) {
//     console.error('[SyncErrorBoundary] Caught sync error:', error, info);
//   }

//   handleRetry = () => {
//     this.setState({ hasError: false });
//     // Optionally trigger a global sync here
//   };

//   render() {
//     if (this.state.hasError) {
//       const colors = useColors();
//       return (
//         <View style={[styles.container, { backgroundColor: colors.card }]}>
//           <Text style={[styles.title, { color: colors.foreground }]}>
//             Sync Error
//           </Text>
//           <Text style={[styles.message, { color: colors.mutedForeground }]}>
//             An error occurred during synchronization.
//           </Text>
//           <TouchableOpacity
//             onPress={this.handleRetry}
//             style={[styles.button, { backgroundColor: colors.primary }]}
//             activeOpacity={0.7}
//           >
//             <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
//               Retry Sync
//             </Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }
//     return this.props.children;
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 12,
//   },
//   message: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   button: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });
