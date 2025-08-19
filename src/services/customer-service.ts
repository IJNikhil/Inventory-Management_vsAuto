

// import { db as firestoreDb } from '../lib/firebase';
// import { dbPromise, handleSqlError } from '../lib/localDb';
// import uuid from 'react-native-uuid';
// import type { Customer } from '../types';
// import NetInfo from '@react-native-community/netinfo';

// interface SQLTransaction {
//   executeSql: (
//     sql: string,
//     params?: any[],
//     success?: (tx: SQLTransaction, results: SQLResultSet) => void,
//     error?: (tx: SQLTransaction, err: any) => boolean
//   ) => void;
// }

// interface SQLResultSet {
//   rows: {
//     length: number;
//     item: (index: number) => any;
//   };
// }

// interface CustomerRow {
//   id: string;
//   name: string;
//   phone: string;
//   address: string;
//   lastModified: number;
// }

// function customerFromRow(row: CustomerRow): Customer {
//   return {
//     id: row.id,
//     name: row.name || '',
//     phone: row.phone || '',
//     address: row.address || '',
//     lastModified: row.lastModified || Date.now(),
//   };
// }

// async function customerFromFirestore(doc: any): Promise<Customer> {
//   const data = doc.data();
//   return {
//     id: doc.id,
//     name: data.name || '',
//     phone: data.phone || '',
//     address: data.address || '',
//     lastModified: data.lastModified || Date.now(),
//   };
// }

// async function updateLocalCustomer(customer: Customer): Promise<void> {
//   const db = await dbPromise;
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `INSERT OR REPLACE INTO customers (id, name, phone, address, lastModified) VALUES (?, ?, ?, ?, ?)`,
//         [customer.id, customer.name, customer.phone, customer.address, customer.lastModified],
//         () => resolve(),
//         handleSqlError
//       );
//     }, (error) => reject(error));
//   });
// }

// export async function getCustomers(): Promise<Customer[]> {
//   const state = await NetInfo.fetch();
//   if (state.isConnected) {
//     const snapshot = await firestoreDb.collection('customers').orderBy('name').get();
//     const customers = await Promise.all(snapshot.docs.map(doc => customerFromFirestore(doc)));
//     for (const customer of customers) {
//       await updateLocalCustomer(customer).catch(() => {
//         // Silent fail for local updates
//       });
//     }
//     return customers;
//   } else {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction((tx) => {
//         tx.executeSql(
//           'SELECT * FROM customers ORDER BY name',
//           [],
//           (_, results) => {
//             const customers: Customer[] = [];
//             for (let i = 0; i < results.rows.length; i++) {
//               customers.push(customerFromRow(results.rows.item(i) as CustomerRow));
//             }
//             resolve(customers);
//           },
//           handleSqlError
//         );
//       }, (error) => reject(error));
//     });
//   }
// }

// export async function getCustomerById(id: string): Promise<Customer | null> {
//   const state = await NetInfo.fetch();
//   if (state.isConnected) {
//     const doc = await firestoreDb.collection('customers').doc(id).get();
//     if (!doc.exists) return null;
//     const customer = await customerFromFirestore(doc);
//     await updateLocalCustomer(customer).catch(() => {
//       // Silent fail for local updates
//     });
//     return customer;
//   } else {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction((tx) => {
//         tx.executeSql(
//           'SELECT * FROM customers WHERE id = ?',
//           [id],
//           (_, results) => {
//             resolve(results.rows.length > 0 ? customerFromRow(results.rows.item(0) as CustomerRow) : null);
//           },
//           handleSqlError
//         );
//       }, (error) => reject(error));
//     });
//   }
// }

// export async function getCustomersByIds(ids: string[]): Promise<Map<string, Customer>> {
//   const customersMap = new Map<string, Customer>();
//   if (ids.length === 0) return customersMap;
//   const state = await NetInfo.fetch();

//   if (state.isConnected) {
//     const customers = await Promise.all(
//       ids.map(async id => {
//         const doc = await firestoreDb.collection('customers').doc(id).get();
//         return doc.exists() ? await customerFromFirestore(doc) : null;
//       })
//     );
//     customers.forEach(customer => {
//       if (customer) {
//         customersMap.set(customer.id, customer);
//         updateLocalCustomer(customer).catch(() => {
//           // Silent fail for local updates
//         });
//       }
//     });
//     return customersMap;
//   } else {
//     const db = await dbPromise;
//     return new Promise((resolve, reject) => {
//       db.transaction((tx) => {
//         tx.executeSql(
//           `SELECT * FROM customers WHERE id IN (${ids.map(() => '?').join(',')})`,
//           ids,
//           (_, results) => {
//             for (let i = 0; i < results.rows.length; i++) {
//               const customer = customerFromRow(results.rows.item(i) as CustomerRow);
//               customersMap.set(customer.id, customer);
//             }
//             resolve(customersMap);
//           },
//           handleSqlError
//         );
//       }, (error) => reject(error));
//     });
//   }
// }

// export async function addCustomer(customerData: Omit<Customer, 'id' | 'lastModified'>): Promise<Customer> {
//   const id = uuid.v4() as string;
//   const lastModified = Date.now();
//   const customer: Customer = { id, ...customerData, lastModified };
//   const db = await dbPromise;
//   const state = await NetInfo.fetch();

//   if (state.isConnected) {
//     await firestoreDb.collection('customers').doc(id).set(customer);
//   }

//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         'INSERT OR REPLACE INTO customers (id, name, phone, address, lastModified) VALUES (?, ?, ?, ?, ?)',
//         [id, customer.name, customer.phone, customer.address, lastModified],
//         () => {
//           tx.executeSql(
//             'INSERT INTO change_log (collection, documentId, operation, data, timestamp) VALUES (?, ?, ?, ?, ?)',
//             ['customers', id, 'INSERT', JSON.stringify(customer), lastModified],
//             () => resolve(customer),
//             handleSqlError
//           );
//         },
//         handleSqlError
//       );
//     }, (error) => reject(error));
//   });
// }

// export async function updateCustomer(id: string, customerData: Omit<Customer, 'id' | 'lastModified'>): Promise<Customer> {
//   const lastModified = Date.now();
//   const customer: Customer = { id, ...customerData, lastModified };
//   const db = await dbPromise;
//   const state = await NetInfo.fetch();

//   if (state.isConnected) {
//     await firestoreDb.collection('customers').doc(id).set(customer, { merge: true });
//   }

//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         'UPDATE customers SET name = ?, phone = ?, address = ?, lastModified = ? WHERE id = ?',
//         [customer.name, customer.phone, customer.address, lastModified, id],
//         () => {
//           tx.executeSql(
//             'INSERT INTO change_log (collection, documentId, operation, data, timestamp) VALUES (?, ?, ?, ?, ?)',
//             ['customers', id, 'UPDATE', JSON.stringify(customer), lastModified],
//             () => resolve(customer),
//             handleSqlError
//           );
//         },
//         handleSqlError
//       );
//     }, (error) => reject(error));
//   });
// }

// export async function deleteCustomer(id: string): Promise<void> {
//   const lastModified = Date.now();
//   const db = await dbPromise;
//   const state = await NetInfo.fetch();

//   if (state.isConnected) {
//     await firestoreDb.collection('customers').doc(id).delete();
//   }

//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         'DELETE FROM customers WHERE id = ?',
//         [id],
//         () => {
//           tx.executeSql(
//             'INSERT INTO change_log (collection, documentId, operation, data, timestamp) VALUES (?, ?, ?, ?, ?)',
//             ['customers', id, 'DELETE', JSON.stringify({ id }), lastModified],
//             () => resolve(),
//             handleSqlError
//           );
//         },
//         handleSqlError
//       );
//     }, (error) => reject(error));
//   });
// }







// // import { db as firestoreDb } from '../lib/firebase';
// // import { dbPromise, handleSqlError } from '../lib/localDb';
// // import uuid from 'react-native-uuid';
// // import type { Customer } from '../types';
// // import NetInfo from '@react-native-community/netinfo';

// // // Define minimal interfaces for SQLite types
// // interface SQLTransaction {
// //   executeSql: (
// //     sql: string,
// //     params?: any[],
// //     success?: (tx: SQLTransaction, results: SQLResultSet) => void,
// //     error?: (tx: SQLTransaction, err: any) => boolean
// //   ) => void;
// // }

// // interface SQLResultSet {
// //   rows: {
// //     length: number;
// //     item: (index: number) => any;
// //   };
// // }

// // interface CustomerRow {
// //   id: string;
// //   name: string;
// //   phone: string;
// //   address: string;
// //   lastModified: number;
// // }

// // function customerFromRow(row: CustomerRow): Customer {
// //   return {
// //     id: row.id,
// //     name: row.name || '',
// //     phone: row.phone || '',
// //     address: row.address || '',
// //     lastModified: row.lastModified || Date.now(),
// //   };
// // }

// // async function customerFromFirestore(doc: any): Promise<Customer> {
// //   const data = doc.data();
// //   return {
// //     id: doc.id,
// //     name: data.name || '',
// //     phone: data.phone || '',
// //     address: data.address || '',
// //     lastModified: data.lastModified || Date.now(),
// //   };
// // }

// // async function updateLocalCustomer(customer: Customer): Promise<void> {
// //   const db = await dbPromise;
// //   return new Promise((resolve, reject) => {
// //     db.transaction((tx) => {
// //       tx.executeSql(
// //         `INSERT OR REPLACE INTO customers (id, name, phone, address, lastModified) VALUES (?, ?, ?, ?, ?)`,
// //         [customer.id, customer.name, customer.phone, customer.address, customer.lastModified],
// //         () => resolve(),
// //         handleSqlError
// //       );
// //     }, (error) => reject(error));
// //   });
// // }

// // export async function getCustomers(): Promise<Customer[]> {
// //   const state = await NetInfo.fetch();
// //   if (state.isConnected) {
// //     // Namespaced API
// //     const snapshot = await firestoreDb.collection('customers').orderBy('name').get();
// //     // Modular API: const querySnapshot = await getDocs(query(collection(firestoreDb, 'customers'), orderBy('name')));
// //     const customers = await Promise.all(snapshot.docs.map(doc => customerFromFirestore(doc)));
// //     for (const customer of customers) {
// //       await updateLocalCustomer(customer).catch((err) => {
// //         console.error(`Failed to update local customer ${customer.id}:`, err);
// //       });
// //     }
// //     return customers;
// //   } else {
// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction((tx) => {
// //         tx.executeSql(
// //           'SELECT * FROM customers ORDER BY name',
// //           [],
// //           (_, results) => {
// //             const customers: Customer[] = [];
// //             for (let i = 0; i < results.rows.length; i++) {
// //               customers.push(customerFromRow(results.rows.item(i) as CustomerRow));
// //             }
// //             resolve(customers);
// //           },
// //           handleSqlError
// //         );
// //       }, (error) => reject(error));
// //     });
// //   }
// // }

// // export async function getCustomerById(id: string): Promise<Customer | null> {
// //   const state = await NetInfo.fetch();
// //   if (state.isConnected) {
// //     // Namespaced API
// //     const doc = await firestoreDb.collection('customers').doc(id).get();
// //     // Modular API: const doc = await getDoc(docRef(firestoreDb, 'customers', id));
// //     if (!doc.exists) return null;
// //     const customer = await customerFromFirestore(doc);
// //     await updateLocalCustomer(customer).catch((err) => {
// //       console.error(`Failed to update local customer ${id}:`, err);
// //     });
// //     return customer;
// //   } else {
// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction((tx) => {
// //         tx.executeSql(
// //           'SELECT * FROM customers WHERE id = ?',
// //           [id],
// //           (_, results) => {
// //             resolve(results.rows.length > 0 ? customerFromRow(results.rows.item(0) as CustomerRow) : null);
// //           },
// //           handleSqlError
// //         );
// //       }, (error) => reject(error));
// //     });
// //   }
// // }

// // export async function getCustomersByIds(ids: string[]): Promise<Map<string, Customer>> {
// //   const customersMap = new Map<string, Customer>();
// //   if (ids.length === 0) return customersMap;
// //   const state = await NetInfo.fetch();

// //   if (state.isConnected) {
// //     const customers = await Promise.all(
// //       ids.map(async id => {
// //         // Namespaced API
// //         const doc = await firestoreDb.collection('customers').doc(id).get();
// //         // Modular API: const doc = await getDoc(docRef(firestoreDb, 'customers', id));
// //         return doc.exists() ? await customerFromFirestore(doc) : null;
// //       })
// //     );
// //     customers.forEach(customer => {
// //       if (customer) {
// //         customersMap.set(customer.id, customer);
// //         updateLocalCustomer(customer).catch((err) => {
// //           console.error(`Failed to update local customer ${customer.id}:`, err);
// //         });
// //       }
// //     });
// //     return customersMap;
// //   } else {
// //     const db = await dbPromise;
// //     return new Promise((resolve, reject) => {
// //       db.transaction((tx) => {
// //         tx.executeSql(
// //           `SELECT * FROM customers WHERE id IN (${ids.map(() => '?').join(',')})`,
// //           ids,
// //           (_, results) => {
// //             for (let i = 0; i < results.rows.length; i++) {
// //               const customer = customerFromRow(results.rows.item(i) as CustomerRow);
// //               customersMap.set(customer.id, customer);
// //             }
// //             resolve(customersMap);
// //           },
// //           handleSqlError
// //         );
// //       }, (error) => reject(error));
// //     });
// //   }
// // }

// // export async function addCustomer(customerData: Omit<Customer, 'id' | 'lastModified'>): Promise<Customer> {
// //   const id = uuid.v4() as string;
// //   const lastModified = Date.now();
// //   const customer: Customer = { id, ...customerData, lastModified };
// //   const db = await dbPromise;
// //   const state = await NetInfo.fetch();

// //   if (state.isConnected) {
// //     // Namespaced API
// //     await firestoreDb.collection('customers').doc(id).set(customer);
// //     // Modular API: await setDoc(doc(firestoreDb, 'customers', id), customer);
// //   }

// //   return new Promise((resolve, reject) => {
// //     db.transaction((tx) => {
// //       tx.executeSql(
// //         'INSERT OR REPLACE INTO customers (id, name, phone, address, lastModified) VALUES (?, ?, ?, ?, ?)',
// //         [id, customer.name, customer.phone, customer.address, lastModified],
// //         () => {
// //           tx.executeSql(
// //             'INSERT INTO change_log (collection, documentId, operation, data, timestamp) VALUES (?, ?, ?, ?, ?)',
// //             ['customers', id, 'INSERT', JSON.stringify(customer), lastModified],
// //             () => resolve(customer),
// //             handleSqlError
// //           );
// //         },
// //         handleSqlError
// //       );
// //     }, (error) => reject(error));
// //   });
// // }

// // export async function updateCustomer(id: string, customerData: Omit<Customer, 'id' | 'lastModified'>): Promise<Customer> {
// //   const lastModified = Date.now();
// //   const customer: Customer = { id, ...customerData, lastModified };
// //   const db = await dbPromise;
// //   const state = await NetInfo.fetch();

// //   if (state.isConnected) {
// //     // Namespaced API
// //     await firestoreDb.collection('customers').doc(id).set(customer, { merge: true });
// //     // Modular API: await setDoc(doc(firestoreDb, 'customers', id), customer, { merge: true });
// //   }

// //   return new Promise((resolve, reject) => {
// //     db.transaction((tx) => {
// //       tx.executeSql(
// //         'UPDATE customers SET name = ?, phone = ?, address = ?, lastModified = ? WHERE id = ?',
// //         [customer.name, customer.phone, customer.address, lastModified, id],
// //         () => {
// //           tx.executeSql(
// //             'INSERT INTO change_log (collection, documentId, operation, data, timestamp) VALUES (?, ?, ?, ?, ?)',
// //             ['customers', id, 'UPDATE', JSON.stringify(customer), lastModified],
// //             () => resolve(customer),
// //             handleSqlError
// //           );
// //         },
// //         handleSqlError
// //       );
// //     }, (error) => reject(error));
// //   });
// // }

// // export async function deleteCustomer(id: string): Promise<void> {
// //   const lastModified = Date.now();
// //   const db = await dbPromise;
// //   const state = await NetInfo.fetch();

// //   if (state.isConnected) {
// //     // Namespaced API
// //     await firestoreDb.collection('customers').doc(id).delete();
// //     // Modular API: await deleteDoc(doc(firestoreDb, 'customers', id));
// //   }

// //   return new Promise((resolve, reject) => {
// //     db.transaction((tx) => {
// //       tx.executeSql(
// //         'DELETE FROM customers WHERE id = ?',
// //         [id],
// //         () => {
// //           tx.executeSql(
// //             'INSERT INTO change_log (collection, documentId, operation, data, timestamp) VALUES (?, ?, ?, ?, ?)',
// //             ['customers', id, 'DELETE', JSON.stringify({ id }), lastModified],
// //             () => resolve(),
// //             handleSqlError
// //           );
// //         },
// //         handleSqlError
// //       );
// //     }, (error) => reject(error));
// //   });
// // }