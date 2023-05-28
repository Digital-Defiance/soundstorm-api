import { Story } from "../interfaces/story";
import { Schema } from 'mongoose';
import { registerModel } from "../db_functions";

export const StorySchema = new Schema<Story>({
  title: String,
  description: String,
  section_ids: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  owner_id: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const StoryModel = registerModel<Story>('Story', StorySchema);
