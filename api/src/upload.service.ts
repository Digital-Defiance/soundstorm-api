import { Express, Request, Response } from 'express';
import { diskStorage } from 'multer';
import { existsSync, copyFileSync, renameSync } from 'fs';
import { randomBytes } from 'crypto';
import path from 'path';
import multer from 'multer';
import { User } from './interfaces/user';
import { sqliteFlattenedToMemory } from './sqlitemongo';
import { _API_DIR_ } from './environment';

export const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(_API_DIR_, 'uploads') + '/');
  },
  filename: (req, file, cb) => {
    // Use crypto to generate a random filename
    const randomName = randomBytes(16).toString('hex');
    cb(null, `_${randomName}.db3`);
  },
});

export const upload = multer({ storage });

export async function processFile(
  user: User,
  file: Express.Multer.File,
  res: Response
): Promise<Map<string, object[]> | undefined> {
  console.log(`Uploaded file: ${file.originalname} (${file.size} bytes)`);
  console.log(`  mimetype: ${file.mimetype}`);

  // make sure filename is komplete.db3
  if (file.originalname !== 'komplete.db3') {
    res.status(400).send('Invalid file uploaded');
    return undefined;
  }

  if (
    file.mimetype !== 'application/x-sqlite3' &&
    file.mimetype !== 'application/octet-stream'
  ) {
    console.warn(
      `WARNING: mimetype is ${file.mimetype} instead of application/x-sqlite3 or application/octet-stream`
    );
  }

  if (!existsSync(file.path)) {
    res.status(500).send('File not found');
    return undefined;
  }

  const userFilename = `uploads/${user._id}.db3`;
  const result = sqliteFlattenedToMemory(file.path);
  if (result && result.size > 0 && result.has('k_sound_info')) {
    const flattened = flattenTables(result);
    if (flattened) {
      // keep only the latest table
      if (existsSync(userFilename)) {
        console.log(`copying over old file ${userFilename}`);
        copyFileSync(file.path, userFilename);
      } else {
        console.log(`renaming ${file.path} to ${userFilename}`);
        renameSync(file.path, userFilename);
      }
      console.log('returning', flattened);
      return flattened;
    }
  }
  return undefined;
}

export function flattenTables(dataMap: Map<string, any>): Map<string, object[]> {
  const flattenedMap = new Map<string, object[]>();
  const soundInfo = dataMap.get('k_sound_info');

  for (const row of soundInfo) {
    const flattenedRow: any = { ...row };

    for (const key in flattenedRow) {
      if (key.endsWith('_id')) {
        const tableName = getTableName(key);
        const tableRows = dataMap.get(tableName);

        if (tableRows) {
          const tableRow = tableRows.find((r: any) => r.id === flattenedRow[key]);

          if (tableRow) {
            Object.assign(flattenedRow, tableRow);
          }
        }
      }
    }

    const flattenedRowId = flattenedRow.id;
    if (flattenedRowId) {
      let flattenedRows = flattenedMap.get(flattenedRowId);
      if (!flattenedRows) {
        flattenedRows = [];
        flattenedMap.set(flattenedRowId, flattenedRows);
      }

      flattenedRows.push(flattenedRow);
    }
  }

  return flattenedMap;
}

function getTableName(key: string): string {
  const tableName = key.replace('_id', '');
  return tableName.startsWith('k_') ? tableName : `k_${tableName}`;
}
