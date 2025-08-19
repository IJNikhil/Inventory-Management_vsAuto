import React from 'react'
import { View, TextInput, TouchableOpacity } from 'react-native'
import { Search, X } from 'lucide-react-native'

export default function SearchBar({
  value,
  onChange,
  onClear,
  colors,
}: {
  value: string
  onChange: (val: string) => void
  onClear: () => void
  colors: any
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        height: 44,
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: colors.background,
      }}
    >
      <Search size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
      <TextInput
        placeholder="Search invoices..."
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChange}
        style={{ flex: 1, fontSize: 16, color: colors.foreground }}
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={{ padding: 4 }}>
          <X size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    </View>
  )
}
