import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 50 })
    name: string;

    @Column({ unique: true, length: 50 })
    slug: string;

    // Relations
    @ManyToMany(() => Post, (post) => post.tags)
    posts: Post[];
} 