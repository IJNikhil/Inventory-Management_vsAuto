import React from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import {
  Calendar,
  FileText,
  User,
  Wallet,
  CheckCircle,
} from 'lucide-react-native'
import { format, differenceInDays } from 'date-fns'
import type { Invoice } from '../../../types/database'
import MarkAsPaidDialog from './MarkAsPaidDialog'

// Fixed column widths
const COLUMN_WIDTHS = {
  id: 120, // ✅ INCREASED: Make room for INV_0001 format
  status: 100,
  customer: 150,
  date: 120,
  daysAgo: 100,
  amount: 120,
  actions: 160,
}

const totalWidth = Object.values(COLUMN_WIDTHS).reduce((a, b) => a + b, 0)

type InvoiceTableProps = {
  invoices: (Invoice & { displayStatus: Invoice['status'] | 'overdue' })[]
  onUpdateStatus: (
    id: string,
    status: Invoice['status'],
    paymentMethod?: Invoice['payment_method']
  ) => Promise<boolean>
  navigation: any
  colors: any
}

export default function InvoiceTable({
  invoices,
  onUpdateStatus,
  navigation,
  colors,
}: InvoiceTableProps) {
  // Get colors based on database status values
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return {
          bg: colors.primary + '15',
          text: colors.primary,
          border: colors.primary,
        }
      case 'sent':
      case 'draft':
        return {
          bg: colors.accent + '15',
          text: colors.accent,
          border: colors.accent,
        }
      case 'overdue':
        return {
          bg: colors.destructive + '15',
          text: colors.destructive,
          border: colors.destructive,
        }
      default:
        return {
          bg: colors.muted,
          text: colors.mutedForeground,
          border: colors.border,
        }
    }
  }

  // Render table header
  const renderHeader = () => (
    <View
      style={[
        styles.headerRow,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.headerCell, { width: COLUMN_WIDTHS.id }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Invoice #</Text>
      </View>
      <View style={[styles.headerCell, { width: COLUMN_WIDTHS.status }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Status</Text>
      </View>
      <View style={[styles.headerCell, { width: COLUMN_WIDTHS.customer }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Customer</Text>
      </View>
      <View style={[styles.headerCell, { width: COLUMN_WIDTHS.date }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Date</Text>
      </View>
      <View style={[styles.headerCell, { width: COLUMN_WIDTHS.daysAgo }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Days Ago</Text>
      </View>
      <View style={[styles.headerCell, { width: COLUMN_WIDTHS.amount }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Amount</Text>
      </View>
      <View style={[styles.headerCell, { width: COLUMN_WIDTHS.actions }]}>
        <Text style={[styles.headerText, { color: colors.foreground }]}>Actions</Text>
      </View>
    </View>
  )

  // Render each invoice row
  const renderRow = ({ item, index }: { 
    item: Invoice & { displayStatus: Invoice['status'] | 'overdue' }; 
    index: number 
  }) => {
    const statusStyle = getStatusStyle(item.displayStatus)
    const daysSinceInvoice = differenceInDays(new Date(), new Date(item.invoice_date))
    
    return (
      <Row
        invoice={item}
        index={index}
        statusStyle={statusStyle}
        daysSinceInvoice={daysSinceInvoice}
        onUpdateStatus={onUpdateStatus}
        navigation={navigation}
        colors={colors}
      />
    )
  }

  return (
    <View style={[styles.container]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: totalWidth }}>
          {renderHeader()}
          <FlatList
            data={invoices}
            keyExtractor={(item) => item.id}
            renderItem={renderRow}
            scrollEnabled={false} // delegate scroll to parent vertical scroll
          />
        </View>
      </ScrollView>
    </View>
  )
}

function Row({
  invoice,
  index,
  statusStyle,
  daysSinceInvoice,
  onUpdateStatus,
  navigation,
  colors,
}: {
  invoice: Invoice & { displayStatus: Invoice['status'] | 'overdue' }
  index: number
  statusStyle: { bg: string; text: string; border: string }
  daysSinceInvoice: number
  onUpdateStatus: (
    id: string,
    status: Invoice['status'],
    paymentMethod?: Invoice['payment_method']
  ) => Promise<boolean>
  navigation: any
  colors: any
}) {
  const [showPaidModal, setShowPaidModal] = React.useState(false)

  const handleMarkAsPaid = () => setShowPaidModal(true)
  const handleView = () => navigation.navigate('InvoiceDetailScreenId', { id: invoice.id })

  return (
    <>
      <View
        style={[
          styles.row,
          {
            backgroundColor: index % 2 === 0 ? colors.card : colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.cell, { width: COLUMN_WIDTHS.id }]}>
          {/* ✅ CRITICAL FIX: Display invoice_number instead of id */}
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
            {invoice.invoice_number || `#${invoice.id.slice(0, 8)}`}
          </Text>
        </View>
        <View
          style={[
            styles.cell,
            { width: COLUMN_WIDTHS.status, justifyContent: 'center' },
          ]}
        >
          <View
            style={{
              paddingVertical: 4,
              paddingHorizontal: 8,
              backgroundColor: statusStyle.bg,
              borderWidth: 1,
              borderColor: statusStyle.border,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: statusStyle.text, fontWeight: '600', fontSize: 12, textTransform: 'uppercase' }}>
              {invoice.displayStatus === 'paid' ? 'Paid' : 
               invoice.displayStatus === 'sent' ? 'Sent' : 
               invoice.displayStatus === 'draft' ? 'Draft' : 
               invoice.displayStatus === 'overdue' ? 'Overdue' : 
               invoice.displayStatus}
            </Text>
          </View>
        </View>
        <View style={[styles.cell, { width: COLUMN_WIDTHS.customer, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
          <User size={16} color={colors.mutedForeground} />
          <Text numberOfLines={1} style={{ color: colors.foreground, flexShrink: 1 }}>
            {invoice.customer?.name || (invoice as any).customerName || 'Unknown Customer'}
          </Text>
        </View>
        <View style={[styles.cell, { width: COLUMN_WIDTHS.date, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
          <Calendar size={16} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground }}>
            {format(new Date(invoice.invoice_date), 'dd MMM yyyy')}
          </Text>
        </View>
        <View style={[styles.cell, { width: COLUMN_WIDTHS.daysAgo, justifyContent: 'center' }]}>
          <Text style={{ color: colors.mutedForeground }}>
            {daysSinceInvoice > 0 ? `${daysSinceInvoice} d ago` : 'Today'}
          </Text>
        </View>
        <View style={[styles.cell, { width: COLUMN_WIDTHS.amount, justifyContent: 'center' }]}>
          <Text style={{ fontWeight: 'bold', color: colors.foreground }}>
            ₹{invoice.total.toLocaleString('en-IN')}
          </Text>
        </View>
        {/* Actions */}
        <View style={[styles.cell, { width: COLUMN_WIDTHS.actions, flexDirection: 'row', gap: 8, justifyContent: 'center' }]}>
          <TouchableOpacity
            onPress={handleView}
            style={[
              styles.actionBtn,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
          >
            <FileText size={16} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>View</Text>
          </TouchableOpacity>
          {invoice.status !== 'paid' && (
            <TouchableOpacity
              onPress={handleMarkAsPaid}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Wallet size={16} color={colors.primaryForeground} />
              <Text style={[styles.actionText, { color: colors.primaryForeground }]}>Mark Paid</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {showPaidModal && (
        <MarkAsPaidDialog
          open={showPaidModal}
          onClose={() => setShowPaidModal(false)}
          onSave={async (status, pm) => {
            const ok = await onUpdateStatus(invoice.id, status, pm)
            if (ok) setShowPaidModal(false)
          }}
          colors={colors}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 0,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    paddingVertical: 12,
  },
  headerCell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0,
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'flex-start',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
  },
})
