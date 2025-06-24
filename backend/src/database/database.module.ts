import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Comment } from '../entities/comment.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: +configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [User, Post, Category, Tag, Comment],
                migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
                synchronize: configService.get('NODE_ENV') === 'development',
                logging: configService.get('NODE_ENV') === 'development',
                ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule { } 