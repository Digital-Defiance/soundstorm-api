import { ObjectId } from "mongoose";
import { BaseModel } from "./baseModel";

/*
{
    "_id" : NumberInt(42),
    "sound_info_id" : NumberInt(14),
    "category_id" : NumberInt(3)
}
*/

// Define the KSoundInfoCategory interface for Komplete Sound Info Category, extending the Mongoose Document interface
export interface KSoundInfoCategory extends BaseModel {
    sound_info_id: number; // Unique identifier for the Komplete Sound Info Category
    category_id: number; // Unique identifier for the Komplete Sound Info Category
  }