import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  Modal, TextInput, StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, User as UserIcon, Mail, Phone as PhoneIcon, MapPin,
  Inbox, Trash2, ArchiveRestore, PlusCircle, Search,
  ChevronDown, Edit, X
} from 'lucide-react-native';

import type { Part, Supplier } from '../types/database'; // ✅ FIXED: Use database types
import { useToast } from '../hooks/use-toast';
import { useColors, useTheme } from '../context/ThemeContext';
import { partService } from '../services/part-service'; // ✅ FIXED: Use service objects
import { supplierService } from '../services/supplier-service'; // ✅ FIXED: Use service objects

// ✅ FIXED: Local-only helper function with database field names
async function getPartsBySupplier(supplierId: string): Promise<Part[]> {
  const allParts = await partService.findAll(); // ✅ FIXED: Use service object
  return allParts.filter(part => part.supplier_id === supplierId && part.status !== 'inactive'); // ✅ FIXED: supplier_id and 'inactive'
}

export default function SupplierDetailScreen({ route, navigation }: any) {
  const supplierId = route.params?.id || route.params?.supplierId || '';
  const { toast } = useToast();

  // Theme hooks
  const colors = useColors();
  const { isDark } = useTheme();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierParts, setSupplierParts] = useState<Part[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addPartOpen, setAddPartOpen] = useState(false);

  // ✅ FIXED: Local-only data loading with service objects
  const loadData = useCallback(async (showLoading = true) => {
    if (!supplierId) return;
    if (showLoading) setIsLoading(true);
    
    try {
      // ✅ FIXED: Use service objects
      const [fetchedSupplier, fetchedParts] = await Promise.all([
        supplierService.findById(supplierId), // ✅ FIXED: Use service object
        getPartsBySupplier(supplierId),
      ]);
      
      setSupplier(fetchedSupplier ?? null);
      setSupplierParts(fetchedParts ?? []);
    } catch (e) {
      console.error('Error loading supplier data:', e);
      toast({ 
        title: 'Error', 
        description: 'Could not fetch supplier data.', 
        variant: 'destructive' 
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [supplierId, toast]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // ✅ SIMPLIFIED: Local-only refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadData(false);
      toast({ 
        title: 'Refreshed', 
        description: 'Supplier data updated successfully.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error refreshing supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh data.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [loadData, toast]);

  // ✅ FIXED: Smart search filtering with database field names
  const filteredParts = useMemo(() => {
    if (!searchTerm.trim()) return supplierParts;
    
    const searchLower = searchTerm.toLowerCase();
    return supplierParts.filter(part =>
      part.name.toLowerCase().includes(searchLower) ||
      part.part_number.toLowerCase().includes(searchLower) // ✅ FIXED: part_number
    );
  }, [supplierParts, searchTerm]);

  // ✅ FIXED: Local-only part addition with database field names
  const handleAddPart = async (
    newPartData: Omit<Part, 'id' | 'status' | 'created_at' | 'updated_at' | 'version'> // ✅ FIXED: Exclude database fields
  ) => {
    try {
      const payload = {
        ...newPartData,
        status: 'active' as const, // ✅ FIXED: Use 'active' status
      };
      
      console.log("Adding part with payload:", payload);
      const newPart = await partService.create(payload); // ✅ FIXED: Use service object
      
      if (newPart) {
        setSupplierParts(prev => [newPart, ...prev]);
        toast({ 
          title: "Part Added", 
          description: `${newPart.name} has been added successfully.`,
          variant: 'default'
        });
        return true;
      } else {
        throw new Error('Failed to create part');
      }
    } catch (error) {
      console.error('Error adding part:', error);
      toast({ 
        title: "Error", 
        description: "Could not add new part.", 
        variant: "destructive" 
      });
      return false;
    }
  };

  // ✅ FIXED: Local-only part update with service object
  const handleUpdatePart = async (partId: string, updatedData: Partial<Omit<Part, "id">>) => {
    try {
      await partService.update(partId, updatedData); // ✅ FIXED: Use service object
      const updatedPart = await partService.findById(partId); // ✅ FIXED: Use service object
      
      if (updatedPart) {
        setSupplierParts(prev => prev.map(p => p.id === updatedPart.id ? updatedPart : p));
        toast({ 
          title: "Success", 
          description: `Part ${updatedPart.name} updated successfully.`,
          variant: 'default'
        });
        return true;
      } else {
        throw new Error('Failed to fetch updated part');
      }
    } catch (error) {
      console.error('Error updating part:', error);
      toast({ 
        title: "Error", 
        description: "Could not update part.", 
        variant: "destructive" 
      });
      return false;
    }
  };

  // ✅ FIXED: Local-only part deletion with service object
  const handleDeletePart = async (partId: string) => {
    try {
      await partService.update(partId, { status: 'inactive' }); // ✅ FIXED: Use service object and 'inactive' status
      const updatedPart = await partService.findById(partId); // ✅ FIXED: Use service object
      
      if (updatedPart) {
        setSupplierParts(prev => prev.map(p => p.id === partId ? updatedPart : p));
        toast({ 
          title: "Part Deleted", 
          description: `Part has been marked as deleted.`, 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Error deleting part:', error);
      toast({ 
        title: "Error", 
        description: `Could not delete part.`, 
        variant: "destructive" 
      });
    }
  };

  // ✅ FIXED: Local-only part restoration with service object
  const handleRestorePart = async (partId: string) => {
    try {
      await partService.update(partId, { status: 'active' }); // ✅ FIXED: Use service object and 'active' status
      const restoredPart = await partService.findById(partId); // ✅ FIXED: Use service object
      
      if (restoredPart) {
        setSupplierParts(prev => prev.map(p => p.id === partId ? restoredPart : p));
        toast({ 
          title: "Part Restored", 
          description: `Part has been restored successfully.`,
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error restoring part:', error);
      toast({ 
        title: "Error", 
        description: `Could not restore part.`, 
        variant: "destructive" 
      });
    }
  };

  // ✅ OPTIMIZED: Loading state with better UX
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <SkeletonBox h={40} w={140} colors={colors} />
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <SkeletonBox h={120} w="100%" colors={colors} style={{ marginBottom: 16 }} />
            <SkeletonBox h={60} w="100%" colors={colors} style={{ marginBottom: 16 }} />
            <SkeletonBox h={200} w="100%" colors={colors} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ OPTIMIZED: Not found state with better navigation
  if (!supplier) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>
            Supplier Not Found
          </Text>
          <Text style={[styles.notFoundSubtitle, { color: colors.mutedForeground }]}>
            The requested supplier could not be found or may have been deleted.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack?.()}
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color={colors.primaryForeground} />
            <Text style={[styles.backButtonText, { color: colors.primaryForeground }]}>
              Back to Suppliers
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border 
        }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack?.()}
            style={[styles.headerBackButton, {
              backgroundColor: colors.background,
              borderColor: colors.border
            }]}
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color={colors.primary} />
            <Text style={[styles.headerBackText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Supplier Info Card */}
          <View style={[styles.supplierCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.supplierName, { color: colors.foreground }]}>
              {supplier.name}
            </Text>
            <View style={styles.supplierInfoGrid}>
              {supplier.contact_person && ( // ✅ FIXED: contact_person
                <InfoItem icon={UserIcon} text={supplier.contact_person} colors={colors} />
              )}
              {supplier.email && (
                <InfoItem icon={Mail} text={supplier.email} colors={colors} />
              )}
              {supplier.phone && (
                <InfoItem icon={PhoneIcon} text={supplier.phone} colors={colors} />
              )}
              {supplier.address && (
                <InfoItem icon={MapPin} text={supplier.address} colors={colors} />
              )}
            </View>
          </View>

          {/* Parts Section */}
          <View style={[styles.partsCard, { backgroundColor: colors.card }]}>
            {/* Parts Header */}
            <View style={styles.partsHeader}>
              <Text style={[styles.partsTitle, { color: colors.foreground }]}>
                Products from this Supplier
              </Text>
              <TouchableOpacity
                onPress={() => setAddPartOpen(true)}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <PlusCircle size={16} color={colors.primaryForeground} />
                <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>
                  Add Product
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.partsSubtitle, { color: colors.mutedForeground }]}>
              Manage all parts supplied by {supplier.name}. You can add, edit, or remove items as needed.
            </Text>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { 
              backgroundColor: colors.background, 
              borderColor: colors.border 
            }]}>
              <Search size={18} color={colors.mutedForeground} style={styles.searchIcon} />
              <TextInput
                placeholder="Search parts by name or part number..."
                placeholderTextColor={colors.mutedForeground}
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={[styles.searchInput, { color: colors.foreground }]}
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')} style={{ padding: 4 }}>
                  <X size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>

            {/* Parts List */}
            {filteredParts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Inbox size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  {searchTerm ? 'No Parts Match Search' : 'No Parts Found'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                  {searchTerm 
                    ? 'Try adjusting your search terms or check spelling.'
                    : 'This supplier does not have any parts associated with them yet. Add some products to get started.'
                  }
                </Text>
                {!searchTerm && (
                  <TouchableOpacity
                    onPress={() => setAddPartOpen(true)}
                    style={[styles.emptyActionButton, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                  >
                    <PlusCircle size={16} color={colors.primaryForeground} />
                    <Text style={[styles.emptyActionText, { color: colors.primaryForeground }]}>
                      Add First Product
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
                  {filteredParts.length} product{filteredParts.length !== 1 ? 's' : ''} found
                  {searchTerm && ` for "${searchTerm}"`}
                </Text>
                <FlatList
                  data={filteredParts}
                  keyExtractor={(p) => p.id}
                  renderItem={({ item }) => (
                    <PartRow
                      part={item}
                      onUpdate={handleUpdatePart}
                      onDelete={handleDeletePart}
                      onRestore={handleRestorePart}
                      colors={colors}
                      supplier={supplier}
                    />
                  )}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </View>
        </ScrollView>

        {/* Add Part Modal */}
        <AddOrEditPartModal
          visible={addPartOpen}
          supplier={supplier}
          onClose={() => setAddPartOpen(false)}
          onSave={async (data: Omit<Part, 'id' | 'status' | 'created_at' | 'updated_at' | 'version'>) => { // ✅ FIXED: Exclude database fields
            const success = await handleAddPart(data);
            if (success) setAddPartOpen(false);
          }}
          colors={colors}
        />
      </View>
    </SafeAreaView>
  );
}

// ✅ OPTIMIZED: InfoItem Component
function InfoItem({ icon: Icon, text, colors }: { icon: any, text: string, colors: any }) {
  return (
    <View style={styles.infoItem}>
      <Icon size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
      <Text style={[styles.infoText, { color: colors.foreground }]} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

// ✅ FIXED: PartRow Component with database field names
function PartRow({
  part,
  onUpdate,
  onDelete,
  onRestore,
  colors,
  supplier,
}: {
  part: Part;
  onUpdate: (id: string, data: Partial<Omit<Part, "id">>) => Promise<boolean>;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  colors: any;
  supplier: Supplier;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const getStockBadge = () => {
    if (part.status === 'inactive') { // ✅ FIXED: 'inactive' instead of 'deleted'
      return { label: "Deleted", color: colors.mutedForeground, bg: colors.muted };
    }
    if (part.quantity === 0) {
      return { label: "Out of Stock", color: colors.destructive, bg: colors.destructive + '20' };
    }
    // ✅ FIXED: Calculate low stock using min_stock_level
    const isLowStock = part.quantity <= (part.min_stock_level || 10);
    if (isLowStock) {
      return { label: "Low Stock", color: colors.accent, bg: colors.accent + '20' };
    }
    return { label: "In Stock", color: colors.primary, bg: colors.primary + '20' };
  };

  const stockBadge = getStockBadge();

  return (
    <>
      <View style={[styles.partRow, {
        backgroundColor: part.status === 'inactive' ? colors.muted : colors.card, // ✅ FIXED: 'inactive'
        borderBottomColor: colors.border,
      }]}>
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.partRowContent}
          activeOpacity={0.7}
        >
          <View style={styles.partInfo}>
            <Text style={[styles.partName, { color: colors.foreground }]} numberOfLines={1}>
              {part.name}
            </Text>
            <Text style={[styles.partNumber, { color: colors.mutedForeground }]} numberOfLines={1}>
              {part.part_number} {/* ✅ FIXED: part_number */}
            </Text>
            <View style={styles.partBadges}>
              <StockBadge 
                label={stockBadge.label} 
                color={stockBadge.color} 
                bg={stockBadge.bg} 
              />
              {part.status === 'active' && (
                <StockBadge 
                  label={`Qty: ${part.quantity}`} 
                  color={colors.foreground} 
                  bg={colors.muted} 
                />
              )}
            </View>
          </View>
          <View style={styles.partPriceContainer}>
            <Text style={[styles.partPrice, { color: colors.foreground }]}>
              ₹{part.selling_price.toLocaleString()} {/* ✅ FIXED: selling_price */}
            </Text>
            <ChevronDown
              size={20}
              color={colors.mutedForeground}
              style={{
                transform: [{ rotate: expanded ? '180deg' : '0deg' }]
              }}
            />
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={[styles.expandedContent, { backgroundColor: colors.muted }]}>
            <View style={styles.priceDetails}>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>
                  Purchase Price
                </Text>
                <Text style={[styles.priceValue, { color: colors.foreground }]}>
                  ₹{(part.purchase_price || 0).toLocaleString()} {/* ✅ FIXED: purchase_price */}
                </Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>
                  MRP
                </Text>
                <Text style={[styles.priceValue, { color: colors.foreground }]}>
                  ₹{(part.mrp || 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>
                  Profit Margin
                </Text>
                <Text style={[styles.priceValue, { 
                  color: (part.selling_price - (part.purchase_price || 0)) > 0 ? colors.primary : colors.destructive // ✅ FIXED: selling_price, purchase_price
                }]}>
                  ₹{((part.selling_price - (part.purchase_price || 0))).toLocaleString()} {/* ✅ FIXED: selling_price, purchase_price */}
                </Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              {part.status === 'active' ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, {
                      backgroundColor: colors.background,
                      borderColor: colors.border
                    }]}
                    onPress={() => setEditOpen(true)}
                    activeOpacity={0.7}
                  >
                    <Edit size={14} color={colors.foreground} />
                    <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, {
                      backgroundColor: colors.destructive + '20',
                      borderColor: colors.destructive
                    }]}
                    onPress={() => setDeleteOpen(true)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={14} color={colors.destructive} />
                    <Text style={[styles.actionButtonText, { color: colors.destructive }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary
                  }]}
                  onPress={() => onRestore(part.id)}
                  activeOpacity={0.7}
                >
                  <ArchiveRestore size={14} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                    Restore
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Edit Modal */}
      <AddOrEditPartModal
        visible={editOpen}
        part={part}
        supplier={supplier}
        onClose={() => setEditOpen(false)}
        onSave={async (data: Partial<Omit<Part, 'id'>>) => {
          const payload = {
            name: data.name ?? part.name,
            part_number: data.part_number ?? part.part_number, // ✅ FIXED: part_number
            quantity: data.quantity ?? part.quantity,
            purchase_price: data.purchase_price ?? part.purchase_price, // ✅ FIXED: purchase_price
            selling_price: data.selling_price ?? part.selling_price, // ✅ FIXED: selling_price
            mrp: data.mrp ?? part.mrp,
            supplier_id: data.supplier_id ?? part.supplier_id, // ✅ FIXED: supplier_id
          };
          const success = await onUpdate(part.id, payload);
          if (success) setEditOpen(false);
        }}
        mode="edit"
        colors={colors}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        visible={deleteOpen}
        itemName={part.name}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(part.id);
          setDeleteOpen(false);
        }}
        colors={colors}
      />
    </>
  );
}

// ✅ OPTIMIZED: StockBadge Component
function StockBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[styles.stockBadge, { backgroundColor: bg }]}>
      <Text style={[styles.stockBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ✅ FIXED: Add/Edit Part Modal with database field names
function AddOrEditPartModal({
  visible,
  supplier,
  part,
  onClose,
  onSave,
  mode = "add",
  colors,
}: {
  visible: boolean;
  supplier?: Supplier;
  part?: Part;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
  mode?: "add" | "edit";
  colors: any;
}) {
  const isEdit = mode === "edit" && part;
  const [name, setName] = useState(part?.name ?? '');
  const [partNumber, setPartNumber] = useState(part?.part_number ?? ''); // ✅ FIXED: part_number
  const [quantity, setQuantity] = useState(part?.quantity?.toString() ?? '0');
  const [purchasePrice, setPurchasePrice] = useState(part?.purchase_price?.toString() ?? ''); // ✅ FIXED: purchase_price
  const [sellingPrice, setSellingPrice] = useState(part?.selling_price?.toString() ?? ''); // ✅ FIXED: selling_price
  const [mrp, setMrp] = useState(part?.mrp?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setName(part?.name ?? '');
      setPartNumber(part?.part_number ?? ''); // ✅ FIXED: part_number
      setQuantity(part?.quantity?.toString() ?? '0');
      setPurchasePrice(part?.purchase_price?.toString() ?? ''); // ✅ FIXED: purchase_price
      setSellingPrice(part?.selling_price?.toString() ?? ''); // ✅ FIXED: selling_price
      setMrp(part?.mrp?.toString() ?? '');
    } else if (supplier) {
      setName(''); setPartNumber(''); setQuantity('0');
      setPurchasePrice(''); setSellingPrice(''); setMrp('');
    }
  }, [visible, isEdit, supplier, part]);

  const { toast } = useToast();

  const submit = async () => {
    if (!name.trim() || !partNumber.trim()) {
      toast({ 
        title: 'Missing fields', 
        description: 'Please fill all required fields.', 
        variant: 'destructive' 
      });
      return;
    }

    const purchasePriceNum = parseFloat(purchasePrice) || 0;
    const sellingPriceNum = parseFloat(sellingPrice) || 0;
    
    if (sellingPriceNum <= purchasePriceNum) {
      toast({
        title: 'Invalid pricing',
        description: 'Selling price must be greater than purchase price.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        part_number: partNumber.trim(), // ✅ FIXED: part_number
        quantity: parseInt(quantity) || 0,
        purchase_price: purchasePriceNum, // ✅ FIXED: purchase_price
        selling_price: sellingPriceNum, // ✅ FIXED: selling_price
        mrp: parseFloat(mrp) || sellingPriceNum,
        supplier_id: supplier?.id ?? part?.supplier_id ?? '', // ✅ FIXED: supplier_id
      };
      await onSave(payload);
    } catch (error) {
      console.error('Error saving part:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {isEdit ? 'Edit Part' : 'Add New Part'}
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.modalCloseButton}
              activeOpacity={0.7}
              disabled={isSaving}
            >
              <X size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Part Name *"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground
              }]}
              autoFocus
              editable={!isSaving}
            />
            <TextInput
              value={partNumber}
              onChangeText={setPartNumber}
              placeholder="Part Number *"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground
              }]}
              editable={!isSaving}
            />
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Quantity"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground
              }]}
              keyboardType="numeric"
              editable={!isSaving}
            />
            <TextInput
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              placeholder="Purchase Price"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground
              }]}
              keyboardType="numeric"
              editable={!isSaving}
            />
            <TextInput
              value={sellingPrice}
              onChangeText={setSellingPrice}
              placeholder="Selling Price"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground
              }]}
              keyboardType="numeric"
              editable={!isSaving}
            />
            <TextInput
              value={mrp}
              onChangeText={setMrp}
              placeholder="MRP (optional)"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground
              }]}
              keyboardType="numeric"
              editable={!isSaving}
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalCancelButton, { backgroundColor: colors.muted }]}
              activeOpacity={0.7}
              disabled={isSaving}
            >
              <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={submit}
              style={[styles.modalSaveButton, { 
                backgroundColor: colors.primary,
                opacity: isSaving ? 0.6 : 1
              }]}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.modalSaveText, { color: colors.primaryForeground }]}>
                  {isEdit ? 'Save Changes' : 'Add Part'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ✅ OPTIMIZED: Delete Confirmation Modal
function DeleteConfirmationModal({
  visible,
  itemName,
  onClose,
  onConfirm,
  colors,
}: {
  visible: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
  colors: any;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.deleteModalCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.deleteModalTitle, { color: colors.foreground }]}>
            Delete Part?
          </Text>
          <Text style={[styles.deleteModalText, { color: colors.mutedForeground }]}>
            This will mark "{itemName}" as deleted. You can restore it later if needed.
          </Text>
          <View style={styles.deleteModalActions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.deleteModalCancelButton, { backgroundColor: colors.muted }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.deleteModalCancelText, { color: colors.foreground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.deleteModalConfirmButton, { backgroundColor: colors.destructive }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.deleteModalConfirmText, { color: colors.destructiveForeground }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ✅ OPTIMIZED: Skeleton Component
function SkeletonBox({ h, w, style, colors }: { h: number; w: number | string; style?: any; colors: any }) {
  return (
    <View style={[{
      width: typeof w === 'number' ? w : undefined,
      height: h,
      backgroundColor: colors.muted,
      borderRadius: 8,
      alignSelf: typeof w === 'string' && w === '100%' ? 'stretch' : undefined,
    }, style]} />
  );
}














// ✅ COMPLETE: StyleSheet with all required styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  headerBackText: {
    fontSize: 16,
    fontWeight: '500',
  },
  supplierCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  supplierName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  supplierInfoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  partsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  partsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partsTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  partsSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  resultsCount: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  partRow: {
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  partRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  partNumber: {
    fontSize: 14,
    marginBottom: 8,
  },
  partBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  partPriceContainer: {
    alignItems: 'flex-end',
  },
  partPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expandedContent: {
    padding: 16,
    marginTop: -1,
  },
  priceDetails: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  notFoundSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalForm: {
    maxHeight: 400,
    marginBottom: 24,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalCard: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 16,
    padding: 24,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  deleteModalText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteModalConfirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteModalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
