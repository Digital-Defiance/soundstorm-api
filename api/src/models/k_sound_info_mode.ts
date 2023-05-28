// Import required modules from the 'mongoose' package
import { Schema } from 'mongoose';
import { KSoundInfoMode } from '../interfaces/k_sound_info_mode';
import { registerModel } from '../db_functions';

// Define the KSoundInfoMode schema for Komplete Sound Info Mode using the KSoundInfoMode interface
export const KSoundInfoModeSchema = new Schema<KSoundInfoMode>({
  _id: Schema.Types.ObjectId, // MongoDB auto-generated ID
  sound_info_id: Number, // Foreign key referencing the related Sound Info entity
  mode_id: Number, // Foreign key referencing the related Mode entity
});

// Create and export the KSoundInfoMode model for Komplete Sound Info Mode using the schema and collection name
export const KSoundInfoModeModel = registerModel<KSoundInfoMode>('KSoundInfoMode', KSoundInfoModeSchema);
