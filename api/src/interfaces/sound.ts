import { ObjectId } from "mongoose";
import { BaseModel } from "./baseModel";

export interface Sound extends BaseModel {
    name: string; // Name of the sound
    author: string; // Author of the sound
    vendor: string; // Vendor of the sound
    k_sound_info_id?: number; // ID of the sound in the Komplete Sound database
    vendor_id?: ObjectId; // ID of the vendor of the sound
    // ... other sound properties
    created_by: ObjectId; // ID of the user who created the sound
    created_at: number; // Timestamp of when the sound was created
    updated_at: number; // Timestamp of when the sound was last updated
    updated_by: ObjectId; // ID of the user who last updated the sound
    owner_id: ObjectId; // ID of the user who owns the sound
  }