import { Schema } from 'mongoose';
import { registerModel } from '../db_functions';
import { Vendor} from '../interfaces/vendor';

export const VendorSchema = new Schema<Vendor>({
  _id: Schema.Types.ObjectId,
  name: { type: String, required: true, unique: true },
});

export const VendorModel = registerModel<Vendor>('Vendor', VendorSchema);
