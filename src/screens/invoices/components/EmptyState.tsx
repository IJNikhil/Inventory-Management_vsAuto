import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Inbox, PlusCircle } from 'lucide-react-native'

export default function EmptyState({
  searchTerm,
  onNew,
  colors,
}: {
  searchTerm: string
  onNew: () => void
  colors: any
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
      }}
    >
      <Inbox size={64} color={colors.mutedForeground} />
      <Text
        style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground, marginTop: 16, marginBottom: 8 }}
      >
        {searchTerm ? 'No matching invoices' : 'No invoices found'}
      </Text>
      <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
        {searchTerm ? 'Try adjusting your search terms' : 'Create your first invoice to get started'}
      </Text>

      {!searchTerm && (
        <TouchableOpacity
          onPress={onNew}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 12,
            gap: 8,
            backgroundColor: colors.primary,
          }}
        >
          <PlusCircle size={18} color={colors.primaryForeground} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.primaryForeground }}>Create Invoice</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
