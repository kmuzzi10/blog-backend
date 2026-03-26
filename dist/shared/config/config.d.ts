export declare const config: {
    nodeEnv: string;
    port: number;
    isDevelopment: boolean;
    isProduction: boolean;
    mongodbUri: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshSecret: string;
    jwtRefreshExpiresIn: string;
    blobReadWriteToken: string;
    rateLimitWindowMs: number;
    rateLimitMax: number;
    logLevel: string;
    allowedOrigins: string[];
    bcryptSaltRounds: number;
    maxFileSize: number;
    allowedImageTypes: string[];
    allowedVideoTypes: string[];
};
export type Config = typeof config;
//# sourceMappingURL=config.d.ts.map