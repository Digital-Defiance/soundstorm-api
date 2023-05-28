import { Schema } from 'mongoose';
import { registerModel } from '../db_functions';
import { KMode } from '../interfaces/k_mode';

/*
{
  "_id": 1,
  "id": 1,
  "name": "Acoustic"
}
*/

// Define the KMode schema for Komplete Mode using the KMode interface
export const KModeSchema = new Schema<KMode>({
  _id: Schema.Types.ObjectId, // MongoDB auto-generated ID
  id: Number, // Unique identifier for the Komplete Mode
  name: String, // Name of the mode
});

// Create and export the KMode model for Komplete Mode using the schema and collection name
export const KModeModel = registerModel<KMode>('KMode', KModeSchema);
