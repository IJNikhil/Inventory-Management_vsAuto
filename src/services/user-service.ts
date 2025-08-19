// src/services/user-service.ts
import { BaseService } from './base-service';
import { executeQuery } from '../lib/database/connection';
import type { User } from '../types/database';

class UserService extends BaseService<User> {
  protected tableName = 'users';

  protected mapFromDb(row: any): User {
    return {
      id: row.id,
      name: row.name || '',
      email: row.email || undefined,
      phone: row.phone || undefined,
      role: row.role || 'staff',
      avatar: row.avatar || undefined,
      status: row.status || 'active',
      last_login: row.last_login || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: row.version || 1
    };
  }

  protected mapToDb(entity: Partial<User>): Record<string, any> {
    return {
      id: entity.id,
      name: entity.name ? this.sanitizeString(entity.name) : '',
      email: entity.email || null,
      phone: entity.phone || null,
      role: entity.role || 'staff',
      avatar: entity.avatar || null,
      status: entity.status || 'active',
      last_login: entity.last_login || null,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      version: entity.version
    };
  }

  async create(data: Omit<User, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<User> {
    this.validateRequired(data, ['name']);
    
    if (data.email && !this.validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    if (data.phone && !this.validatePhone(data.phone)) {
      throw new Error('Invalid phone format');
    }

    // Check for duplicate email
    if (data.email) {
      const existing = await this.findByEmail(data.email);
      if (existing) {
        throw new Error('Email already exists');
      }
    }

    return super.create(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findFirst({ email: email.trim().toLowerCase() });
  }

  async findByRole(role: User['role']): Promise<User[]> {
    return this.findAll({
      where: { role, status: 'active' },
      orderBy: 'name'
    });
  }

  async getActiveUsers(): Promise<User[]> {
    return this.findAll({
      where: { status: 'active' },
      orderBy: 'name'
    });
  }

  async updateLastLogin(userId: string): Promise<User | null> {
    return this.update(userId, {
      last_login: new Date().toISOString()
    });
  }

  async getCurrentUser(): Promise<User | null> {
    // For single-user local app, get the first active admin/manager user
    const adminUsers = await this.findAll({
      where: { status: 'active' },
      orderBy: 'created_at',
      limit: 1
    });

    if (adminUsers.length > 0) {
      return adminUsers[0];
    }

    // Create default user if none exists
    return this.createDefaultUser();
  }

  private async createDefaultUser(): Promise<User> {
    return this.create({
      name: 'Shop Owner',
      role: 'admin',
      status: 'active'
    });
  }

  async updateProfile(userId: string, updates: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  }): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate email if provided
    if (updates.email && !this.validateEmail(updates.email)) {
      throw new Error('Invalid email format');
    }

    // Check for duplicate email
    if (updates.email && updates.email !== user.email) {
      const existing = await this.findByEmail(updates.email);
      if (existing && existing.id !== userId) {
        throw new Error('Email already exists');
      }
    }

    // Validate phone if provided
    if (updates.phone && !this.validatePhone(updates.phone)) {
      throw new Error('Invalid phone format');
    }

    return this.update(userId, updates);
  }

  async isProfileComplete(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) {
      return false;
    }

    return !!(
      user.name && 
      user.name !== 'Shop Owner' && 
      user.email
    );
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Array<{ role: string; count: number }>;
  }> {
    const [total, active, roleStats] = await Promise.all([
      this.count(),
      this.count({ status: 'active' }),
      executeQuery<{ role: string; count: number }>(
        'SELECT role, COUNT(*) as count FROM users WHERE status = ? GROUP BY role ORDER BY count DESC',
        ['active']
      )
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byRole: roleStats
    };
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    return this.search(searchTerm, ['name', 'email', 'phone']);
  }

  async changeUserRole(userId: string, newRole: User['role']): Promise<User | null> {
    return this.update(userId, { role: newRole });
  }

  async deactivateUser(userId: string): Promise<User | null> {
    return this.update(userId, { status: 'inactive' });
  }

  async activateUser(userId: string): Promise<User | null> {
    return this.update(userId, { status: 'active' });
  }
}

export const userService = new UserService();

// Export individual methods for backward compatibility
export const {
  create: createUser,
  update: updateUser,
  delete: deleteUser,
  findById: getUserById,
  findAll: getUsers,
  findByEmail,
  findByRole,
  getActiveUsers,
  updateLastLogin,
  getCurrentUser,
  updateProfile,
  isProfileComplete,
  getUserStats,
  searchUsers,
  changeUserRole,
  deactivateUser,
  activateUser
} = userService;


// // src/services/user-service.ts
// import { dbPromise, handleSqlError } from '../lib/localDb';
// import uuid from 'react-native-uuid';

// interface User {
//   id: string;
//   name: string;
//   email?: string;
//   avatar?: string | null;
//   role: 'Admin';
//   status: 'active';
//   createdAt: string;
//   updatedAt: string;
//   lastModified: number;
// }

// interface SQLTransaction {
//   executeSql(
//     sql: string,
//     params?: any[],
//     success?: (tx: SQLTransaction, results: any) => void,
//     error?: (tx: SQLTransaction, err: any) => boolean
//   ): void;
// }

// class BasicUserService {
//   static async getCurrentUser(): Promise<User | null> {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'SELECT * FROM users LIMIT 1',
//             [],
//             (tx2: SQLTransaction, results: any) => {
//               if (results.rows.length > 0) {
//                 const row = results.rows.item(0);
//                 resolve({
//                   id: row.id,
//                   name: row.name || 'Shop Owner',
//                   email: row.email || '',
//                   role: 'Admin',
//                   avatar: row.avatar,
//                   status: 'active',
//                   createdAt: row.createdAt,
//                   updatedAt: row.updatedAt,
//                   lastModified: row.lastModified,
//                 });
//               } else {
//                 this.createDefaultUser().then(resolve).catch(reject);
//               }
//             },
//             (tx: SQLTransaction, err: any) => { handleSqlError(tx, err); reject(err); return true; }
//           );
//         },
//         reject
//       );
//     });
//   }

//   private static async createDefaultUser(): Promise<User> {
//     const db = await dbPromise;
//     const user: User = {
//       id: uuid.v4() as string,
//       name: 'Shop Owner',
//       email: '',
//       role: 'Admin',
//       avatar: null,
//       status: 'active',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       lastModified: Date.now(),
//     };
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             'INSERT INTO users (id, name, email, role, avatar, status, createdAt, updatedAt, lastModified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//             [user.id, user.name, user.email, user.role, user.avatar, user.status, user.createdAt, user.updatedAt, user.lastModified],
//             () => resolve(user),
//             (tx: SQLTransaction, error: any) => { handleSqlError(tx, error); reject(error); return true; }
//           );
//         },
//         reject
//       );
//     });
//   }

//   static async updateProfile(updates: { name?: string; email?: string; avatar?: string }): Promise<User | null> {
//     const currentUser = await this.getCurrentUser();
//     if (!currentUser) throw new Error('No user found');

//     const merged = {
//       ...currentUser,
//       ...updates,
//       updatedAt: new Date().toISOString(),
//       lastModified: Date.now(),
//     };

//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction(
//         (tx: SQLTransaction) => {
//           tx.executeSql(
//             `UPDATE users SET name = ?, email = ?, avatar = ?, updatedAt = ?, lastModified = ? WHERE id = ?`,
//             [merged.name, merged.email, merged.avatar, merged.updatedAt, merged.lastModified, merged.id],
//             async () => {
//               const latest = await this.getCurrentUser();
//               resolve(latest);
//             },
//             (tx: SQLTransaction, error: any) => { handleSqlError(tx, error); reject(error); return true; }
//           );
//         },
//         reject
//       );
//     });
//   }

//   static async isProfileComplete(): Promise<boolean> {
//     const user = await this.getCurrentUser();
//     return !!(user?.name && user.name !== 'Shop Owner' && user?.email);
//   }
// }

// export const getCurrentUser = BasicUserService.getCurrentUser;
// export const updateProfile = BasicUserService.updateProfile;
// export const isProfileComplete = BasicUserService.isProfileComplete;
