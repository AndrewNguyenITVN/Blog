import { registerAs } from '@nestjs/config';

export const AppConfig = registerAs('app', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3001,
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

    // File Upload
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    uploadDest: process.env.UPLOAD_DEST || './uploads',

    // Swagger
    swaggerTitle: process.env.SWAGGER_TITLE || 'Blog API',
    swaggerDescription: process.env.SWAGGER_DESCRIPTION || 'Personal Blog API Documentation',
    swaggerVersion: process.env.SWAGGER_VERSION || '1.0',
})); 