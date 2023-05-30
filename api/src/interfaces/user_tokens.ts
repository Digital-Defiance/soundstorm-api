import { BSON } from "realm";
import { BaseModel } from "./baseModel";

export interface UserToken extends BaseModel {
    realm_user_id: BSON.ObjectId; // Realm ID
    token: string; // Display name of the user
    expiration: Date; // Given name of the user
}