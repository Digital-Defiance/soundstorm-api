import Realm from 'realm';

// place holder for the data
const emailUserMap: Map<string, Realm.User> = new Map();
const emailTokenMap: Map<string, string> = new Map();
const emailTokenExpirationMap: Map<string, number> = new Map();

const tokenSession = 3600;

// TODO: put the maps into Mongo

export async function setUser(email: string, user: Realm.User, token: string): Promise<string | false> {
  console.log('Adding user:::::', email, user);
  emailUserMap.set(email, user);
  emailTokenMap.set(email, token);
  emailTokenExpirationMap.set(email, Date.now() + tokenSession);
  return refreshUser(email);
}

export function getUserByEmail(email: string): Realm.User | undefined {
    return emailUserMap.get(email);
}

export function getTokenByEmail(email : string): string | undefined {
    return emailTokenMap.get(email);
}

export async function refreshUser(email: string): Promise<string | false> {
    const user = emailUserMap.get(email);
    if (!user) {
        return false;
    }
    await user.refreshCustomData();
    const token = user.accessToken;
    if (!token) {
        return false;
    }
    emailTokenMap.set(email, token);
    emailTokenExpirationMap.set(email, Date.now() + tokenSession);
    return token;
}

export function emailTokenValidate(email: string, token: string): boolean {
    return tokenIsNotExpired(token, email);
}

export function tokenToEmail(token: string): string | undefined {
    let foundEmail = undefined;
    emailTokenMap.forEach(([email, storedToken]) => {
        if (storedToken === token) {
            foundEmail = email;
            return true;
        }
    });
    return foundEmail;
}

export function tokenIsNotExpired(token: string, email?: string): boolean {
    if (email === undefined) {
        email = tokenToEmail(token);
    }
    if (!email) {
        return false;
    }
    const storedToken = emailTokenMap.get(email);
    return storedToken === token && Date.now() < (emailTokenExpirationMap.get(email) ?? 0);
}

export async function tokenValidateAndRefresh(email: string, token: string): Promise<string | false>  {
    const storedToken = emailTokenMap.get(email);
    if (storedToken !== token) {
        return false;
    }
    return await refreshUser(email);
}