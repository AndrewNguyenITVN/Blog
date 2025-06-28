import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { LoginDto, RegisterDto, AuthResponseDto, GoogleAuthDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { username, email, password, fullName } = registerDto;

        // Kiểm tra user đã tồn tại
        const existingUserByEmail = await this.userRepository.findOne({
            where: { email }
        });
        if (existingUserByEmail) {
            throw new ConflictException('Email already exists');
        }

        const existingUserByUsername = await this.userRepository.findOne({
            where: { username }
        });
        if (existingUserByUsername) {
            throw new ConflictException('Username already exists');
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Tạo user mới
        const user = this.userRepository.create({
            username,
            email,
            passwordHash: hashedPassword,
            fullName,
            provider: 'local',
        });

        const savedUser = await this.userRepository.save(user);

        // Tạo tokens
        const tokens = await this.generateTokens(savedUser);

        return {
            ...tokens,
            user: this.excludePassword(savedUser),
        };
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        const user = await this.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user);

        return {
            ...tokens,
            user: this.excludePassword(user),
        };
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { email, provider: 'local' }
        });

        if (user && user.passwordHash && await bcrypt.compare(password, user.passwordHash)) {
            return user;
        }

        return null;
    }

    async validateGoogleUser(googleUserData: GoogleAuthDto): Promise<User> {
        const { googleId, email, fullName, avatarUrl } = googleUserData;

        // Tìm user theo Google ID
        let user = await this.userRepository.findOne({
            where: { googleId }
        });

        if (user) {
            // Cập nhật thông tin nếu cần
            user.fullName = fullName;
            user.avatarUrl = avatarUrl;
            return await this.userRepository.save(user);
        }

        // Tìm user theo email (có thể đã đăng ký bằng cách khác)
        user = await this.userRepository.findOne({
            where: { email }
        });

        if (user) {
            // Link Google account với tài khoản hiện tại
            user.googleId = googleId;
            user.provider = 'google';
            user.fullName = fullName || user.fullName;
            user.avatarUrl = avatarUrl || user.avatarUrl;
            return await this.userRepository.save(user);
        }

        // Tạo user mới từ Google
        const username = this.generateUsernameFromEmail(email);
        const newUser = this.userRepository.create({
            username,
            email,
            googleId,
            fullName,
            avatarUrl,
            provider: 'google',
        });

        return await this.userRepository.save(newUser);
    }

    async googleLogin(user: User): Promise<AuthResponseDto> {
        const tokens = await this.generateTokens(user);

        return {
            ...tokens,
            user: this.excludePassword(user),
        };
    }

    private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            username: user.username,
        };

        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return {
            accessToken,
            refreshToken,
        };
    }

    private excludePassword(user: User): Omit<User, 'passwordHash'> {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    private generateUsernameFromEmail(email: string): string {
        const baseUsername = email.split('@')[0];
        const randomSuffix = Math.floor(Math.random() * 10000);
        return `${baseUsername}${randomSuffix}`;
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.userRepository.findOne({
                where: { id: payload.sub }
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const newPayload: JwtPayload = {
                sub: user.id,
                email: user.email,
                username: user.username,
            };

            const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });

            return { accessToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async getProfile(userId: number): Promise<Omit<User, 'passwordHash'>> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return this.excludePassword(user);
    }
} 