import { Schema } from 'mongoose';
import { SoundStorm } from '../interfaces/soundstorm';
import { registerModel } from '../db_functions';

const SoundStormSchema = new Schema<SoundStorm>({
  _id: Schema.Types.ObjectId,
  name: String,
  description: String,
  story_id: { type: Schema.Types.ObjectId, ref: 'Story' },
  sound_ids: [{ type: Schema.Types.ObjectId, ref: 'Sound' }],
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  owner_id: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const SoundStormModel = registerModel<SoundStorm>('SoundStorm', SoundStormSchema);
