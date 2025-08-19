import React, { useState, useMemo } from 'react';
import {
  View,
  Modal,
  TextInput,
  Text,
  Pressable,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Search } from 'lucide-react-native';

type CommandGroup = {
  heading: string;
  items: { key: string; label: string }[];
};

type CommandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
};

const MAX_HEIGHT = Math.min(360, Dimensions.get('window').height * 0.8);

export function CommandDialog({
  open,
  onOpenChange,
  groups,
}: CommandDialogProps) {
  const [query, setQuery] = useState('');

  const filteredGroups = useMemo(() => {
    if (!query) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((i) =>
          i.label.toLowerCase().includes(query.toLowerCase()),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [query, groups]);

  return (
    <Modal visible={open} animationType="fade" transparent>
      <Pressable
        style={styles.backdrop}
        onPress={() => onOpenChange(false)}
      >
        <Pressable
          onPress={() => {}}
          style={styles.dialog}
        >
          {/* Input wrapper */}
          <View style={styles.inputRow}>
            <Search size={18} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search..."
              placeholderTextColor="#6B7280"
              value={query}
              onChangeText={setQuery}
              autoFocus
              style={styles.input}
            />
          </View>

          {/* List or Empty */}
          <View style={styles.results}>
            {filteredGroups.length === 0 ? (
              <Text style={styles.emptyText}>
                No results found.
              </Text>
            ) : (
              <FlatList
                data={filteredGroups}
                keyExtractor={(group) => group.heading}
                renderItem={({ item: group }) => (
                  <View style={styles.groupBlock}>
                    <Text style={styles.groupHeading}>{group.heading}</Text>
                    {group.items.map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        onPress={() => {
                          console.log(`You selected ${item.label}`);
                          onOpenChange(false);
                        }}
                        style={styles.optionRow}
                        activeOpacity={0.82}
                      >
                        <Text style={styles.optionText}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.50)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dialog: {
    backgroundColor: '#f8fafc', // popover color
    borderRadius: 12,
    width: '100%',
    maxWidth: 380,
    maxHeight: MAX_HEIGHT,
    padding: 0,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#18181b',
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  results: {
    maxHeight: 300,
    backgroundColor: 'transparent',
  },
  emptyText: {
    paddingVertical: 26,
    fontSize: 14,
    textAlign: 'center',
    color: '#64748b',
  },
  groupBlock: {
    padding: 6,
  },
  groupHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  optionRow: {
    paddingHorizontal: 8,
    paddingVertical: 11,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
    color: '#18181b',
  },
});

export default CommandDialog;
