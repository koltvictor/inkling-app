import * as SQLite from 'expo-sqlite';
import type { StateStorage } from 'zustand/middleware';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('inkling.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS kv (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
};

export const sqliteStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const db = await getDb();
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM kv WHERE key = ?',
        [name]
      );
      return row?.value ?? null;
    } catch (err) {
      console.warn('sqliteStorage.getItem failed:', err);
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      const db = await getDb();
      await db.runAsync(
        'INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, ?)',
        [name, value, Date.now()]
      );
    } catch (err) {
      console.warn('sqliteStorage.setItem failed:', err);
    }
  },
  removeItem: async (name) => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM kv WHERE key = ?', [name]);
    } catch (err) {
      console.warn('sqliteStorage.removeItem failed:', err);
    }
  },
};
