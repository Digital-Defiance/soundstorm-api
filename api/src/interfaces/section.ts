import { ObjectId } from "mongoose";
import { BaseModel } from "./baseModel";
import { SoundStorm } from "./soundstorm";

// Interface for the section schema
export interface Section extends BaseModel {
    title: string; // Title of the section
    soundstorms: SoundStorm[]; // SoundStorms associated with the section
    soundstorm_ids: ObjectId[]; // IDs of SoundStorms associated with the section
    story_id: ObjectId; // ID of the story that the section belongs to
    created_by: ObjectId; // ID of the user who created the section
    created_at: number; // Timestamp of when the section was created
    updated_at: number; // Timestamp of when the section was last updated
    updated_by: ObjectId; // ID of the user who last updated the section
    owner_id: ObjectId; // ID of the user who owns the section
  }