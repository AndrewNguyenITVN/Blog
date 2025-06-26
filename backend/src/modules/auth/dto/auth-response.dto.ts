import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';

export class AuthResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    user: Omit<User, 'passwordHash'>;
} 