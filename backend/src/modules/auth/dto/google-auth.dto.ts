import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
    @ApiProperty()
    googleId: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    fullName: string;

    @ApiProperty()
    avatarUrl?: string;
} 