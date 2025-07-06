import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto, PostResponseDto, PaginatedPostResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiResponse({ status: 201, description: 'Post created successfully', type: PostResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(
        @Body() createPostDto: CreatePostDto,
        @CurrentUser('sub') userId: number,
    ): Promise<PostResponseDto> {
        return this.postsService.create(createPostDto, userId);
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get all posts with pagination and filtering' })
    @ApiResponse({ status: 200, description: 'Posts retrieved successfully', type: PaginatedPostResponseDto })
    async findAll(@Query() queryDto: QueryPostDto): Promise<PaginatedPostResponseDto> {
        return this.postsService.findAll(queryDto);
    }

    @Get('published')
    @Public()
    @ApiOperation({ summary: 'Get only published posts' })
    @ApiResponse({ status: 200, description: 'Published posts retrieved successfully', type: PaginatedPostResponseDto })
    async findPublished(@Query() queryDto: QueryPostDto): Promise<PaginatedPostResponseDto> {
        return this.postsService.findPublished(queryDto);
    }

    @Get('search')
    @Public()
    @ApiOperation({ summary: 'Search posts' })
    @ApiResponse({ status: 200, description: 'Search results retrieved successfully', type: PaginatedPostResponseDto })
    async search(@Query() queryDto: QueryPostDto): Promise<PaginatedPostResponseDto> {
        return this.postsService.findAll(queryDto);
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get post by ID' })
    @ApiResponse({ status: 200, description: 'Post retrieved successfully', type: PostResponseDto })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostResponseDto> {
        const post = await this.postsService.findOne(id);
        // Increment view count
        await this.postsService.incrementViews(id);
        return this.postsService.mapToResponseDto(post);
    }

    @Get('slug/:slug')
    @Public()
    @ApiOperation({ summary: 'Get post by slug' })
    @ApiResponse({ status: 200, description: 'Post retrieved successfully', type: PostResponseDto })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async findBySlug(@Param('slug') slug: string): Promise<PostResponseDto> {
        const post = await this.postsService.findBySlug(slug);
        // Increment view count
        await this.postsService.incrementViews(post.id);
        return post;
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update post by ID' })
    @ApiResponse({ status: 200, description: 'Post updated successfully', type: PostResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePostDto: UpdatePostDto,
        @CurrentUser('sub') userId: number,
    ): Promise<PostResponseDto> {
        return this.postsService.update(id, updatePostDto, userId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete post by ID' })
    @ApiResponse({ status: 204, description: 'Post deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('sub') userId: number,
    ): Promise<void> {
        return this.postsService.remove(id, userId);
    }

    @Post(':id/views')
    @Public()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Increment post view count' })
    @ApiResponse({ status: 204, description: 'View count incremented successfully' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async incrementViews(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.postsService.incrementViews(id);
    }
} 