import { Schema } from 'mongoose';
import { Sound } from '../interfaces/sound';
import { registerModel } from '../db_functions';

const SoundSchema = new Schema<Sound>({
  _id: Schema.Types.ObjectId,
  name: String,
  author: String,
  vendor: String,
  k_sound_info_id: Number,
  vendor_id: Number,
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  owner_id: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const SoundModel = registerModel<Sound>('Sound', SoundSchema);
