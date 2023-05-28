import { ObjectId } from "mongoose";
import { Section } from "./section";
import { BaseModel } from "./baseModel";

export interface Story extends BaseModel {
    title: string; // Title of the story
    description: string; // Description of the story
    sections: Section[]; // Sections associated with the story
    section_ids: ObjectId[]; // IDs of the sections associated with the story
    created_by: ObjectId; // ID of the user who created the story
    created_at: number; // Timestamp of when the story was created
    updated_at: number; // Timestamp of when the story was last updated
    updated_by: ObjectId; // ID of the user who last updated the story
    owner_id: ObjectId; // ID of the user who owns the story
  }