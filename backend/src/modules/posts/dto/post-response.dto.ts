import { PostStatus } from '../../../entities/post.entity';

export class PostResponseDto {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    status: PostStatus;
    viewsCount: number;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;

    author: {
        id: number;
        username: string;
        email: string;
    };

    category?: {
        id: number;
        name: string;
        slug: string;
    };

    tags: Array<{
        id: number;
        name: string;
        slug: string;
    }>;

    commentsCount?: number;
}

export class PaginatedPostResponseDto {
    data: PostResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
} 