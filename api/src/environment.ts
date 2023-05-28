import path from 'path';
import { existsSync } from 'fs';
import { IEnvironment } from './interfaces/environment';

export const defaultPort = 2222;
const _STOP_ON_WARNINGS_ = false;

/* we need to be able to be able to run on windows, wsl (ubuntu), and linux/mac
 * it seems on windows the process.cwd() works, but on ubuntu it doesn't
 */ 
const cwd_1 = path.resolve(process.cwd());
const cwd_2 = path.resolve(__dirname);
const cwd = cwd_1.length > cwd_2.length ? cwd_1 : cwd_2;
export const _CWD_ = cwd_1.length > cwd_2.length ? cwd_1 : cwd_2;
export const _API_DIR_ = (_CWD_.endsWith('src')) ? path.join(_CWD_, '../') : _CWD_;
export const _REACT_DIR_ = path.join(cwd, '../../soundstorm-react/build');
if (!existsSync(_API_DIR_) || !existsSync(_REACT_DIR_)) {
    console.error('API or React directory not found');
    process.exit(1);
}

export const environment: IEnvironment = {
    production: process.env.NODE_ENV === 'production',
    apiBaseUrl: process.env.API_BASE_URL || process.env.NODE_ENV === 'production' ? 'https://soundstorm.info/api' : `http://localhost:${defaultPort}/api`,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/soundstorm',
    siteUrl: process.env.SITE_URL || process.env.NODE_ENV === 'production' ? 'https://soundstorm.info' : `http://localhost:${defaultPort}`,
    nodePort: parseInt(process.env.PORT ? process.env.PORT : defaultPort.toString(), 10) || defaultPort,
    realm: {
        appId: process.env.REALM_APP_ID || (process.env.NODE_ENV === 'production' ? 'soundstorm-wdkhs' : 'soundstorm-dev-udikj'),
        apiKey: process.env.REALM_API_KEY
    }
};

let warnings = false;
if (!environment.realm.appId) {
    warnings = true;
    console.warn('Realm app ID not found');
}
if (!environment.realm.apiKey) {
    warnings = true;
    console.warn('Realm API key not found');
}
if (!environment.mongoUri) {
    warnings = true;
    console.warn('Mongo URI not found');
}
if (_STOP_ON_WARNINGS_ && warnings) {
    process.exit(1);
}