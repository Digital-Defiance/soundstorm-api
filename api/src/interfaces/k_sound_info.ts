import { ObjectId } from "mongoose";
import { BaseModel } from "./baseModel";

/*
{
    "_id" : NumberInt(1),
    "id" : NumberInt(1),
    "version" : NumberInt(0),
    "name" : "40s Very Own - Drums",
    "author" : "Native Instruments",
    "comment" : null,
    "vendor" : "Native Instruments",
    "color" : NumberInt(0),
    "tempo" : NumberInt(0),
    "device_type_flags" : NumberInt(1),
    "bank_chain_id" : NumberInt(1),
    "content_path_id" : NumberInt(1),
    "file_name" : "D:\\Native Instruments\\Content\\40s Very Own - Drums\\Instruments\\40s Very Own - Drums.nki",
    "file_ext" : "nki",
    "uuid" : "4b9255d2-2db4-0ef4-ca14-7bd0bca7fb9d",
    "file_size" : NumberInt(152459),
    "mod_date" : 1651242086000000000.0,
    "updated_at" : 1681994330000000000.0,
    "created_at" : 1681994330000000000.0,
    "hidden_for" : NumberInt(1),
    "virtualBC" : NumberInt(0),
    "favorite_id" : "10222743c8ecceec03de3b4f86c84225"
}
*/

// Define the KSoundInfo interface for Komplete Sound Info, extending the Mongoose Document interface
export interface KSoundInfo extends BaseModel {
    id: number; // Unique identifier for the Komplete Sound Info
    version: number; // Version number of the Komplete Sound Info
    name: string; // Name of the Komplete Sound Info
    author: string; // Author of the Komplete Sound Info
    comment: string|null; // Comment for the Komplete Sound Info
    vendor: string; // Vendor of the Komplete Sound Info
    color: number; // Color of the Komplete Sound Info
    tempo: number; // Tempo of the Komplete Sound Info
    device_type_flags: number; // Device type flags for the Komplete Sound Info
    bank_chain_id: number; // Bank chain identifier for the Komplete Sound Info
    content_path_id: number; // Content path identifier for the Komplete Sound Info
    file_name: string; // File name of the Komplete Sound Info
    file_ext: string; // File extension of the Komplete Sound Info
    uuid: string; // UUID of the Komplete Sound Info
    file_size: number; // File size of the Komplete Sound Info
    mod_date: number; // Modification date of the Komplete Sound Info
    updated_at: number; // Timestamp for when the Komplete Sound Info was last updated
    created_at: number; // Timestamp for when the Komplete Sound Info was created
    hidden_for: number; // Hidden for flag for the Komplete Sound Info
    virtualBC: number; // Virtual bank chain flag for the Komplete Sound Info
    favorite_id: string; // Favorite identifier for the Komplete Sound Info
}