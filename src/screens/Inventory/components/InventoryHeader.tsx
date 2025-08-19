import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PlusCircle } from 'lucide-react-native';

export default function InventoryHeader({ navigation, activeView, setActiveView, colors }: any) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingRight: 4, alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground }}>Inventory</Text>
        <TouchableOpacity
          style={[{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            backgroundColor: colors.primary
          }]}
          onPress={() => navigation.navigate('AddStock')}
          activeOpacity={0.8}
        >
          <PlusCircle size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
          <Text style={{ fontWeight: '600', fontSize: 14, color: colors.primaryForeground }}>Add Stock</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginBottom: 20, gap: 8 }}>
        <TouchableOpacity
          onPress={() => { setActiveView('active'); }}
          style={[
            {
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: activeView === 'active' ? colors.primary : colors.card,
              elevation: 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            }
          ]}
          activeOpacity={0.8}
        >
          <Text style={{ fontWeight: '600', fontSize: 14, color: activeView === 'active' ? colors.primaryForeground : colors.mutedForeground }}>
            Active Inventory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setActiveView('deleted'); }}
          style={[
            {
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: activeView === 'deleted' ? colors.primary : colors.card,
              elevation: 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            }
          ]}
          activeOpacity={0.8}
        >
          <Text style={{ fontWeight: '600', fontSize: 14, color: activeView === 'deleted' ? colors.primaryForeground : colors.mutedForeground }}>
            Deleted Items
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
