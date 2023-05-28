import { BSON } from "mongodb";
import { BaseModel } from "./baseModel";

/*
{
    "_id" : NumberInt(1),
    "id" : NumberInt(1),
    "category" : "Drums",
    "subcategory" : "Kit",
    "subsubcategory" : null
}
*/
// Define the KCategory interface for Komplete Category, extending the Mongoose Document interface
export interface KCategory extends BaseModel {
    id: number; // Unique identifier for the Komplete Category
    category: string; // Name of the Komplete Category
    subcategory?: string; // Name of the Komplete Subcategory
    subsubcategory?: string; // Name of the Komplete Subsubcategory
  }