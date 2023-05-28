import { Schema } from 'mongoose';
import { Product } from "../interfaces/product";
import { registerModel } from "../db_functions";

// Mongoose schema for the section
export const ProductSchema = new Schema<Product>({
  _id: Schema.Types.ObjectId,
  name: String,
  highest_version: Number,
  created_by: { type: Schema.Types.ObjectId, ref: 'User' }, // ID of the user who created the section
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' }, // ID of the user who last updated the section
  owner_id: { type: Schema.Types.ObjectId, ref: 'User' }, // ID of the user who owns the section
}, { timestamps: true }); // Timestamps for when the section was created and last updated

// Mongoose model for the section
export const ProductModel = registerModel<Product>('Product', ProductSchema);
