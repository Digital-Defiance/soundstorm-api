import { ObjectId } from "mongoose";
import { BSON } from 'mongodb';
import { BaseModel } from "./baseModel";

/*
{
    "_id" : NumberInt(4),
    "id" : NumberInt(4),
    "bcvendor" : "",
    "entry1" : "Abbey Road 50s Drummer",
    "entry2" : "AR50s Autumn Kit - Full",
    "entry3" : null
}
*/
// Define the KBankChain interface for Komplete Bank Chain
export interface KBankChain extends BaseModel {
    id: number; // Unique identifier for the Komplete Bank Chain
    entry1: string; // Name of the Komplete Bank Chain
    entry2?: string; // Name of the Komplete Bank Chain
    entry3?: string; // Name of the Komplete Bank Chain
    bcvendor: string; // Name of the Komplete Bank vendor
    bcVendorId?: ObjectId; // Optional, internal Foreign key referencing the related Vendor entity
  }