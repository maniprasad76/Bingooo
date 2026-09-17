import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  AuthService,
  SignupDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new customer account (Rate limited: 5 req/min)' })
  async signup(@Body() body: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(body);
    this.setAuthCookie(res, result.token);
    return result;
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password (Rate limited: 5 req/min)' })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body);
    this.setAuthCookie(res, result.token);
    return result;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out current session and invalidate token' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.user?.token;
    const jti = req.user?.jti;
    await this.authService.revokeUserSession(jti || token);
    res.clearCookie('access_token', { path: '/' });
    return { success: true, message: 'Session logged out and invalidated successfully.' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile and roles' })
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile details' })
  updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for current user (Rate limited: 5 req/min)' })
  changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, body);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link (Rate limited: 5 req/min)' })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password (Rate limited: 5 req/min)' })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.email, body.newPassword);
  }
}

