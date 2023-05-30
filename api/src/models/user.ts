import { Schema } from 'mongoose';
import { registerModel } from '../db_functions';
import { User } from '../interfaces/user';

export const UserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  realm_id: { type: Schema.Types.ObjectId, unique: true },
  displayName: String,
  givenName: String,
  surname: String,
  email: { type: String, unique: true },
  passwordHash: String,
  passwordSalt: String
});

export const UserModel = registerModel<User>('User', UserSchema);
