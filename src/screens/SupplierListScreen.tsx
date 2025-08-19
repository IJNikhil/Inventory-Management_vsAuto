import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  PlusCircle,
  Search,
  Trash2,
  Building2,
  User as UserIcon,
  Phone as PhoneIcon,
  Mail,
  ArchiveRestore,
  Edit,
  X,
  Inbox,
} from 'lucide-react-native';

import type { Supplier } from '../types/database';
import { useToast } from '../hooks/use-toast';
import { useColors, useTheme } from '../context/ThemeContext';
import { supplierService } from '../services/supplier-service';

// ✅ ADDED: Phone formatting helpers
const formatPhoneInput = (phone: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limitedDigits = digitsOnly.slice(0, 10);
  
  // Format as XXX-XXX-XXXX for display
  if (limitedDigits.length >= 6) {
    return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  } else if (limitedDigits.length >= 3) {
    return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
  }
  return limitedDigits;
};

// ✅ ADDED: Phone display formatting helper
const formatPhoneDisplay = (phone: string): string => {
  if (!phone) return 'N/A';
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  return phone;
};

// ✅ ADDED: Phone validation helper
const validatePhone = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return true; // Optional field
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10;
};

// ✅ FIXED: Helper functions using service object
async function deactivateSupplier(supplierId: string): Promise<void> {
  await supplierService.update(supplierId, { status: 'inactive' });
}

async function restoreSupplier(supplierId: string): Promise<void> {
  await supplierService.update(supplierId, { status: 'active' });
}

// ----------- Main Supplier Management Screen -----------
export default function SupplierListScreen({ navigation }: any) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'active' | 'inactive'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
  const { toast } = useToast();

  // Theme hooks
  const colors = useColors();
  const { isDark } = useTheme();

  const loadSuppliers = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const fetched = await supplierService.findAll();
      setSuppliers(fetched);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      toast({ title: "Error", description: "Failed to load suppliers.", variant: "destructive" });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSuppliers(true);
  }, [loadSuppliers]);

  // Refresh function
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadSuppliers(false);
      toast({ title: 'Refreshed', description: 'Suppliers data updated successfully.' });
    } catch (error) {
      console.error('Error refreshing suppliers:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadSuppliers, toast]);

  // ✅ FIXED: Updated filtering with database field names
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.status === activeView &&
      (supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ✅ FIXED: Remove lastModified and use service object
const handleAddSupplier = async (newSupplierData: {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}) => {
  try {
    // Add status and let service handle the rest
    const supplierWithStatus = {
      ...newSupplierData,
      status: 'active' as const
    };
    
    const newSupplier = await supplierService.create(supplierWithStatus);
    
    if (newSupplier) {
      setSuppliers(prev => [newSupplier, ...prev]);
      toast({ title: "Supplier Added", description: `${newSupplier.name} has been added.` });
      return true;
    } else {
      throw new Error('Failed to create supplier');
    }
  } catch (err) {
    console.error('Error adding supplier:', err);
    toast({ title: "Error", description: `Failed to add supplier: ${(err as any).message || err}`, variant: "destructive" });
    return false;
  }
};

  const handleUpdateSupplier = async (supplierId: string, updatedData: Partial<Omit<Supplier, 'id'>>) => {
    try {
      await supplierService.update(supplierId, updatedData);
      const updatedSupplier = await supplierService.findById(supplierId);
      
      if (updatedSupplier) {
        setSuppliers(prev =>
          prev.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
        );
        toast({ title: "Supplier Updated", description: `Details for ${updatedSupplier.name} have been updated.` });
        return true;
      } else {
        throw new Error('Failed to fetch updated supplier');
      }
    } catch (err) {
      console.error('Error updating supplier:', err);
      toast({ title: "Error", description: `Failed to update supplier: ${(err as any).message || err}`, variant: "destructive" });
      return false;
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      await deactivateSupplier(supplierId);
      const updatedSupplier = await supplierService.findById(supplierId);
      
      if (updatedSupplier) {
        setSuppliers(prev => prev.map(s => s.id === supplierId ? updatedSupplier : s));
        toast({ title: "Supplier Deactivated", description: `Supplier has been moved to inactive list.`, variant: "destructive" });
      }
    } catch (err) {
      console.error('Error deactivating supplier:', err);
      toast({ title: "Error", description: "Failed to deactivate supplier.", variant: "destructive" });
    }
  };

  const handleRestoreSupplier = async (supplierId: string) => {
    try {
      await restoreSupplier(supplierId);
      const restoredSupplier = await supplierService.findById(supplierId);
      
      if (restoredSupplier) {
        setSuppliers(prev => prev.map(s => s.id === supplierId ? restoredSupplier : s));
        toast({ title: "Supplier Restored", description: `Supplier has been restored to the active list.` });
      }
    } catch (err) {
      console.error('Error restoring supplier:', err);
      toast({ title: "Error", description: "Failed to restore supplier.", variant: "destructive" });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.card,
        borderBottomColor: colors.border 
      }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Supplier List</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => { setEditingSupplier(undefined); setModalOpen(true); }}
          activeOpacity={0.8}
        >
          <PlusCircle size={18} color={colors.primaryForeground} />
          <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>Add Supplier</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchSection, { backgroundColor: colors.background }]}>
        <View style={[styles.searchContainer, { 
          backgroundColor: colors.card, 
          borderColor: colors.border 
        }]}>
          <Search size={18} color={colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            placeholder="Search suppliers..."
            placeholderTextColor={colors.mutedForeground}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={[styles.searchInput, { color: colors.foreground }]}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsSection}>
        <View style={[styles.tabsContainer, { backgroundColor: colors.muted }]}>
          <TabButton
            label="Active Suppliers"
            active={activeView === 'active'}
            onPress={() => setActiveView('active')}
            colors={colors}
          />
          <TabButton
            label="Inactive Suppliers"
            active={activeView === 'inactive'}
            onPress={() => setActiveView('inactive')}
            colors={colors}
          />
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Loading suppliers...
            </Text>
          </View>
        ) : filteredSuppliers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Inbox size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Suppliers Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              {activeView === 'active' 
                ? "No active suppliers match your search criteria."
                : "No inactive suppliers found."
              }
            </Text>
          </View>
        ) : (
          // Mobile Card Layout Only
          <FlatList
            data={filteredSuppliers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SupplierCard
                supplier={item}
                onDelete={handleDeleteSupplier}
                onRestore={handleRestoreSupplier}
                onEditPressed={() => { setEditingSupplier(item); setModalOpen(true); }}
                onViewPressed={() => navigation.navigate('SupplierDetail', { supplierId: item.id })}
                colors={colors}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
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

      {/* Add/Edit Supplier Modal */}
      <SupplierEditModal
  visible={modalOpen}
  supplier={editingSupplier}
  onClose={() => setModalOpen(false)}
  onSave={async (data: {
    name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => {
    let ok = false;
    if (editingSupplier)
      ok = await handleUpdateSupplier(editingSupplier.id, data);
    else ok = await handleAddSupplier(data);
    if (ok) setModalOpen(false);
  }}
  colors={colors}
/>
    </View>
  );
}

// ----------- Tab Button -------------
function TabButton({ 
  label, 
  active, 
  onPress,
  colors 
}: { 
  label: string
  active: boolean
  onPress: () => void
  colors: any
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        {
          backgroundColor: active ? colors.primary : colors.muted,
        }
      ]}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.tabButtonText,
        { color: active ? colors.primaryForeground : colors.foreground }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ✅ ENHANCED: Mobile Supplier Card with database field names and phone formatting
function SupplierCard({
  supplier,
  onDelete,
  onRestore,
  onEditPressed,
  onViewPressed,
  colors,
}: {
  supplier: Supplier;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onEditPressed: () => void;
  onViewPressed: () => void;
  colors: any;
}) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <>
      <TouchableOpacity 
        style={[styles.card, { 
          backgroundColor: supplier.status === 'inactive' ? colors.muted : colors.card,
          borderColor: colors.border 
        }]}
        onPress={onViewPressed}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardCompany}>
            <View style={[styles.cardIcon, { backgroundColor: colors.muted }]}>
              <Building2 size={20} color={colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardCompanyName, { color: colors.foreground }]} numberOfLines={1}>
                {supplier.name}
              </Text>
              <Text style={[styles.cardCompanySubtext, { color: colors.mutedForeground }]} numberOfLines={1}>
                {supplier.contact_person || 'No contact person'}
              </Text>
            </View>
          </View>
          {supplier.status === 'inactive' && (
            <TouchableOpacity
              onPress={() => onRestore(supplier.id)}
              style={[styles.restoreButton, { backgroundColor: colors.primary + '20' }]}
              activeOpacity={0.7}
            >
              <ArchiveRestore size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Details */}
        <View style={styles.cardDetails}>
          <View style={styles.cardDetailRow}>
            <UserIcon size={14} color={colors.mutedForeground} />
            <Text style={[styles.cardDetailText, { color: colors.foreground }]} numberOfLines={1}>
              {supplier.contact_person || 'N/A'}
            </Text>
          </View>
          <View style={styles.cardDetailRow}>
            <PhoneIcon size={14} color={colors.mutedForeground} />
            <Text style={[styles.cardDetailText, { color: colors.foreground }]} numberOfLines={1}>
              {formatPhoneDisplay(supplier.phone || '')}
            </Text>
          </View>
          <View style={styles.cardDetailRow}>
            <Mail size={14} color={colors.mutedForeground} />
            <Text style={[styles.cardDetailText, { color: colors.foreground }]} numberOfLines={1}>
              {supplier.email || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {supplier.status === 'active' && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.cardActionButton, { 
                backgroundColor: colors.background,
                borderColor: colors.border 
              }]}
              onPress={(e) => {
                e.stopPropagation();
                onEditPressed();
              }}
              activeOpacity={0.7}
            >
              <Edit size={14} color={colors.foreground} />
              <Text style={[styles.cardActionText, { color: colors.foreground }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardActionButton, { 
                backgroundColor: colors.destructive + '20',
                borderColor: colors.destructive 
              }]}
              onPress={(e) => {
                e.stopPropagation();
                setDeleteModalOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Trash2 size={14} color={colors.destructive} />
              <Text style={[styles.cardActionText, { color: colors.destructive }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalOpen}
        itemName={supplier.name}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(supplier.id);
          setDeleteModalOpen(false);
        }}
        colors={colors}
      />
    </>
  );
}

// ✅ ENHANCED: Add/Edit Modal with validation and phone formatting
function SupplierEditModal({
  visible,
  supplier,
  onClose,
  onSave,
  colors,
}: {
  visible: boolean;
  supplier?: Supplier;
  onClose: () => void;
  onSave: (data: Omit<Supplier, 'id' | 'status' | 'created_at' | 'updated_at' | 'version'>) => Promise<void> | void;
  colors: any;
}) {
  const [name, setName] = useState(supplier?.name ?? '');
  const [contactPerson, setContactPerson] = useState(supplier?.contact_person ?? '');
  const [email, setEmail] = useState(supplier?.email ?? '');
  const [phone, setPhone] = useState(supplier?.phone ?? '');
  const [address, setAddress] = useState(supplier?.address ?? '');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setName(supplier?.name ?? '');
    setContactPerson(supplier?.contact_person ?? '');
    setEmail(supplier?.email ?? '');
    // ✅ FIXED: Format phone for display
    setPhone(supplier?.phone ? formatPhoneInput(supplier.phone) : '');
    setAddress(supplier?.address ?? '');
    setPhoneError('');
    setEmailError('');
  }, [supplier, visible]);

  // ✅ ADDED: Phone change handler with validation
  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneInput(text);
    setPhone(formatted);
    
    // Validate phone
    if (text && !validatePhone(text)) {
      setPhoneError('Phone must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  // ✅ ADDED: Email change handler with validation
  const handleEmailChange = (text: string) => {
    setEmail(text);
    
    // Simple email validation
    if (text && text.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const submit = () => {
    // Validate required fields
    if (!name.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill the supplier name.', variant: 'destructive' });
      return;
    }

    // Check for validation errors
    if (phoneError || emailError) {
      toast({ title: 'Validation Error', description: 'Please fix the errors before saving.', variant: 'destructive' });
      return;
    }

    // Submit with raw phone digits only
    const phoneDigits = phone.replace(/\D/g, '');
    
    onSave({ 
      name: name.trim(), 
      contact_person: contactPerson.trim() || undefined,
      email: email.trim() || undefined, 
      phone: phoneDigits || undefined,
      address: address.trim() || undefined
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {supplier ? 'Edit Supplier' : 'Add Supplier'}
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.modalCloseButton}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalForm}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Supplier Name *"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground
              }]}
              autoFocus
            />
            
            <TextInput
              value={contactPerson}
              onChangeText={setContactPerson}
              placeholder="Contact Person"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground
              }]}
            />
            
            {/* ✅ ENHANCED: Phone input with validation */}
            <View>
              <TextInput
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="Phone (10 digits)"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.modalInput, {
                  backgroundColor: colors.background,
                  borderColor: phoneError ? colors.destructive : colors.border,
                  color: colors.foreground
                }]}
                keyboardType="numeric"
                maxLength={12} // XXX-XXX-XXXX format
              />
              {phoneError ? (
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {phoneError}
                </Text>
              ) : null}
            </View>
            
            {/* ✅ ENHANCED: Email input with validation */}
            <View>
              <TextInput
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Email"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.modalInput, {
                  backgroundColor: colors.background,
                  borderColor: emailError ? colors.destructive : colors.border,
                  color: colors.foreground
                }]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? (
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {emailError}
                </Text>
              ) : null}
            </View>
            
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Address"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalTextArea, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground
              }]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalCancelButton, { backgroundColor: colors.muted }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={submit}
              style={[styles.modalSaveButton, { 
                backgroundColor: phoneError || emailError ? colors.muted : colors.primary 
              }]}
              activeOpacity={0.8}
              disabled={phoneError !== '' || emailError !== ''}
            >
              <Text style={[styles.modalSaveText, { 
                color: phoneError || emailError ? colors.mutedForeground : colors.primaryForeground 
              }]}>
                {supplier ? 'Update' : 'Add'} Supplier
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// --------------- Delete Confirmation Modal -----------
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
            Are you absolutely sure?
          </Text>
          <Text style={[styles.deleteModalText, { color: colors.destructive }]}>
            This action will mark the supplier "{itemName}" as inactive. They will not be available for new stock purchases but their records will be kept.
          </Text>
          <View style={styles.deleteModalActions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.deleteModalCancelButton, { backgroundColor: colors.muted }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.deleteModalCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.deleteModalConfirmButton, { backgroundColor: colors.destructive }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.deleteModalConfirmText, { color: colors.destructiveForeground }]}>
                Deactivate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ✅ COMPLETE: Styles with all enhancements
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchIcon: {
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  tabsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  cardList: {
    paddingBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCompanyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardCompanySubtext: {
    fontSize: 14,
  },
  restoreButton: {
    padding: 8,
    borderRadius: 20,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 16,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDetailText: {
    fontSize: 14,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  cardActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalForm: {
    paddingHorizontal: 20,
    gap: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 24,
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
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  deleteModalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteModalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


























// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 8,
//     gap: 8,
//   },
//   addButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   searchSection: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   searchIcon: {
//     marginRight: 12,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 0,
//   },
//   tabsSection: {
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     borderRadius: 8,
//     padding: 4,
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   tabButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 16,
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   cardList: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   card: {
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   cardCompany: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   cardIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   cardCompanyName: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   cardCompanySubtext: {
//     fontSize: 14,
//   },
//   restoreButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cardDetails: {
//     gap: 8,
//     marginBottom: 16,
//   },
//   cardDetailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   cardDetailText: {
//     fontSize: 14,
//     flex: 1,
//   },
//   cardActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   cardActionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     borderWidth: 1,
//     gap: 6,
//   },
//   cardActionText: {
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalCard: {
//     width: '90%',
//     maxWidth: 400,
//     borderRadius: 16,
//     padding: 24,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   modalForm: {
//     gap: 16,
//     marginBottom: 24,
//   },
//   modalInput: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     fontSize: 16,
//   },
//   modalTextArea: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     fontSize: 16,
//     minHeight: 80,
//   },
//   modalActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   modalCancelButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   modalCancelText: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   modalSaveButton: {
//     flex: 2,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   modalSaveText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   deleteModalCard: {
//     width: '85%',
//     maxWidth: 350,
//     borderRadius: 16,
//     padding: 24,
//   },
//   deleteModalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   deleteModalText: {
//     fontSize: 14,
//     lineHeight: 20,
//     marginBottom: 24,
//   },
//   deleteModalActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   deleteModalCancelButton: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   deleteModalCancelText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   deleteModalConfirmButton: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   deleteModalConfirmText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });
