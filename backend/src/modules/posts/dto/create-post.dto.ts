import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PostStatus } from '../../../entities/post.entity';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    slug: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    featuredImage?: string;

    @IsOptional()
    @IsEnum(PostStatus)
    status?: PostStatus = PostStatus.DRAFT;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    categoryId?: number;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @Type(() => Number)
    tagIds?: number[];
} 