import Realm, { BSON } from 'realm';
import { Mongo } from './db';
import mongoose from 'mongoose';
import { User } from './interfaces/user';
import { UserTokensModel } from './models/user_tokens';
import { pbkdf2, randomBytes, createHash } from 'crypto';
import { UserModel } from './models/user';
import { _PBKDF_ROUNDS_ } from './auth';
import { environment } from './environment';
import { RealmApp } from './realmApp';
import { promisify } from 'util';

export function emailToHash(email: string): string {
    // use crypto to sha256 hash the email
    const hash = createHash('sha256');
    hash.update(email);
    return hash.digest('hex');
}

export async function refreshUser(email: string, user?: Realm.User): Promise<{ user: Realm.User, token: string } | false> {
    if (!user) {
        return false;
    }
    await user.refreshCustomData();
    const token = user.accessToken;
    if (token === null) {
        console.error('No access token generated');
        return false;
    }
    await addOrUpdateUserToken(email, user, token);
    return {user: user, token: token};
}

export async function addOrUpdateUser(email: string, password: string, user: Realm.User): Promise<User | undefined> {
    email = email.trim().toLowerCase();
    password = password.trim();
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return undefined;
    }
    const userDoc = await UserModel.findOne({ 
        $or: [
          { email: email },
          { realm_id: user.id }
        ]
      });

    // hash the password with pbkdf2
    const passwordSalt: string = randomBytes(16).toString('hex');
    console.log("generating password hash")
    let u: User | undefined;
    const pbkdf2Promise = promisify(pbkdf2);

    try {
        const derivedKey = await pbkdf2Promise(password, passwordSalt, _PBKDF_ROUNDS_, 64, 'sha512');
        const passwordHash = derivedKey.toString('hex');

        if (userDoc === null) {
            console.log("creating new user")
            const newUser = new UserModel({
                _id: new mongoose.Types.ObjectId(),
                realm_id: user.id,
                email: email,
                passwordHash: passwordHash,
                passwordSalt: passwordSalt
            });
            const result = await newUser.save();
            console.log('saved user', result, newUser);
            return result;
        } else if (userDoc.realm_id.toHexString() !== user.id || userDoc.email !== email) {
            console.log("updating user")
            userDoc.realm_id = new BSON.ObjectID(user.id);
            userDoc.email = email;
            userDoc.passwordHash = passwordHash;
            userDoc.passwordSalt = passwordSalt;
            const result = await userDoc.save();
            console.log('updated user', result, userDoc);
            return result;
        } else {
            console.log("user already exists and does not need to be updated")
            return userDoc;
        }
    } catch (err) {
        console.error(err);
        return undefined;
    }
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return undefined;
    }
    let returnValue: User | undefined = undefined;
    UserModel.findOne({ email: email }, (err: any, user: User) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('findUserByEmail', user);
        returnValue = user;
    });
    return returnValue;
}

export async function findUserByRealmId(realmId: BSON.ObjectId): Promise<User | undefined> {
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return undefined;
    }
    const user = await UserModel.findOne({ realm_id: realmId }).exec();
    console.log('findUserByRealmId', user);
    return user ?? undefined;
}

export async function findUserByMongoId(id: BSON.ObjectId): Promise<User | undefined> {
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return undefined;
    }
    let returnValue: User | undefined = undefined;
    const user = await UserModel.findOne({ _id: id }).exec();
    console.log('findUserByMongoId', user);
    return user ?? undefined;
}

export async function addOrUpdateUserToken(email: string, user: Realm.User, token: string) {
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return false;
    }
    // if the token exists, extend the expiration date
    const userTokenDoc = await UserTokensModel.findOne({
        realm_user_id: user.id,
        token: token
    });
    if (userTokenDoc === null) {
        console.log("creating new token");
        const newUserToken = new UserTokensModel({
            _id: new mongoose.Types.ObjectId(),
            realm_user_id: user.id,
            token: token,
            expiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        });
        await newUserToken.save();
    } else {
        console.log("updating token");
        userTokenDoc.expiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await userTokenDoc.save();
    }
}

export async function expireUserTokens(userId?: BSON.ObjectId) {
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return false;
    }
    if (userId) {
        await UserTokensModel.deleteMany({
            realm_user_id: userId,
            expiration: {
                $lt: new Date()
            }
        });
    } else {
        await UserTokensModel.deleteMany({
            expiration: {
                $lt: new Date()
            }
        });
    }
}

export async function tokenToUser(token: string): Promise<User | undefined> {
    const userTokenDoc = await UserTokensModel.findOne({
        token: token,
        expiration: {
            $gt: new Date()
        }
    });
    if (userTokenDoc === null) {
        console.warn("token not found");
        return undefined;
    }
    const userDoc = await findUserByRealmId(userTokenDoc.realm_user_id);
    if (userDoc === undefined) {
        console.warn("user not found");
        return undefined;
    }
    return userDoc;
}