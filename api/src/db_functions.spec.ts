import { Schema, Model, model as mongooseModel } from 'mongoose';
import { MongoClient } from 'mongodb';
import {
    prefixImportedCollections,
    buildCollectionsTable,
    clearPrefixedTable,
    modelToSchema,
    nameToModel,
    nameToSchema,
    findModelName,
} from './db_functions';
import { allSchemas, commonSchemas, commonCollections, importedCollections, importedSchemas } from './models/model_constants';
import { AllModels } from './schema';

if (AllModels.length != allSchemas.length) {
    throw new Error('Schema/Model array length mismatch');
}

describe('db_functions', () => {
    let mongoClient: MongoClient;
    const prefix = 'test_';

    beforeAll(async () => {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('Must specify MONGO_URI');
        }
        mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
    });

    afterAll(async () => {
        await mongoClient.close();
    });

    afterEach(async () => {
        await clearPrefixedTable(prefix);
    });

    it('should return a table with no prefix', () => {
        const table = buildCollectionsTable();
        const combinedSchemas = [...importedSchemas, ...commonSchemas];

        combinedSchemas.forEach((schema, index) => {
            expect(table.get(schema)).toEqual(index < importedSchemas.length ? importedCollections[index] : commonCollections[index - importedSchemas.length]);
        });
    });

    it('should return a table with a given prefix', () => {
        const prefix = 'test_';
        const table = buildCollectionsTable(prefix);
        const combinedSchemas = [...importedSchemas, ...commonSchemas];

        combinedSchemas.forEach((schema, index) => {
            expect(table.get(schema)).toEqual(index < importedSchemas.length ? `${prefix}${importedCollections[index]}` : commonCollections[index - importedSchemas.length]);
        });
    });

    it('prefixImportedCollections', () => {
        const result = prefixImportedCollections(prefix);
        expect(result.length).toBe(importedCollections.length);
        importedCollections.forEach((collection, index) => {
            expect(result[index]).toBe(prefix + collection);
        });
    });

    it('buildCollectionsTable', () => {
        const table = buildCollectionsTable(prefix);
        expect(table.size).toBe(importedSchemas.length);
        importedSchemas.forEach((schema, index) => {
            expect(table.get(schema)).toBe(prefix + importedCollections[index]);
        });
    });

    it('clearPrefixedTable', async () => {
        const result = await clearPrefixedTable(prefix);
        expect(result).toBe(true);
    });

    it('modelToSchema', () => {
        allSchemas.forEach((schemaName) => {
            const model = nameToModel<any>(schemaName);
            const schemaFromModel = modelToSchema<any>(model);
            const expectedSchema = nameToSchema<any>(schemaName);
            expect(schemaFromModel).toBeInstanceOf(Schema);
            expect(schemaFromModel).toEqual(expectedSchema);
        });
    });

    it('nameToModel and nameToSchema', () => {
        allSchemas.forEach((schemaName) => {
            const model = nameToModel<any>(schemaName);
            expect(model).toBeInstanceOf(Model);
            const schema = nameToSchema<any>(schemaName);
            expect(schema).toBeInstanceOf(Schema);
        });
    });

    it('findModelName', () => {
        allSchemas.forEach((schemaName) => {
            const model = nameToModel<any>(schemaName);
            const modelName = findModelName(model);
            expect(modelName).toEqual(schemaName);
        });
    });
});
