import { BaseModel } from "./baseModel";

export interface User extends BaseModel {
    id: string; // Realm ID
    displayName: string; // Display name of the user
    givenName: string; // Given name of the user
    surname: string; // Surname of the user
    email: string; // Email of the user
    passwordHash: string; // Hash of the user's password
    passwordSalt: string; // Salt used to hash the user's password
  }