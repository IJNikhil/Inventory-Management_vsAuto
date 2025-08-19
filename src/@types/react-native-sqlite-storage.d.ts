// // src/@types/react-native-sqlite-storage.d.ts
// declare module 'react-native-sqlite-storage' {
//   export interface SQLiteDatabase {
//     transaction(
//       callback: (txn: Transaction) => void | Promise<void>,
//       error?: (error: any) => void,
//       success?: () => void
//     ): void | Promise<void>;

//     executeSql(
//       statement: string,
//       params?: any[]
//     ): Promise<[any, any]>;
//   }

//   export interface Transaction {
//     executeSql(
//       statement: string,
//       params?: any[],
//       success?: (txn: Transaction, resultSet: any) => void,
//       error?: (txn: Transaction, error: any) => void
//     ): void;
//   }

//   const SQLite: {
//     enablePromise(shouldEnable: boolean): void;
//     openDatabase(params: {
//       name: string,
//       location: string,
//       createFromLocation?: number | string,
//       readOnly?: boolean,
//     }): Promise<SQLiteDatabase>;
//   };

//   export default SQLite;
//   export { SQLiteDatabase, Transaction };
// }
