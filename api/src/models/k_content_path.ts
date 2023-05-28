import { Schema } from 'mongoose';
import { registerModel } from '../db_functions';
import { KContentPath } from '../interfaces/k_content_path';

// Define the KContentPath schema for Komplete Content Path using the KContentPath interface
export const KContentPathSchema = new Schema<KContentPath>({
  _id: Schema.Types.ObjectId, // MongoDB auto-generated ID
  id: Number, // Unique identifier for the Komplete Content Path
  path: String, // File system path to the content
  content_type: Number, // Content type identifier
  alias: String, // Alias for the content path
  state: Number, // State of the content (e.g., active, inactive)
  scanned_at: Number, // Timestamp for when the content path was last scanned
  product_id: String, // Identifier of the related product
  product_version: Number, // Version number of the related product
  updated_at: Number, // Timestamp for when the Komplete Content Path was last updated
  created_at: Number, // Timestamp for when the Komplete Content Path was created
  visible: Number, // Visibility flag for the content path (e.g., 1 for visible, 0 for hidden)
  upid: String, // Unique product identifier
  monitored: Number, // Monitoring flag (e.g., 1 for monitored, 0 for not monitored)
});

// Create and export the KContentPath model for Komplete Content Path using the schema and collection name
export const KContentPathModel = registerModel<KContentPath>('KContentPath', KContentPathSchema);
