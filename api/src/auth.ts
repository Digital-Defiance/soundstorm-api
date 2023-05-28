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
    if (!user) {
        err('No user provided');
    }
    // An already logged in user's access token might be stale. To
    // guarantee that the token is valid, refresh it if necessary.
    await user.refreshCustomData();
    const tokenString: string = user.accessToken ?? '';
    if (!tokenString || tokenString === '') {
        err('No access token provided');
    }
    await addOrUpdateUserToken(user.id, user, tokenString);
    next(tokenString);
}

export async function authenticateEmail(email: string, password: string, next: (user: Realm.User, token: string) => void, err: (error: string) => void) {
    const credentials = Realm.Credentials.emailPassword(
        email.trim().toLowerCase(),
        password.trim()
    );
    const user = await RealmApp.logIn(credentials);
    if (!user) {
        err('Invalid email or password');
        return;
    }
    await addOrUpdateUser(email, password, user);
    const token = user.accessToken ?? '';
    if (token) {
        await addOrUpdateUserToken(email, user, token);
    }
    return next(user, token);
}

export async function validateAuth(req: Request<{}, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>, next: (req: Request, res: Response, token: string) => void, err: ((arg0: string) => void)): Promise<void> {
    console.log('validateAuth called!')
    if (req.body && req.body.email && req.body.password) {
        const email = req.body.email;
        const password = req.body.password;
        await authenticateEmail(email, password, async (user, token) => {
            res.set('Authorization', `Bearer ${token}`);
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
        err('No Authorization header provided')
        return;
    }
    const bearerAuth = req.headers.authorization.split(' ');
    if (bearerAuth.length !== 2 || bearerAuth[0] !== 'Bearer' || !bearerAuth[1]) {
        res.status(401).send('Unauthorized');
        err('Invalid Authorization header provided')
        return;
    }
    const user: User | undefined = await tokenToUser(bearerAuth[1]);
    if (!user) {
        res.status(401).send('Unauthorized');
        err('Invalid token provided')
        return;
    }

    //res.set('Authorization', `Bearer ${bearerAuth[1]}`);
    next(req, res, bearerAuth[1]);
}