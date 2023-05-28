export interface IEnvironment {
    production: boolean;
    apiBaseUrl: string;
    siteUrl: string;
    nodePort: number;
    realm: {
        appId: string;
        apiKey?: string
    };
    mongoUri: string;
}