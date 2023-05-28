import { Schema } from 'mongoose';
import { registerModel } from '../db_functions';
import { User } from '../interfaces/user';

export const UserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  displayName: String,
  givenName: String,
  surname: String,
  email: String,
  passwordHash: String,
  passwordSalt: String
});

export const UserModel = registerModel<User>('User', UserSchema);
