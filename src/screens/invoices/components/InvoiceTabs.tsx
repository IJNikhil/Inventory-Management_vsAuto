import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import type { TabKey } from '../InvoiceListScreen'

export default function InvoiceTabs({
  tabs,
  activeTab,
  tabCounts,
  onChange,
  colors,
}: {
  tabs: readonly { key: TabKey; label: string; icon: React.ComponentType<any> }[]
  activeTab: TabKey
  tabCounts: Record<string, number>
  onChange: (tab: TabKey) => void
  colors: any
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16 }}>
      {tabs.map((tab) => {
        const IconComp = tab.icon
        const isActive = activeTab === tab.key
        const count = tabCounts[tab.key]

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isActive ? colors.primary : colors.border,
              backgroundColor: isActive ? colors.primary : colors.background,
              paddingVertical: 10,
              paddingHorizontal: 8,
            }}
          >
            <IconComp size={16} color={isActive ? colors.primaryForeground : colors.mutedForeground} />
            <Text
              style={{
                color: isActive ? colors.primaryForeground : colors.foreground,
                fontWeight: '600',
                fontSize: 12,
              }}
            >
              {tab.label}
            </Text>
            {count > 0 && (
              <View
                style={{
                  minWidth: 18,
                  paddingVertical: 2,
                  paddingHorizontal: 6,
                  borderRadius: 10,
                  backgroundColor: isActive ? colors.primaryForeground + '20' : colors.muted,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: isActive ? colors.primaryForeground : colors.mutedForeground,
                    fontSize: 10,
                    fontWeight: '600',
                  }}
                >
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
