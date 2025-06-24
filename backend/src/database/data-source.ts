import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Comment } from '../entities/comment.entity';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST') || 'localhost',
    port: +configService.get('DB_PORT') || 5432,
    username: configService.get('DB_USERNAME') || 'blog_user',
    password: configService.get('DB_PASSWORD') || 'blog_password',
    database: configService.get('DB_DATABASE') || 'blog_db',
    entities: [User, Post, Category, Tag, Comment],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    synchronize: false,
    logging: false,
}); 