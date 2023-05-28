import { ObjectId } from "mongoose";
import { BaseModel } from "./baseModel";
import { Sound } from "./sound";

export interface SoundStorm extends BaseModel {
    name: string; // Name of the soundstorm
    description: string; // Description of the soundstorm
    story_id?: ObjectId; // ObjectId of the story that the soundstorm belongs to
    section_id?: ObjectId; // ObjectId of the section that the soundstorm belongs to
    sounds: Sound[]; // Array of sounds associated with the soundstorm
    sound_ids: ObjectId[]; // Array of sound IDs associated with the soundstorm
    created_by: ObjectId; // ObjectId of the user who created the soundstorm
    created_at: number; // Timestamp of when the soundstorm was created
    updated_at: number; // Timestamp of when the soundstorm was last updated
    updated_by: ObjectId; // ObjectId of the user who last updated the soundstorm
    owner_id: ObjectId; // ObjectId of the user who owns the soundstorm
  }