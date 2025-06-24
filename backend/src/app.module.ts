import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { DatabaseConfig } from '@config/database.config';
import { AppConfig } from '@config/app.config';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { PostsModule } from '@modules/posts/posts.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { TagsModule } from '@modules/tags/tags.module';
import { CommentsModule } from '@modules/comments/comments.module';
import { FilesModule } from '@modules/files/files.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            load: [AppConfig, DatabaseConfig],
        }),

        // Database
        TypeOrmModule.forRootAsync({
            inject: [DatabaseConfig.KEY],
            useFactory: (databaseConfig: ReturnType<typeof DatabaseConfig>) => ({
                type: 'postgres',
                host: databaseConfig.host,
                port: databaseConfig.port,
                username: databaseConfig.username,
                password: databaseConfig.password,
                database: databaseConfig.name,
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: databaseConfig.synchronize,
                logging: databaseConfig.logging,
                migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
                cli: {
                    migrationsDir: 'src/database/migrations',
                },
            }),
        }),

        // Cache
        CacheModule.register({
            isGlobal: true,
            store: redisStore,
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD,
            ttl: 300, // 5 minutes
        }),

        // Rate limiting
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: parseInt(process.env.THROTTLE_TTL) || 60000,
                limit: parseInt(process.env.THROTTLE_LIMIT) || 100,
            },
            {
                name: 'long',
                ttl: 300000, // 5 minutes
                limit: 500,
            },
        ]),

        // Feature modules
        AuthModule,
        UsersModule,
        PostsModule,
        CategoriesModule,
        TagsModule,
        CommentsModule,
        FilesModule,
    ],
})
export class AppModule { } 