import React, { useState } from 'react';
import { View, FlatList, Modal, ActivityIndicator, Text, Dimensions, RefreshControl } from 'react-native';
import { useToast } from '../../hooks/use-toast';
import { useColors, useTheme } from '../../context/ThemeContext';

import InventoryHeader from './components/InventoryHeader';
import InventorySearch from './components/InventorySearch';
import InventoryFilter from './components/InventoryFilter';
import InventoryTableHeader from './components/InventoryTableHeader';
import PartRow from './components/PartRow';
import PartActionModal from './components/PartActionModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

import useInventory from './hooks/useInventory';
import styles from './styles';

const { width: screenWidth } = Dimensions.get('window');

export default function InventoryScreen({ navigation }: any) {
  const colors = useColors();
  const { toast } = useToast();
  const { isDark } = useTheme();

  const {
    parts,
    isLoading,
    isRefreshing,
    onRefresh,
    searchTerm,
    setSearchTerm,
    activeView,
    setActiveView,
    activeStockFilter,
    setActiveStockFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    sortConfig,
    setSortConfig,
    handleDeletePart,
    handleRestorePart,
  } = useInventory(toast);

  const [rowActionModal, setRowActionModal] = useState<{ part: any | null; visible: boolean }>({ part: null, visible: false });
  const [deleteModal, setDeleteModal] = useState<{ part: any | null; visible: boolean }>({ part: null, visible: false });

  const openRowModal = (part: typeof parts[0]) => setRowActionModal({ part, visible: true });
  const closeRowModal = () => setRowActionModal({ part: null, visible: false });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <InventoryHeader navigation={navigation} activeView={activeView} setActiveView={setActiveView} colors={colors} />

      <InventorySearch searchTerm={searchTerm} onSearch={setSearchTerm} colors={colors} />

      {activeView === 'active' && (
        <InventoryFilter
          activeFilter={activeStockFilter}
          onFilterChange={(value: string) =>
            setActiveStockFilter(value as 'all' | 'in-stock' | 'low' | 'out-of-stock')
          }
          colors={colors}
        />
      )}

      {screenWidth > 400 && (
        <InventoryTableHeader
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          setCurrentPage={setCurrentPage}
          colors={colors}
        />
      )}

      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading inventory...</Text>
          </View>
        ) : parts.length === 0 ? (
          <View style={styles.emptyListRoot}>
            <Text style={[styles.emptyListTitle, { color: colors.foreground }]}>No Parts Found</Text>
            <Text style={[styles.emptyListSub, { color: colors.mutedForeground }]}>
              There are no parts that match your current search and filter criteria.
            </Text>
          </View>
        ) : (
          <FlatList
            data={parts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PartRow part={item} colors={colors} onActions={() => openRowModal(item)} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>

      <Modal visible={rowActionModal.visible} transparent animationType="slide" onRequestClose={closeRowModal}>
        <PartActionModal
          part={rowActionModal.part}
          colors={colors}
          onClose={closeRowModal}
          onView={() => {
            if (rowActionModal.part) navigation.navigate('PartDetailScreenId', { id: rowActionModal.part.id });
            closeRowModal();
          }}
          // onEdit={() => {
          //   if (rowActionModal.part) navigation.navigate('EditPartScreen', { id: rowActionModal.part.id });
          //   closeRowModal();
          // }}
          onDelete={() => {
            setDeleteModal({ part: rowActionModal.part, visible: true });
            closeRowModal();
          }}
          onRestore={() => {
            if (rowActionModal.part) handleRestorePart(rowActionModal.part.id);
            closeRowModal();
          }}
        />
      </Modal>

      <Modal visible={deleteModal.visible} transparent animationType="fade" onRequestClose={() => setDeleteModal({ part: null, visible: false })}>
        <DeleteConfirmationModal
          colors={colors}
          itemName={deleteModal.part?.name ?? ''}
          onCancel={() => setDeleteModal({ part: null, visible: false })}
          onConfirm={() => {
            if (deleteModal.part) handleDeletePart(deleteModal.part.id);
            setDeleteModal({ part: null, visible: false });
          }}
        />
      </Modal>
    </View>
  );
}