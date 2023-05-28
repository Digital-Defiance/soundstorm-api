// Import required modules from the 'mongoose' package
import { Schema } from 'mongoose';
import { registerModel } from '../db_functions';
import { KSoundInfo } from '../interfaces/k_sound_info';

/*
{
  "_id": 2,
  "id": 2,
  "version": 0,
  "name": "312 Basement (87 bpm)",
  "author": "Native Instruments",
  "comment": null,
  "vendor": "Native Instruments",
  "color": 0,
  "tempo": 0,
  "device_type_flags": 1,
  "bank_chain_id": 1,
  "content_path_id": 1,
  "file_name": "D:\\Native Instruments\\Content\\40s Very Own - Drums\\Snapshots\\40s Very Own - Drums\\312 Basement (87 bpm).nksn",
  "file_ext": "nksn",
  "uuid": "bb940c9e-bd47-2403-3ae6-16fe66e9bb54",
  "file_size": 9388,
  "mod_date": 1647369399000000000,
  "updated_at": 1681994330000000000,
  "created_at": 1681994330000000000,
  "hidden_for": 0,
  "virtualBC": 0,
  "favorite_id": "f564bb37d14823793311b30195963569"
}
*/

// Define the KSoundInfo schema for Komplete Sound Info using the KSoundInfo interface
export const KSoundInfoSchema = new Schema<KSoundInfo>({
  _id: Schema.Types.ObjectId, // MongoDB auto-generated ID
  id: Number, // Unique identifier for the Komplete Sound Info
  version: Number, // Version number of the Komplete Sound Info
  name: String, // Name of the Komplete Sound Info
  author: String, // Author of the Komplete Sound Info
  comment: String, // Comment for the Komplete Sound Info
  vendor: String, // Vendor of the Komplete Sound Info
  color: Number, // Color of the Komplete Sound Info
  tempo: Number, // Tempo of the Komplete Sound Info
  device_type_flags: Number, // Device type flags for the Komplete Sound Info
  bank_chain_id: Number, // Bank chain identifier for the Komplete Sound Info
  content_path_id: Number, // Content path identifier for the Komplete Sound Info
  file_name: String, // File name of the Komplete Sound Info
  file_ext: String, // File extension of the Komplete Sound Info
  uuid: String, // UUID of the Komplete Sound Info
  file_size: Number, // File size of the Komplete Sound Info
  mod_date: Number, // Timestamp for when the Komplete Sound Info was last modified
  updated_at: Number, // Timestamp for when the Komplete Sound Info was last updated
  created_at: Number, // Timestamp for when the Komplete Sound Info was created
  hidden_for: Number, // Hidden flag for the Komplete Sound Info
  virtualBC: Number, // Virtual Bank Chain flag for the Komplete Sound Info
  favorite_id: String, // Favorite identifier for the Komplete Sound Info
});

// Create and export the KSoundInfo model for Komplete Sound Info using the schema and collection name
export const KSoundInfoModel = registerModel<KSoundInfo>('KSoundInfo', KSoundInfoSchema);
