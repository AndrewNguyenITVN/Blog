import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 50 })
    username: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ name: 'password_hash', length: 255 })
    passwordHash: string;

    @Column({ name: 'full_name', length: 100, nullable: true })
    fullName?: string;

    @Column({ name: 'avatar_url', length: 255, nullable: true })
    avatarUrl?: string;

    @Column({ type: 'text', nullable: true })
    bio?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @OneToMany(() => Post, (post) => post.author)
    posts: Post[];
} 