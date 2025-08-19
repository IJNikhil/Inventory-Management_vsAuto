// src/screens/ExpenseDetailScreen/components/ExpenseInfo.tsx
import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Truck, User, CalendarDays } from 'lucide-react-native';
import { format } from 'date-fns';

import StatusBadge from './StatusBadge';

interface Props {
  expense: any;
  shopDetails: any;
  colors: any;
}

export default function ExpenseInfo({ expense, shopDetails, colors }: Props) {
  return (
    <View>
      {/* Header Section */}
      <View style={{
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ flex: 1, marginRight: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4, color: colors.mutedForeground }}>
                Purchased By
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 4, color: colors.foreground }}>
                {shopDetails.name}
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 18, color: colors.mutedForeground }}>
                {shopDetails.address}
              </Text>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4, color: colors.mutedForeground }}>
                Supplier
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4, color: colors.foreground }}>
                {expense.supplier.name}
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 18, color: colors.mutedForeground }}>
                {expense.supplier.address}
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 18, color: colors.mutedForeground }}>
                {expense.supplier.phone}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Truck size={24} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: colors.primary }}>
                STOCK EXPENSE
              </Text>
            </View>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4, gap: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>#</Text>
                <Text style={{
                  fontSize: 13,
                  color: colors.foreground,
                  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                }}>
                  {expense.id}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4, gap: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>Date Issued:</Text>
                <Text style={{ fontSize: 13, color: colors.foreground }}>
                  {format(new Date(expense.date), 'PPP')}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>Payment Method:</Text>
                <Text style={{ fontSize: 13, color: colors.foreground }}>
                  {expense.status === 'Paid' ? expense.paymentMethod : 'N/A'}
                </Text>
              </View>
            </View>

            <StatusBadge status={expense.status} colors={colors} />
          </View>
        </View>

        {/* People & Payment Info */}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <User size={16} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.foreground }}>
              Recorded by: <Text style={{ fontWeight: '600', color: colors.primary }}>{expense.createdBy}</Text>
            </Text>
          </View>

          {expense.paidBy && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <User size={16} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground }}>
                Paid by: <Text style={{ fontWeight: '600', color: colors.primary }}>{expense.paidBy}</Text>
              </Text>
            </View>
          )}

          {expense.paymentDate && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <CalendarDays size={16} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground }}>
                Payment Date: <Text style={{ fontWeight: '600', color: colors.primary }}>
                  {format(new Date(expense.paymentDate), 'PPP')}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
