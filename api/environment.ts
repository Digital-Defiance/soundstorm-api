import path from 'path';
import { existsSync } from 'fs';

export const defaultPort = 2222;

/* we need to be able to be able to run on windows, wsl (ubuntu), and linux/mac
 * it seems on windows the process.cwd() works, but on ubuntu it doesn't
 */ 
const cwd_1 = path.resolve(process.cwd());
const cwd_2 = path.resolve(__dirname);
const cwd = cwd_1.length > cwd_2.length ? cwd_1 : cwd_2;
export const _API_DIR_ = cwd_1.length > cwd_2.length ? cwd_1 : cwd_2;
export const _REACT_DIR_ = path.join(cwd, '../soundstorm-react/build');
if (!existsSync(_API_DIR_) || !existsSync(_REACT_DIR_)) {
    console.error('API or React directory not found');
    process.exit(1);
}

export interface IEnvironment {
    production: boolean;
    apiBaseUrl: string;
    siteUrl: string;
    nodePort: number;
    realm: {
        appId: string;
    };
}

export const environment: IEnvironment = {
    production: process.env.NODE_ENV === 'production',
    apiBaseUrl: process.env.API_BASE_URL || process.env.NODE_ENV === 'production' ? 'https://soundstorm.info/api' : `http://localhost:${defaultPort}/api`,
    siteUrl: process.env.SITE_URL || process.env.NODE_ENV === 'production' ? 'https://soundstorm.info' : `http://localhost:${defaultPort}`,
    nodePort: parseInt(process.env.PORT ? process.env.PORT : defaultPort.toString(), 10) || defaultPort,
    realm: {
        appId: process.env.REALM_APP_ID || (process.env.NODE_ENV === 'production' ? 'soundstorm-wdkhs' : 'soundstorm-dev-udikj'),
    }
};