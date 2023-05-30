import Realm from 'realm';
import express from 'express';

import { RealmApp } from './realmApp';
import { Request, Response } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { addOrUpdateUser, addOrUpdateUserToken, refreshUser, tokenToUser } from './user.service';
import { User } from './interfaces/user';

export const _PBKDF_ROUNDS_ = 100000;

declare global {
    namespace Express {
        interface Request {
            user?: Realm.User;
        }
    }
}

export async function getValidAccessToken(user: Realm.User, next: (token: string) => void, err: (error: string) => void) {
    try {
        if (!user) {
            return err('No user provided');
        }
        // An already logged in user's access token might be stale. To
        // guarantee that the token is valid, refresh it if necessary.
        await user.refreshCustomData();
        const tokenString: string = user.accessToken ?? '';
        if (!tokenString || tokenString === '') {
            return err('No access token provided');
        }
        await addOrUpdateUserToken(user.id, user, tokenString);
        next(tokenString);
    } catch (error) {
        console.error('Error in getValidAccessToken:', error);
        return err('Error getting access token');
    }
}

export function authenticateEmail(email: string, password: string, next: (realmUser: Realm.User, user: User, token: string) => void, err: (error: string) => void): void {
    try {
        const credentials = Realm.Credentials.emailPassword(
            email.trim().toLowerCase(),
            password.trim()
        );
        RealmApp.logIn(credentials).then(async (realmUser) => {
            if (!realmUser) {
                err('Invalid email or password');
                return;
            }
            addOrUpdateUser(email, password, realmUser).then((u) => {
                if (!u) {
                    err('Error during authentication');
                    return;
                }
                const token = realmUser.accessToken ?? '';
                if (token) {
                    addOrUpdateUserToken(email, realmUser, token).then(() => {
                        console.log('Added or updated user token, calling next');
                        next(realmUser, u, token);
                    }).catch((error) => {
                        console.error('Error in authenticateEmail:', error);
                        err('Error during authentication');
                    });
                    return;
                }
                next(realmUser, u, token);
            });
        }).catch((error) => {
            console.error('Error in authenticateEmail:', error);
            err('Error during authentication');
        });
    } catch (error) {
        console.error('Error in authenticateEmail:', error);
        return err('Error during authentication');
    }
}

export function validateAuth(req: Request, res: Response, next: (req: Request, res: Response, realmUser?: Realm.User, user?: User) => void, err: ((arg0: string) => void)): void {
    try {
        console.log('validateAuth called!')
        if (req.body && req.body.email && req.body.password) {
            console.log('Email and password provided');
            const email = req.body.email;
            const password = req.body.password;
            authenticateEmail(email, password, async (realmUser: Realm.User, user: User, token) => {
                //res.set('Authorization', `Bearer ${token}`);
                next(req, res, realmUser, user);
            }, (error) => {
                res.status(401).send('Unauthorized');
            });
            return;
        }
        // authorization token
        const authorization = req.headers.authorization;
        if (!authorization) {
            console.log('No authorization header');
            res.status(401).send('Unauthorized');
            return;
        }
        console.log('Authorization:', authorization);
        const bearerAuth = authorization.split(' ');
        if (bearerAuth.length !== 2 || bearerAuth[0] !== 'Bearer' || !bearerAuth[1]) {
            console.log('Invalid authorization header');
            res.status(401).send('Unauthorized');
        }
        const token = bearerAuth[1];
        console.log('Token:', token);
        console.log('calling tokenToUser')
        tokenToUser(token).then((user: User | undefined) => {
            if (!user) {
                console.log('No user found for token');
                res.status(401).send('Unauthorized');
            } else {
                console.log('User found for token, calling next');
                next(req, res, undefined, user)
            }
        }, (error) => {
            console.log('Error in tokenToUser:', error);
            res.status(401).send('Unauthorized');
        });
    } catch (error) {
        console.error('Error in validateAuth:', error);
        res.status(500).send('Server error');
        return err('Server error during validation');
    }
}