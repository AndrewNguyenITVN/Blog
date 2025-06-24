import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { Comment } from './comment.entity';

export enum PostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    title: string;

    @Column({ unique: true, length: 255 })
    slug: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'text', nullable: true })
    excerpt?: string;

    @Column({ name: 'featured_image', length: 255, nullable: true })
    featuredImage?: string;

    @Column({
        type: 'enum',
        enum: PostStatus,
        default: PostStatus.DRAFT,
    })
    status: PostStatus;

    @Column({ name: 'views_count', default: 0 })
    viewsCount: number;

    @Column({ name: 'author_id' })
    authorId: number;

    @Column({ name: 'category_id', nullable: true })
    categoryId?: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'published_at', nullable: true })
    publishedAt?: Date;

    // Relations
    @ManyToOne(() => User, (user) => user.posts, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'author_id' })
    author: User;

    @ManyToOne(() => Category, (category) => category.posts, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'category_id' })
    category?: Category;

    @ManyToMany(() => Tag, (tag) => tag.posts, {
        cascade: true,
    })
    @JoinTable({
        name: 'post_tags',
        joinColumn: {
            name: 'post_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'tag_id',
            referencedColumnName: 'id',
        },
    })
    tags: Tag[];

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];
} 