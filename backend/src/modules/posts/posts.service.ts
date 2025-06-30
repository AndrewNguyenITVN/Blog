import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post, PostStatus } from '../../entities/post.entity';
import { Tag } from '../../entities/tag.entity';
import {
    CreatePostDto,
    UpdatePostDto,
    QueryPostDto,
    PostResponseDto,
    PaginatedPostResponseDto,
} from './dto';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) { }

    async create(createPostDto: CreatePostDto, authorId: number): Promise<PostResponseDto> {
        const { tagIds, ...postData } = createPostDto;

        // Check if slug already exists
        const existingPost = await this.postRepository.findOne({
            where: { slug: postData.slug },
        });

        if (existingPost) {
            throw new BadRequestException('Slug already exists');
        }

        // Create post
        const post = this.postRepository.create({
            ...postData,
            authorId,
            publishedAt: postData.status === PostStatus.PUBLISHED ? new Date() : null,
        });

        // Handle tags if provided
        if (tagIds && tagIds.length > 0) {
            const tags = await this.tagRepository.findByIds(tagIds);
            post.tags = tags;
        }

        const savedPost = await this.postRepository.save(post);
        return this.mapToResponseDto(await this.findOne(savedPost.id));
    }

    async findAll(queryDto: QueryPostDto): Promise<PaginatedPostResponseDto> {
        const { page, limit, status, categoryId, search, sortBy, sortOrder } = queryDto;

        const queryBuilder = this.createBaseQuery();

        // Apply filters
        if (status) {
            queryBuilder.andWhere('post.status = :status', { status });
        }

        if (categoryId) {
            queryBuilder.andWhere('post.categoryId = :categoryId', { categoryId });
        }

        if (search) {
            queryBuilder.andWhere(
                '(post.title ILIKE :search OR post.content ILIKE :search OR post.excerpt ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Apply sorting
        const validSortFields = ['createdAt', 'updatedAt', 'title', 'viewsCount'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`post.${sortField}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // Get results and count
        const [posts, total] = await queryBuilder.getManyAndCount();

        return {
            data: posts.map(post => this.mapToResponseDto(post)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number): Promise<Post> {
        const post = await this.createBaseQuery()
            .andWhere('post.id = :id', { id })
            .getOne();

        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        return post;
    }

    async findBySlug(slug: string): Promise<PostResponseDto> {
        const post = await this.createBaseQuery()
            .andWhere('post.slug = :slug', { slug })
            .getOne();

        if (!post) {
            throw new NotFoundException(`Post with slug '${slug}' not found`);
        }

        return this.mapToResponseDto(post);
    }

    async update(id: number, updatePostDto: UpdatePostDto, authorId?: number): Promise<PostResponseDto> {
        const post = await this.findOne(id);

        // Check authorization if authorId is provided
        if (authorId && post.authorId !== authorId) {
            throw new BadRequestException('You can only update your own posts');
        }

        const { tagIds, ...postData } = updatePostDto;

        // Check if slug already exists (if updating slug)
        if (postData.slug && postData.slug !== post.slug) {
            const existingPost = await this.postRepository.findOne({
                where: { slug: postData.slug },
            });

            if (existingPost) {
                throw new BadRequestException('Slug already exists');
            }
        }

        // Update publish date if status changed to published
        const updateData = { ...postData };
        if (updateData.status === PostStatus.PUBLISHED && post.status !== PostStatus.PUBLISHED) {
            (updateData as any).publishedAt = new Date();
        }

        // Handle tags if provided
        if (tagIds !== undefined) {
            if (tagIds.length > 0) {
                const tags = await this.tagRepository.findByIds(tagIds);
                post.tags = tags;
            } else {
                post.tags = [];
            }
        }

        // Update post
        Object.assign(post, updateData);
        const updatedPost = await this.postRepository.save(post);

        return this.mapToResponseDto(await this.findOne(updatedPost.id));
    }

    async remove(id: number, authorId?: number): Promise<void> {
        const post = await this.findOne(id);

        // Check authorization if authorId is provided
        if (authorId && post.authorId !== authorId) {
            throw new BadRequestException('You can only delete your own posts');
        }

        await this.postRepository.remove(post);
    }

    async incrementViews(id: number): Promise<void> {
        await this.postRepository.increment({ id }, 'viewsCount', 1);
    }

    async findPublished(queryDto: QueryPostDto): Promise<PaginatedPostResponseDto> {
        return this.findAll({ ...queryDto, status: PostStatus.PUBLISHED });
    }

    private createBaseQuery(): SelectQueryBuilder<Post> {
        return this.postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.author', 'author')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('post.tags', 'tags')
            .loadRelationCountAndMap('post.commentsCount', 'post.comments');
    }

    public mapToResponseDto(post: Post): PostResponseDto {
        return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            status: post.status,
            viewsCount: post.viewsCount,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            publishedAt: post.publishedAt,
            author: {
                id: post.author.id,
                username: post.author.username,
                email: post.author.email,
            },
            category: post.category ? {
                id: post.category.id,
                name: post.category.name,
                slug: post.category.slug,
            } : undefined,
            tags: post.tags?.map(tag => ({
                id: tag.id,
                name: tag.name,
                slug: tag.slug,
            })) || [],
            commentsCount: (post as any).commentsCount || 0,
        };
    }
} 