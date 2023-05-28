import { Schema } from 'mongoose';
import { registerModel } from '../db_functions';
import { UserToken } from '../interfaces/user_tokens';

export const UserTokensSchema = new Schema({
  _id: Schema.Types.ObjectId,
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  token: String,
  expiration: Date,
});

export const UserTokensModel = registerModel<UserToken>('User', UserTokensSchema);
