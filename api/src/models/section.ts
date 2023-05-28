import { Schema } from 'mongoose';
import { Section } from "../interfaces/section";
import { registerModel } from "../db_functions";

// Mongoose schema for the section
export const SectionSchema = new Schema<Section>({
  _id: Schema.Types.ObjectId,
  title: String, // Title of the section
  soundstorm_ids: [{ type: Schema.Types.ObjectId, ref: 'Soundstorm' }], // IDs of SoundStorms associated with the section
  story_id: { type: Schema.Types.ObjectId, ref: 'Story' }, // ID of the story that the section belongs to
  created_by: { type: Schema.Types.ObjectId, ref: 'User' }, // ID of the user who created the section
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' }, // ID of the user who last updated the section
  owner_id: { type: Schema.Types.ObjectId, ref: 'User' }, // ID of the user who owns the section
}, { timestamps: true }); // Timestamps for when the section was created and last updated

// Mongoose model for the section
export const SectionModel = registerModel<Section>('Section', SectionSchema);
