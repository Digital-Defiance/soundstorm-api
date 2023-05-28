import { ObjectId } from "mongoose";
import { BaseModel } from "./baseModel";

// Interface for the section schema
export interface Product extends BaseModel {
    product_id: number; // original product id
    name: string; // Name of the product
    author: string; // Author of the product
    vendor: string; // Vendor of the product
    k_sound_info_id: number; // ID of the KSoundInfo associated with the product
    vendor_id: number; // ID of the KMode associated with the product
    highest_version: number; // Highest version of the product
    created_by: ObjectId; // ID of the user who created the section
    created_at: number; // Timestamp of when the section was created
    updated_at: number; // Timestamp of when the section was last updated
    updated_by: ObjectId; // ID of the user who last updated the section
    owner_id: ObjectId; // ID of the user who owns the section
  }