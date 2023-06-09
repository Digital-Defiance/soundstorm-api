import { BSON } from "mongodb";

export interface BaseModel extends Document {
    _id?: BSON.ObjectId; // Optional, automatically generated by MongoDB
}