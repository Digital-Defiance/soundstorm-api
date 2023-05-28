
import { Schema, Model, model as mongooseModel } from 'mongoose';
import { MongoClient } from 'mongodb';
import { AllSchema, collectionNamesByName, importedCollections, importedSchemas } from './models/model_constants';
import { Vendor } from './interfaces/vendor';
import { Product } from './interfaces/product';
import { Sound } from './interfaces/sound';

// not exported module level variables
/**
 * A map of schema names to their corresponding mongoose models
 * Objects are all Model<T> where T extends Document
 */
const modelMap: Map<string, Model<any>> = new Map();
/**
 * A map of schema names to their corresponding mongoose schemas
 */
const schemaMap: Map<string, Schema> = new Map();

export function prefixImportedCollections(prefix = '') {
    if (!prefix || !prefix.trim()) {
        throw new Error('Must specify prefix');
    }
    return importedCollections.map(collection => `${prefix}${collection}`);
}

export function buildCollectionsTable(prefix = '') {
    if (!prefix || !prefix.trim()) {
        throw new Error('Must specify prefix');
    }
    if (importedCollections.length != importedSchemas.length) {
        throw new Error('Schema/Collection array length mismatch');
    }
    // build a table of schemas -> collections with the prefix
    const prefixedImportedCollections = prefixImportedCollections(prefix);

    // Create a table (Map) that maps schema names to collection names
    const table = new Map<string, string>();
    for (let i = 0; i < importedSchemas.length; i++) {
        table.set(importedSchemas[i], prefixedImportedCollections[i]);
    }

    return table;
}

export async function clearPrefixedTable(prefix: string): Promise<boolean> {
    // delete the prefixed collections
    if (!prefix || !prefix.trim()) {
        throw new Error('Must specify prefix');
    }
    const prefixedCollections = prefixImportedCollections(prefix);
    const mongoUri = process.env['MONGO_URI'];
    if (!mongoUri) {
        throw new Error('Must specify MONGO_URI');
    }
    const mongoClient = new MongoClient(mongoUri);

    let allOk = true;
    for (let i = 0; i < prefixedCollections.length; i++) {
        // delete the collection from mongo
        allOk = allOk && await mongoClient.db().collection(prefixedCollections[i]).drop();
    }
    return allOk;
}

export function registerModel<T>(modelName: string, schema: Schema): Model<T> {
    const collectionName = collectionNamesByName[modelName];
    if (modelMap.has(modelName)) {
        return modelMap.get(modelName) as Model<T>;
    }
    const newModel = mongooseModel<T>(modelName, schema, collectionName);
    modelMap.set(modelName, newModel);
    schemaMap.set(modelName, schema);
    return newModel;
}

export function findModelName<T>(model: Model<T>): string | undefined {
    for (const [key, value] of modelMap.entries()) {
        if (value === model) {
            return key;
        }
    }
    return undefined;
}

/**
 * This function is used to get a schema from a model. It will create a new schema if it doesn't exist
 * @param model 
 * @returns 
 */
export function modelToSchema<T>(model: Model<T>): Schema<T> {
    const modelName = findModelName(model);
    if (modelName === undefined) {
        throw new Error(`Could not find model ${model}`);
    }
    return nameToSchema<T>(modelName);
}

/**
 *  This function is used to get a model from a schema. It will create a new model if it doesn't exist
 *  The expectation is that this is called out of every model file, so that the model is registered
 * @param modelName 
 * @returns 
 */
export function nameToModel<T>(modelName: AllSchema): Model<T> {
    let newModel: Model<T> | undefined;
    if (modelMap.has(modelName)) {
        newModel = modelMap.get(modelName) as Model<T> | undefined;

        if (newModel) {
            return newModel;
        }
    }
    const schema = nameToSchema<T>(modelName);
    const collectionName = collectionNamesByName[modelName];
    if (!collectionName) {
        throw new Error(`Could not locate schema for model ${modelName}`)
    }
    newModel = mongooseModel<T>(modelName, schema, collectionName);
    modelMap.set(modelName, newModel);
    return newModel;
}

/**
 * This function is used to get a schema from a model. It will create a new schema if it doesn't exist
 * THe schema is expected to be registered via nameToModel
 * @param modelName 
 * @returns 
 */
export function nameToSchema<T>(modelName: AllSchema): Schema<T> {
    if (!schemaMap.has(modelName)) {
        throw new Error(`Could not find model ${modelName}`);
    }
    const schema = schemaMap.get(modelName);
    if (!schema) {
        throw new Error(`Could not find model ${modelName}`);
    }
    return schema as Schema<T>;
}

export async function findOrMakeVendor(vendorName: string): Promise<Vendor> {
    const vendorModel = nameToModel<Vendor>('Vendor');
    const foundVendor = await vendorModel.findOne({ name: vendorName });
    if (foundVendor) {
        return foundVendor as Vendor;
    }
    const newVendor = new vendorModel({
        name: vendorName
    });
    await newVendor.save();
    return newVendor as Vendor;
}

export async function findOrMakeSound(vendorName: string, sound: string, product: Product): Promise<Sound>
{
    const SoundModel = nameToModel<Sound>('Sound');
    const foundSound = await SoundModel.findOne({ name: sound, product: product._id });
    if (foundSound) {
        return foundSound as Sound;
    }
    const newSound = new SoundModel({
        name: sound,
        author: product.author,
        vendor: product.vendor,
        k_sound_info_id: product.k_sound_info_id,
        vendor_id: product.vendor_id,
        product: product._id
    });
    await newSound.save();
    return newSound as Sound;
}

export async function findOrMakeVendorProduct(vendorName: string, product: string): Promise<Product>
{
    const vendor = await findOrMakeVendor(vendorName);
    const ProductModel = nameToModel<Product>('Product');
    const foundProduct = await ProductModel.findOne({ name: product, vendor: vendor._id });
    if (foundProduct) {
        return foundProduct as Product;
    }
    const newProduct = new ProductModel({
        name: product,
        vendor: vendor._id
    });
    await newProduct.save();
    return newProduct as Product;
}

/**
 * For a given import, go through an link the records from the import
 * @param prefix 
 */
export function linkImport(prefix = '') {

    // link products
    // if the product doesn't exist, create it

    // link sounds
    // link soundstorms
    // link stories

    // link sections
    // select all the sections from this prefix
    // SectionModel.find({}).then(sections => {

    // });
}