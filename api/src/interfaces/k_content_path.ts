import { ObjectId } from "mongoose";
import { BaseModel } from "./baseModel";

/*
{
    "_id" : NumberInt(1),
    "id" : NumberInt(1),
    "path" : "D:\\Native Instruments\\Content\\40s Very Own - Drums\\",
    "content_type" : NumberInt(2),
    "alias" : "40s Very Own - Drums",
    "state" : NumberInt(1),
    "scanned_at" : 1681997019000000000.0,
    "product_id" : "KE8",
    "product_version" : NumberInt(16777216),
    "updated_at" : 1682040752000000000.0,
    "created_at" : 1681993966000000000.0,
    "visible" : NumberInt(1),
    "upid" : "ff06c804-8b3c-4d02-8271-577bb34c2cab",
    "monitored" : NumberInt(0)
}
*/

// Define the KContentPath interface for Komplete Content Path, extending the Mongoose Document interface
export interface KContentPath extends BaseModel {
    id: number; // Unique identifier for the Komplete Content Path
    path: string; // File system path to the content
    content_type: number; // Content type identifier
    alias: string; // Alias for the content path
    state: number; // State of the content (e.g., active, inactive)
    scanned_at: number; // Timestamp for when the content path was last scanned
    product_id: string; // Identifier of the related product
    product_version: number; // Version number of the related product
    updated_at: number; // Timestamp for when the Komplete Content Path was last updated
    created_at: number; // Timestamp for when the Komplete Content Path was created
    visible: number; // Visibility flag for the content path (e.g., 1 for visible, 0 for hidden)
    upid: string; // Unique product identifier
    monitored: number; // Monitoring flag (e.g., 1 for monitored, 0 for not monitored)
  }