import { Schema } from 'mongoose';
import { registerModel } from '../db_functions';
import { KCategory } from '../interfaces/k_category';

// Define the KCategory schema for Komplete Category using the KCategory interface
export const KCategorySchema = new Schema<KCategory>({
  _id: Schema.Types.ObjectId, // MongoDB auto-generated ID
  id: Number, // Unique identifier for the Komplete Category
  category: String, // Name of the Komplete Category
  subcategory: { type: String, required: false}, // Name of the Komplete Category
  subsubcategory: { type: String, required: false} // Name of the Komplete Category
});

// Create and export the KCategory model for Komplete Category using the schema and collection name
export const KCategoryModel = registerModel<KCategory>('KCategory', KCategorySchema);