import Realm, { BSON } from 'realm';
import { IMongo } from './interfaces/mongo';
import { Mongo } from './db';
import mongoose from 'mongoose';
import { User } from './interfaces/user';
import { nameToModel } from './db_functions';
import { UserToken } from './interfaces/user_tokens';
import { pbkdf2, randomBytes } from 'crypto';

const _PBKDF_ROUNDS_ = 100000;

let mongoDB: mongoose.Connection;
Mongo.connect((c: mongoose.Connection) => {
    mongoDB = c;
}, (err) => {
    console.error(err);
});

export async function refreshUser(email: string, user?: Realm.User): Promise<{ user: Realm.User, token: string } | false> {
    if (!user) {
        return false;
    }
    await user.refreshCustomData();
    const token = user.accessToken;
    if (token === null) {
        return false;
    }
    await addOrUpdateUserToken(email, user, token);
    return {user: user, token: token};
}

export async function addOrUpdateUser(email: string, password: string, user: Realm.User) {
    email = email.trim().toLowerCase();
    password = password.trim();
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return false;
    }
    const User = nameToModel<User>('User');
    const userDoc = await User.findOne({ 
        $or: [
          { email: email },
          { id: user.id }
        ]
      });

    // hash the password with pbkdf2
    const passwordSalt: string = randomBytes(16).toString('hex');
    pbkdf2(password, passwordSalt, _PBKDF_ROUNDS_, 64, 'sha512', async (err, derivedKey) => {
        if (err) {
            console.error(err);
            return;
        }

        const passwordHash = derivedKey.toString('hex');

        if (userDoc === null) {
            const newUser = new User({
                id: user.id,
                email: email,
                passwordHash: passwordHash,
                passwordSalt: passwordSalt
            });
            await newUser.save();
        } else if (userDoc.id !== user.id || userDoc.email !== email) {
            userDoc.id = user.id;
            userDoc.email = email;
            userDoc.passwordHash = passwordHash;
            userDoc.passwordSalt = passwordSalt;
            await userDoc.save();
        }
    });
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return undefined;
    }
    const User = nameToModel<User>('User');
    let returnValue: User | undefined = undefined;
    User.findOne({ email: email }, (err: any, user: User) => {
        if (err) {
            console.error(err);
            return;
        }
        returnValue = user;
    });
    return returnValue;
}

export async function findUserByRealmId(realmId: string): Promise<User | undefined> {
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return undefined;
    }
    const User = nameToModel<User>('User');
    let returnValue: User | undefined = undefined;
    User.findOne({ id: realmId }, (err: any, user: User) => {
        if (err) {
            console.error(err);
            return;
        }
        returnValue = user;
    });
    return returnValue;
}

export async function findUserByMongoId(id: BSON.ObjectId): Promise<User | undefined> {
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return undefined;
    }
    const User = nameToModel<User>('User');
    let returnValue: User | undefined = undefined;
    User.findOne({ _id: id }, (err: any, user: User) => {
        if (err) {
            console.error(err);
            return;
        }
        returnValue = user;
    });
    return returnValue;
}

export async function addOrUpdateUserToken(email: string, user: Realm.User, token: string) {
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return false;
    }
    const UserToken = nameToModel<UserToken>('UserToken');
    // if the token exists, extend the expiration date
    const userTokenDoc = await UserToken.findOne({
        realm_user_id: user.id,
        token: token
    });
    if (userTokenDoc === null) {
        const newUserToken = new UserToken({
            realm_user_id: user.id,
            token: token,
            expiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        });
        await newUserToken.save();
    } else {
        userTokenDoc.expiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await userTokenDoc.save();
    }
}

export async function expireUserTokens(userId?: BSON.ObjectId) {
    const mongo = Mongo.getInstance();
    if (mongo === undefined) {
        return false;
    }
    const UserToken = nameToModel<UserToken>('UserToken');
    if (userId) {
        await UserToken.deleteMany({
            realm_user_id: userId,
            expiration: {
                $lt: new Date()
            }
        });
    } else {
        await UserToken.deleteMany({
            expiration: {
                $lt: new Date()
            }
        });
    }
}

export async function tokenToUser(token: string): Promise<User | undefined> {
    const UserToken = nameToModel<UserToken>('UserToken');
    const userTokenDoc = await UserToken.findOne({
        token: token,
        expiration: {
            $gt: new Date()
        }
    });
    if (userTokenDoc === null) {
        return undefined;
    }
    const userDoc = await findUserByRealmId(userTokenDoc.realm_user_id);
    if (userDoc === undefined) {
        return undefined;
    }
    return userDoc;
}