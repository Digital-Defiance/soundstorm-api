import { MongoClient, Db } from 'mongodb';
import { Database } from 'sqlite3';

interface Named {
  name: string;
}

export const whitelistTables = [
  'k_bank_chain',
  'k_category',
  'k_content_path',
  'k_mode',
  'k_sound_info_category',
  'k_sound_info_mode',
  'k_sound_info',
];

export async function sqliteToMemory(
  sqlitePath: string,
): Promise<Map<string, object[]>> {
  if (typeof sqlitePath !== 'string') {
    throw new Error(`Expected a valid sqlite3 filepath but instead got ${sqlitePath}`);
  }

  const sqliteDb = new Database(sqlitePath);
  const map = new Map<string, object[]>();
  let error;
  try {
    const tables = await getSqliteTables(sqliteDb);
    for (const tableName of tables) {
      if (!whitelistTables.includes(tableName)) {
        console.log(`Skipping table ${tableName} because it is not in the whitelist.`)
        continue;
      }
      const rows = await getSqliteRows(sqliteDb, tableName);
      map.set(tableName, rows);
    }
  } catch (err) {
    error = err;
  } finally {
    sqliteDb.close();
  }

  if (error) {
    throw error;
  }
  return map;
}

export async function memoryToMongo(
  mongoURI: string,
  mongoDbName = 'sqlite3',
  map: Map<string, object[]>,
) {
  if (typeof mongoURI !== 'string') {
    throw new Error(`Expected a valid mongodb URI but instead got ${mongoURI}`);
  }
  const mongoClient = await MongoClient.connect(mongoURI);
  const mongoDb = mongoClient.db(mongoDbName);
  for (const [tableName, rows] of map.entries()) {
    await uploadToMongo(mongoDb, tableName, rows);
  }
}

export async function getSqliteTables(sqliteDb: Database): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const allTablesQuery = `SELECT name FROM sqlite_master WHERE type ='table' AND name NOT LIKE 'sqlite_%';`;
    sqliteDb.all(allTablesQuery, [], (err: any, tables: Named[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(tables.map((table: Named) => table.name));
      }
    });
  });
}

export async function getSqliteRows(sqliteDb: Database, tableName: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const sql = `SELECT rowid as _id, * FROM "${tableName}"`;
    sqliteDb.all(sql, [], (err: any, rows: any[] | PromiseLike<any[]>) => {
      if (err) {
        reject(new Error(`Failed to get sqlite3 table data for ${tableName}.\n${err}`));
      } else {
        resolve(rows);
      }
    });
  });
}

export async function uploadToMongo(mongoDb: Db, tableName: string, rows: any[]): Promise<void> {
  if (rows.length === 0) {
    try {
      await mongoDb.createCollection(tableName);
    } catch (err) {
      throw new Error(`Failed to create collection ${tableName} with error ${err}`);
    }
  } else {
    try {
      await mongoDb.collection(tableName).insertMany(rows, { ordered: false });
    } catch (err) {
      throw new Error(`Failed to insert ${typeof rows} with error ${err}`);
    }
  }
}
