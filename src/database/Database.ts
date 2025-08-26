import SQLite from 'react-native-sqlite-storage';
import {DATABASE_NAME, DATABASE_VERSION, SCHEMA, INDEXES} from './schema';

SQLite.enablePromise(true);

export class Database {
  private static instance: Database;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
      });

      await this.createTables();
      await this.createIndexes();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = Object.values(SCHEMA);
    for (const tableSchema of tables) {
      await this.db.executeSql(tableSchema);
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const index of INDEXES) {
      await this.db.executeSql(index);
    }
  }

  async executeSql(query: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const [result] = await this.db.executeSql(query, params);
    return result;
  }

  async transaction(queries: Array<{query: string; params?: any[]}>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.transaction(tx => {
      queries.forEach(({query, params = []}) => {
        tx.executeSql(query, params);
      });
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}