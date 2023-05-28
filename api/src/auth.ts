import Realm from 'realm';
import express from 'express';

import { RealmApp } from './realmApp';
import { Request, Response } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { addOrUpdateUser, addOrUpdateUserToken, refreshUser, tokenToUser } from './user.service';
import { User } from './interfaces/user';

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

export async function authenticateEmail(email: string, password: string, next: (user: Realm.User, token: string) => void, err: (error: string) => void) {
    try {
        const credentials = Realm.Credentials.emailPassword(
            email.trim().toLowerCase(),
            password.trim()
        );
        const user = await RealmApp.logIn(credentials);
        if (!user) {
            return err('Invalid email or password');
        }
        await addOrUpdateUser(email, password, user);
        const token = user.accessToken ?? '';
        if (token) {
            await addOrUpdateUserToken(email, user, token);
        }
        return next(user, token);
    } catch (error) {
        console.error('Error in authenticateEmail:', error);
        return err('Error during authentication');
    }
}

export async function validateAuth(req: Request<{}, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>, next: (req: Request, res: Response, token: string) => void, err: ((arg0: string) => void)): Promise<void> {
    try {
        console.log('validateAuth called!')
        if (req.body && req.body.email && req.body.password) {
            const email = req.body.email;
            const password = req.body.password;
            await authenticateEmail(email, password, async (user, token) => {
                //res.set('Authorization', `Bearer ${token}`);
                next(req, res, token);
            }, (error) => {
                res.status(401).send('Unauthorized');
                err(error);
            });
            return;
        }
        // authorization token
        if (!req.headers.authorization) {
            res.status(401).send('Unauthorized');
            return err('No Authorization header provided')
        }
        const bearerAuth = req.headers.authorization.split(' ');
        if (bearerAuth.length !== 2 || bearerAuth[0] !== 'Bearer' || !bearerAuth[1]) {
            res.status(401).send('Unauthorized');
            return err('Invalid Authorization header provided')
        }
        const user: User | undefined = await tokenToUser(bearerAuth[1]);
        if (!user) {
            res.status(401).send('Unauthorized');
            return err('Invalid token provided');
        }
        next(req, res, bearerAuth[1]);
    } catch (error) {
        console.error('Error in validateAuth:', error);
        res.status(500).send('Server error');
        return err('Server error during validation');
    }
}