import sqlite3, { Database } from "better-sqlite3";

export const whitelistTables = [
  'k_bank_chain',
  'k_category',
  'k_content_path',
  'k_mode',
  'k_sound_info_category',
  'k_sound_info_mode',
  'k_sound_info',
];

export function sqliteToMemory(sqlitePath: string): Map<string, any> {
  const db = new sqlite3(sqlitePath);
  const result = new Map<string, any>();

  try {
    const tablesQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
    const tables = db.prepare(tablesQuery).all();


    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const tableName = (table as any).name as string;

      for (let j = 0; j < whitelistTables.length; j++) {
        const whitelistTable = whitelistTables[j];
        if (tableName === whitelistTable) {
          const rowsQuery = `SELECT * FROM ${tableName};`;
          const rows = db.prepare(rowsQuery).all();
  
          result.set(tableName, rows);
          break;
        }
      }
    }
  } catch (err) {
    console.error('Error reading SQLite database:', err);
  } finally {
    db.close();
  }

  return result;
}
