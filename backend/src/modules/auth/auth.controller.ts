import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Request,
    Response,
    HttpStatus,
    ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthResponseDto })
    @ApiResponse({ status: 409, description: 'Email or username already exists' })
    async register(
        @Body(ValidationPipe) registerDto: RegisterDto
    ): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @UseGuards(AuthGuard('local'))
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, description: 'User successfully logged in', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(
        @Body(ValidationPipe) loginDto: LoginDto,
        @Request() req: any
    ): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Initiate Google OAuth login' })
    async googleAuth() {
        // Điều hướng đến Google OAuth
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Google OAuth callback' })
    async googleAuthRedirect(@Request() req: any, @Response() res: any) {
        const user = req.user;
        const authResponse = await this.authService.googleLogin(user);

        // Redirect về frontend với token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/auth/callback?token=${authResponse.accessToken}&refresh=${authResponse.refreshToken}`;

        return res.redirect(redirectUrl);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(
        @Body() body: { refreshToken: string }
    ): Promise<{ accessToken: string }> {
        return this.authService.refreshToken(body.refreshToken);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.id);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'Successfully logged out' })
    async logout(@Response() res: any) {
        // Trong thực tế, bạn có thể muốn blacklist token
        // Hiện tại chỉ trả về thành công
        return res.status(HttpStatus.OK).json({ message: 'Successfully logged out' });
    }
} 