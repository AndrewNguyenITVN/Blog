import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Post } from './post.entity';

export enum CommentStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    SPAM = 'spam',
}

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'author_name', length: 100 })
    authorName: string;

    @Column({ name: 'author_email', length: 100 })
    authorEmail: string;

    @Column({ name: 'author_website', length: 255, nullable: true })
    authorWebsite?: string;

    @Column({ name: 'post_id' })
    postId: number;

    @Column({ name: 'parent_id', nullable: true })
    parentId?: number;

    @Column({
        type: 'enum',
        enum: CommentStatus,
        default: CommentStatus.PENDING,
    })
    status: CommentStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Post, (post) => post.comments, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @ManyToOne(() => Comment, (comment) => comment.replies, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'parent_id' })
    parent?: Comment;

    @OneToMany(() => Comment, (comment) => comment.parent)
    replies: Comment[];
} 