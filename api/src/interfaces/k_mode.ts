import { ObjectId } from "mongoose";
import { BaseModel } from "./baseModel";

/*
{
    "_id" : NumberInt(1),
    "id" : NumberInt(1),
    "name" : "Acoustic"
}
*/

// Define the KMode interface for Komplete Mode, extending the Mongoose Document interface
export interface KMode extends BaseModel {
    id: number; // Unique identifier for the Komplete Mode
    name: string; // Name of the Komplete Mode
  }