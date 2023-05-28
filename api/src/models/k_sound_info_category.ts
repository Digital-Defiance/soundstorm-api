import { Schema } from 'mongoose';
import { registerModel } from '../db_functions';
import { KSoundInfoCategory } from '../interfaces/k_sound_info_category';

// Define the KSoundInfoCategory schema for Komplete Sound Info Category using the KSoundInfoCategory interface
export const KSoundInfoCategorySchema = new Schema<KSoundInfoCategory>({
  _id: Schema.Types.ObjectId, // MongoDB auto-generated ID
  sound_info_id : Number,
  category_id : Number
});

// Create and export the KSoundInfoCategory model for Komplete Sound Info Category using the schema and collection name
export const KSoundInfoCategoryModel = registerModel<KSoundInfoCategory>('KSoundInfoCategory', KSoundInfoCategorySchema);
