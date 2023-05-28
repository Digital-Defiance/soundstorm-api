import { Schema } from 'mongoose';
import { KBankChain } from '../interfaces/k_bank_chain';
import { registerModel } from '../db_functions';

// Define the KBankChain schema for Komplete Bank Chain using the KBankChain interface
export const KBankChainSchema = new Schema<KBankChain>({
  _id: Schema.Types.ObjectId, // MongoDB auto-generated ID
  id: Number, // Unique identifier for the Komplete Bank Chain
  entry1: String, // Name of the Komplete Bank Chain
  entry2: { type: String, required: false }, // Name of the Komplete Bank Chain
  entry3: { type: String, required: false }, // Name of the Komplete Bank Chain
  bcvendor: String, // Name of the Komplete Bank vendor
  bcVendorId: Schema.Types.ObjectId // Optional, internal Foreign key referencing the related Vendor entity
});

// Create and export the KBankChain model for Komplete Bank Chain using the schema and collection name
export const KBankChainModel = registerModel<KBankChain>('KBankChain', KBankChainSchema);