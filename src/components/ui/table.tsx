import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewProps,
  TextProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

// Table
export const Table = ({
  children,
  style,
  ...props
}: ViewProps & { style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.table, style]} {...props}>
    {children}
  </View>
);

// TableHeader
export const TableHeader = ({
  children,
  style,
}: ViewProps & { style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.tableHeader, style]}>{children}</View>
);

// TableBody
export const TableBody = ({
  children,
  style,
}: ViewProps & { style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.tableBody, style]}>{children}</View>
);

// TableFooter
export const TableFooter = ({
  children,
  style,
}: ViewProps & { style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.tableFooter, style]}>{children}</View>
);

// TableRow
export const TableRow = ({
  children,
  style,
  selected,
}: ViewProps & { style?: StyleProp<ViewStyle>; selected?: boolean }) => (
  <View
    style={[
      styles.tableRow,
      selected && styles.rowSelected,
      style,
    ]}
  >
    {children}
  </View>
);

// TableHead (header cell)
export const TableHead = ({
  children,
  style,
  textStyle,
}: TextProps & { style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) => (
  <View style={[styles.tableHeadCell, style]}>
    <Text style={[styles.tableHeadText, textStyle]}>{children}</Text>
  </View>
);

// TableCell
export const TableCell = ({
  children,
  style,
  textStyle,
}: TextProps & { style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) => (
  <View style={[styles.tableCell, style]}>
    <Text style={[styles.tableCellText, textStyle]}>{children}</Text>
  </View>
);

// TableCaption
export const TableCaption = ({
  children,
  style,
  textStyle,
}: TextProps & { style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) => (
  <Text style={[styles.tableCaption, textStyle, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  table: {
    width: '100%',
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb', // border
    backgroundColor: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  tableBody: {
    flexDirection: 'column',
  },
  tableFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#f3f4f690', // bg-muted/50
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'transparent',
    minHeight: 45,
    alignItems: 'center',
    // transitionProperty: 'background-color', <-- REMOVE, not supported!
    // transitionDuration: '160ms',
  },
  rowSelected: {
    backgroundColor: '#f3f4f6', // imitate data-[state=selected]:bg-muted
  },
  tableHeadCell: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    flex: 1,
  },
  tableHeadText: {
    fontWeight: '500',
    fontSize: 15,
    color: '#64748b', // text-muted-foreground
  },
  tableCell: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    flex: 1,
  },
  tableCellText: {
    fontSize: 15,
    color: '#18181b', // text-foreground
  },
  tableCaption: {
    marginTop: 14,
    fontSize: 13,
    color: '#64748b',
    textAlign: 'left',
  },
});
