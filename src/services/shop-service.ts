// src/services/shop-service.ts
import { BaseService } from './base-service';
import { executeUpdate } from '../lib/database/connection';
import type { ShopSettings } from '../types/database';

class ShopSettingsService extends BaseService<ShopSettings> {
  protected tableName = 'shop_settings';
  private static readonly SETTINGS_ID = 'main';

  protected mapFromDb(row: any): ShopSettings {
    return {
      id: row.id || ShopSettingsService.SETTINGS_ID,
      shop_name: row.shop_name || '',
      address: row.address || undefined,
      phone: row.phone || undefined,
      email: row.email || undefined,
      logo: row.logo || undefined,
      tax_number: row.tax_number || undefined,
      currency: row.currency || 'INR',
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: row.version || 1
    };
  }

  protected mapToDb(entity: Partial<ShopSettings>): Record<string, any> {
    return {
      id: entity.id || ShopSettingsService.SETTINGS_ID,
      shop_name: entity.shop_name ? this.sanitizeString(entity.shop_name) : '',
      address: entity.address || null,
      phone: entity.phone || null,
      email: entity.email || null,
      logo: entity.logo || null,
      tax_number: entity.tax_number || null,
      currency: entity.currency || 'INR',
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      version: entity.version
    };
  }

  // ✅ FIXED: Changed from private to protected to avoid base class conflicts
  protected validateShopEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ✅ FIXED: Changed from private to protected and renamed to avoid conflicts
  protected validateShopPhone(phone: string): boolean {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  // ✅ ENHANCED: Better error handling and logging
  async getShopSettings(): Promise<ShopSettings> {
    try {
      console.log('🏪 Getting shop settings...');
      const existing = await this.findById(ShopSettingsService.SETTINGS_ID);
      
      if (existing) {
        console.log('✅ Found existing shop settings:', existing.shop_name);
        return existing;
      }

      console.log('🏪 No shop settings found, creating defaults...');
      // Create default settings if none exist
      const defaultSettings = await this.create({
        shop_name: 'VS Auto',
        address: 'Auto Parts Store',
        currency: 'INR'
      });

      console.log('✅ Created default shop settings:', defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('❌ Error getting shop settings:', error);
      
      // Return fallback settings if database operations fail
      return {
        id: ShopSettingsService.SETTINGS_ID,
        shop_name: 'VS Auto',
        address: 'Auto Parts Store',
        phone: undefined,
        email: undefined,
        logo: undefined,
        tax_number: undefined,
        currency: 'INR',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1
      };
    }
  }

  // ✅ ADDED: Alias method for backward compatibility
  async getOrCreateDefault(): Promise<ShopSettings> {
    return this.getShopSettings();
  }

  async updateShopSettings(
    updates: Partial<Omit<ShopSettings, 'id' | 'created_at' | 'updated_at' | 'version'>>
  ): Promise<ShopSettings> {
    // ✅ FIXED: Use renamed validation methods
    if (updates.email && !this.validateShopEmail(updates.email)) {
      throw new Error('Invalid email format');
    }

    if (updates.phone && !this.validateShopPhone(updates.phone)) {
      throw new Error('Invalid phone format - must be 10 digits');
    }

    // Enhanced validation for shop name
    if (updates.shop_name !== undefined && (!updates.shop_name || updates.shop_name.trim() === '')) {
      throw new Error('Shop name cannot be empty');
    }

    const existing = await this.getShopSettings();
    
    const updatedSettings = await this.update(existing.id, updates);
    
    if (!updatedSettings) {
      throw new Error('Failed to update shop settings');
    }

    console.log('✅ Shop settings updated:', updatedSettings.shop_name);
    return updatedSettings;
  }

  async isShopSetupComplete(): Promise<boolean> {
    const settings = await this.getShopSettings();
    
    return !!(
      settings.shop_name &&
      settings.shop_name.trim() !== '' &&
      settings.shop_name !== 'VS Auto' && // Don't consider default name as complete
      settings.address &&
      settings.phone
    );
  }

  async getShopInfo(): Promise<{
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxNumber?: string;
    currency: string;
  }> {
    const settings = await this.getShopSettings();
    
    return {
      name: settings.shop_name || 'Your Shop',
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      taxNumber: settings.tax_number,
      currency: settings.currency
    };
  }

  async updateLogo(logoPath: string): Promise<ShopSettings> {
    if (!logoPath || logoPath.trim() === '') {
      throw new Error('Logo path cannot be empty');
    }
    return this.updateShopSettings({ logo: logoPath });
  }

  async removeLogo(): Promise<ShopSettings> {
    return this.updateShopSettings({ logo: undefined });
  }

  // Enhanced create method with proper error handling
  async create(data: Omit<ShopSettings, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<ShopSettings> {
    try {
      const now = new Date().toISOString();
      
      const entityData = {
        ...data,
        id: ShopSettingsService.SETTINGS_ID,
        created_at: now,
        updated_at: now,
        version: 1
      } as ShopSettings;

      const dbData = this.mapToDb(entityData);
      
      const columns = Object.keys(dbData);
      const placeholders = columns.map(() => '?').join(',');
      const values = Object.values(dbData);

      const sql = `INSERT OR REPLACE INTO ${this.tableName} (${columns.join(',')}) VALUES (${placeholders})`;
      
      console.log('💾 Creating shop settings with SQL:', sql);
      console.log('📝 Values:', values);
      
      await executeUpdate(sql, values);
      
      console.log('✅ Shop settings created successfully');
      return entityData;
    } catch (error) {
      console.error('❌ Error creating shop settings:', error);
      throw new Error(`Failed to create shop settings: ${error}`);
    }
  }

  // Method to reset to defaults
  async resetToDefaults(): Promise<ShopSettings> {
    console.log('🔄 Resetting shop settings to defaults...');
    return this.create({
      shop_name: 'VS Auto',
      address: 'Auto Parts Store',
      phone: undefined,
      email: undefined,
      logo: undefined,
      tax_number: undefined,
      currency: 'INR'
    });
  }

  // Method to validate all settings
  async validateSettings(): Promise<{ isValid: boolean; errors: string[] }> {
    const settings = await this.getShopSettings();
    const errors: string[] = [];

    if (!settings.shop_name || settings.shop_name.trim() === '') {
      errors.push('Shop name is required');
    }

    // ✅ FIXED: Use renamed validation methods
    if (settings.email && !this.validateShopEmail(settings.email)) {
      errors.push('Invalid email format');
    }

    if (settings.phone && !this.validateShopPhone(settings.phone)) {
      errors.push('Invalid phone format - must be 10 digits');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export settings for backup
  async exportSettings(): Promise<Partial<ShopSettings>> {
    const settings = await this.getShopSettings();
    
    return {
      shop_name: settings.shop_name,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      tax_number: settings.tax_number,
      currency: settings.currency
    };
  }

  // Import settings from backup
  async importSettings(importData: Partial<ShopSettings>): Promise<ShopSettings> {
    console.log('📥 Importing shop settings:', importData);
    
    // ✅ FIXED: Use renamed validation methods
    if (importData.email && !this.validateShopEmail(importData.email)) {
      throw new Error('Invalid email format in import data');
    }

    if (importData.phone && !this.validateShopPhone(importData.phone)) {
      throw new Error('Invalid phone format in import data');
    }

    return this.updateShopSettings(importData);
  }
}

export const shopSettingsService = new ShopSettingsService();

// Export individual methods for backward compatibility
export const {
  getShopSettings,
  getOrCreateDefault,
  updateShopSettings,
  isShopSetupComplete,
  getShopInfo,
  updateLogo,
  removeLogo,
  resetToDefaults,
  validateSettings,
  exportSettings,
  importSettings
} = shopSettingsService;



// import { dbPromise, handleSqlError } from '../lib/localDb';
// import type { ShopDetails } from '../types';

// const SHOP_ID = 'main';

// interface ShopRow {
//   id: string;
//   name: string;
//   address: string;
//   phone: string;
//   email: string;
//   logo: string;
//   lastModified: number;
// }

// interface SQLTransaction {
//   executeSql(
//     sql: string,
//     params?: any[],
//     success?: (tx: SQLTransaction, results: SQLResultSet) => void,
//     error?: (tx: SQLTransaction, err: any) => boolean
//   ): void;
// }

// interface SQLResultSet {
//   rows: { length: number; item(index: number): any };
//   rowsAffected: number;
// }

// class ShopService {
//   private static fromRow(row: ShopRow): ShopDetails {
//     return {
//       id: row.id,
//       name: row.name ?? '',
//       address: row.address ?? '',
//       phone: row.phone ?? '',
//       email: row.email ?? '',
//       logo: row.logo ?? '',
//       lastModified: row.lastModified || Date.now(),
//     };
//   }

//   private static async execSql<T>(sql: string, params: any[] = []): Promise<T[]> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             sql,
//             params,
//             (_: SQLTransaction, results: SQLResultSet) => {
//               const items: T[] = [];
//               for (let i = 0; i < results.rows.length; i++) {
//                 items.push(results.rows.item(i));
//               }
//               resolve(items);
//             },
//             (t: SQLTransaction, err: any) => { handleSqlError(t, err); reject(err); return true; }
//           );
//         },
//         reject
//       );
//     });
//   }

//   private static async saveShop(shop: ShopDetails): Promise<void> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             `INSERT OR REPLACE INTO shop (id, name, address, phone, email, logo, lastModified)
//              VALUES (?, ?, ?, ?, ?, ?, ?)`,
//             [
//               shop.id,
//               shop.name ?? '',
//               shop.address ?? '',
//               shop.phone ?? '',
//               shop.email ?? '',
//               shop.logo ?? '',
//               shop.lastModified,
//             ],
//             () => resolve(),
//             (t: SQLTransaction, error: any) => { handleSqlError(t, error); reject(error); return true; }
//           );
//         },
//         reject
//       );
//     });
//   }

//   static async getShopDetails(): Promise<ShopDetails> {
//     const rows = await this.execSql<ShopRow>('SELECT * FROM shop WHERE id = ?', [SHOP_ID]);
//     if (rows.length > 0) return this.fromRow(rows[0]);
//     const defaultShop: ShopDetails = {
//       id: SHOP_ID,
//       name: '',
//       address: '',
//       phone: '',
//       email: '',
//       logo: '',
//       lastModified: Date.now(),
//     };
//     await this.saveShop(defaultShop);
//     return defaultShop;
//   }

//   static async updateShopDetails(data: Omit<ShopDetails, 'id' | 'lastModified'>): Promise<void> {
//     const current = await this.getShopDetails();
//     const merged: ShopDetails = {
//       ...current,
//       ...data,
//       lastModified: Date.now(),
//     };
//     await this.saveShop(merged);
//   }
// }

// export const { getShopDetails, updateShopDetails } = ShopService;
