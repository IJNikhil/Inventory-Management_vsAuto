// src/services/base-service.ts
import { databaseManager, executeQuery, executeUpdate } from '../lib/database/connection';
import type { BaseEntity, QueryOptions, SQLTransaction } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseService<T extends BaseEntity> {
  protected abstract tableName: string;
  protected abstract mapFromDb(row: any): T;
  protected abstract mapToDb(entity: Partial<T>): Record<string, any>;

  // Core CRUD operations with optimized performance
  async findById(id: string): Promise<T | null> {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
      const rows = await executeQuery<any>(sql, [id]);
      return rows.length > 0 ? this.mapFromDb(rows[0]) : null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by id:`, error);
      throw error;
    }
  }

  async findAll(options: QueryOptions = {}): Promise<T[]> {
    try {
      let sql = `SELECT * FROM ${this.tableName}`;
      const params: any[] = [];

      // Add WHERE clause
      if (options.where && Object.keys(options.where).length > 0) {
        const conditions = Object.keys(options.where).map(key => `${key} = ?`);
        sql += ` WHERE ${conditions.join(' AND ')}`;
        params.push(...Object.values(options.where));
      }

      // Add ORDER BY clause
      if (options.orderBy) {
        sql += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
      } else {
        sql += ` ORDER BY created_at DESC`;
      }

      // Add LIMIT and OFFSET
      if (options.limit) {
        sql += ` LIMIT ?`;
        params.push(options.limit);
      }
      if (options.offset) {
        sql += ` OFFSET ?`;
        params.push(options.offset);
      }

      const rows = await executeQuery<any>(sql, params);
      return rows.map(row => this.mapFromDb(row));
    } catch (error) {
      console.error(`Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<T> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const entityData = {
        ...data,
        id,
        created_at: now,
        updated_at: now,
        version: 1
      } as T;

      const dbData = this.mapToDb(entityData);
      
      const columns = Object.keys(dbData);
      const placeholders = columns.map(() => '?').join(',');
      const values = Object.values(dbData);

      const sql = `INSERT INTO ${this.tableName} (${columns.join(',')}) VALUES (${placeholders})`;
      
      await executeUpdate(sql, values);
      
      return entityData;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Omit<T, 'id' | 'created_at' | 'version'>>): Promise<T | null> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`${this.tableName} with id ${id} not found`);
      }

      const updatedData = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString(),
        version: existing.version + 1
      };

      const dbData = this.mapToDb(updatedData);
      
      // Remove id from update data
      delete dbData.id;
      delete dbData.created_at;

      const columns = Object.keys(dbData);
      const setClause = columns.map(col => `${col} = ?`).join(',');
      const values = [...Object.values(dbData), id];

      const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
      
      const result = await executeUpdate(sql, values);
      
      if (result.rowsAffected === 0) {
        throw new Error(`Failed to update ${this.tableName} with id ${id}`);
      }

      return await this.findById(id);
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const result = await executeUpdate(sql, [id]);
      return result.rowsAffected > 0;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      return await this.update(id, { status: 'inactive' } as any) !== null;
    } catch (error) {
      console.error(`Error soft deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  async count(where?: Record<string, any>): Promise<number> {
    try {
      let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const params: any[] = [];

      if (where && Object.keys(where).length > 0) {
        const conditions = Object.keys(where).map(key => `${key} = ?`);
        sql += ` WHERE ${conditions.join(' AND ')}`;
        params.push(...Object.values(where));
      }

      const rows = await executeQuery<{ count: number }>(sql, params);
      return rows[0]?.count || 0;
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
  }

  async search(searchTerm: string, searchFields: string[]): Promise<T[]> {
    try {
      const conditions = searchFields.map(field => `${field} LIKE ?`);
      const sql = `SELECT * FROM ${this.tableName} WHERE ${conditions.join(' OR ')} ORDER BY created_at DESC`;
      const params = searchFields.map(() => `%${searchTerm}%`);

      const rows = await executeQuery<any>(sql, params);
      return rows.map(row => this.mapFromDb(row));
    } catch (error) {
      console.error(`Error searching ${this.tableName}:`, error);
      throw error;
    }
  }

  // Batch operations for performance
  async createBatch(items: Array<Omit<T, 'id' | 'created_at' | 'updated_at' | 'version'>>): Promise<T[]> {
    try {
      return await databaseManager.executeTransaction(async (tx: SQLTransaction) => {
        const created: T[] = [];
        
        for (const item of items) {
          const id = uuidv4();
          const now = new Date().toISOString();
          
          const entityData = {
            ...item,
            id,
            created_at: now,
            updated_at: now,
            version: 1
          } as T;

          const dbData = this.mapToDb(entityData);
          
          const columns = Object.keys(dbData);
          const placeholders = columns.map(() => '?').join(',');
          const values = Object.values(dbData);

          const sql = `INSERT INTO ${this.tableName} (${columns.join(',')}) VALUES (${placeholders})`;
          
          await new Promise<void>((resolve, reject) => {
            tx.executeSql(
              sql,
              values,
              () => resolve(),
              (_, error) => {
                reject(error);
                return true;
              }
            );
          });

          created.push(entityData);
        }

        return created;
      });
    } catch (error) {
      console.error(`Error creating batch ${this.tableName}:`, error);
      throw error;
    }
  }

  async updateBatch(updates: Array<{ id: string; data: Partial<T> }>): Promise<void> {
    try {
      await databaseManager.executeTransaction(async (tx: SQLTransaction) => {
        for (const { id, data } of updates) {
          const dbData = this.mapToDb({
            ...data,
            updated_at: new Date().toISOString()
          } as T);

          // Remove id and created_at from update data
          delete dbData.id;
          delete dbData.created_at;

          const columns = Object.keys(dbData);
          const setClause = columns.map(col => `${col} = ?`).join(',');
          const values = [...Object.values(dbData), id];

          const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
          
          await new Promise<void>((resolve, reject) => {
            tx.executeSql(
              sql,
              values,
              () => resolve(),
              (_, error) => {
                reject(error);
                return true;
              }
            );
          });
        }
      });
    } catch (error) {
      console.error(`Error updating batch ${this.tableName}:`, error);
      throw error;
    }
  }

  // Utility methods
  protected validateRequired(data: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        throw new Error(`${field} is required for ${this.tableName}`);
      }
    }
  }

  protected sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  // Advanced querying
  async findByIds(ids: string[]): Promise<T[]> {
    if (ids.length === 0) return [];

    try {
      const placeholders = ids.map(() => '?').join(',');
      const sql = `SELECT * FROM ${this.tableName} WHERE id IN (${placeholders}) ORDER BY created_at DESC`;
      
      const rows = await executeQuery<any>(sql, ids);
      return rows.map(row => this.mapFromDb(row));
    } catch (error) {
      console.error(`Error finding ${this.tableName} by ids:`, error);
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const sql = `SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`;
      const rows = await executeQuery(sql, [id]);
      return rows.length > 0;
    } catch (error) {
      console.error(`Error checking existence of ${this.tableName}:`, error);
      throw error;
    }
  }

  async findFirst(where: Record<string, any>): Promise<T | null> {
    try {
      const conditions = Object.keys(where).map(key => `${key} = ?`);
      const sql = `SELECT * FROM ${this.tableName} WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT 1`;
      const params = Object.values(where);

      const rows = await executeQuery<any>(sql, params);
      return rows.length > 0 ? this.mapFromDb(rows[0]) : null;
    } catch (error) {
      console.error(`Error finding first ${this.tableName}:`, error);
      throw error;
    }
  }
}