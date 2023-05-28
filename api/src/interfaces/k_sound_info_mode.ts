import { ObjectId } from "mongoose";
import { BaseModel } from "./baseModel";

/*
{
    "_id" : NumberInt(2),
    "sound_info_id" : NumberInt(1),
    "mode_id" : NumberInt(2)
}
*/

// Define the KSoundInfoMode interface for Komplete Sound Info Mode, extending the Mongoose Document interface
export interface KSoundInfoMode extends BaseModel {
    sound_info_id: number; // Foreign key referencing the related Sound Info entity
    mode_id: number; // Foreign key referencing the related Mode entity
  }