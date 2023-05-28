import { BaseModel } from "./baseModel";

export interface UserToken extends BaseModel {
    realm_user_id: string; // Realm ID
    token: string; // Display name of the user
    expiration: Date; // Given name of the user
}