import Realm from 'realm';
import express from 'express';
import { getUserByEmail, tokenToEmail, tokenValidateAndRefresh } from './user.service';

import { RealmApp } from './realmApp';
import { Request, Response } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

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
    next(tokenString);
}

export async function authenticateEmail(email: string, password: string, next: (user: Realm.User) => void, err: (error: string) => void) {
    const credentials = Realm.Credentials.emailPassword(
        email.trim().toLowerCase(),
        password.trim()
    );
    const user = await RealmApp.logIn(credentials);
    if (!user) {
        err('Invalid email or password');
        return;
    }
    return next(user);
}

export async function validateAuth(req: Request<{}, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>, next: (req: Request, res: Response, token: string) => void, err: ((arg0: string) => void)): Promise<void> {
    console.log('validateAuth called!')
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
    const email = tokenToEmail(bearerAuth[1]);
    if (!email) {
        res.status(401).send('Unauthorized');
        err('Invalid token provided')
        return;
    }
    const newToken = await tokenValidateAndRefresh(email, bearerAuth[1]);
    if (!newToken) {
        res.status(401).send('Unauthorized');
        err('Invalid token provided')
        return;
    }
    const user = getUserByEmail(email);
    req.user = user;
    res.set('Authorization', `Bearer ${newToken}`);
    next(req, res, newToken);
}