import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '../../entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy, GoogleStrategy, LocalStrategy } from './strategies';
import { JwtAuthGuard, LocalAuthGuard, GoogleAuthGuard } from './guards';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
                signOptions: {
                    expiresIn: '15m',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        GoogleStrategy,
        LocalStrategy,
        JwtAuthGuard,
        LocalAuthGuard,
        GoogleAuthGuard,
    ],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule { } 