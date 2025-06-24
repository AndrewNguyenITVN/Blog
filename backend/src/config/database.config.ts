import { registerAs } from '@nestjs/config';

export const DatabaseConfig = registerAs('database', () => ({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'blog_user',
    password: process.env.DB_PASSWORD || 'blog_password',
    name: process.env.DB_NAME || 'blog_db',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
})); 