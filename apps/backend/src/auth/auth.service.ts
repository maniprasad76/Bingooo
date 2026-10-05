import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { db, saveDb } from '../common/database/store';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  revokeToken,
} from '../common/utils/crypto.util';
import {
  SignupDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { EmailService } from '../email/email.service';

export {
  SignupDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
};

/** Reset tokens are stored hashed so a leaked store/backup cannot be replayed. */
function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function sanitizeUser(user: any) {
  const { password_hash, ...rest } = user;
  return rest;
}

@Injectable()
export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  async signup(dto: SignupDto) {
    const existing = db.users.find((u) => u.email.toLowerCase() === dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists.',
      });
    }

    if (!dto.password || dto.password.length < 6) {
      throw new BadRequestException({
        code: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long.',
      });
    }

    const userId = uuidv4();
    const newUser = {
      id: userId,
      email: dto.email.toLowerCase().trim(),
      password_hash: hashPassword(dto.password),
      full_name: dto.fullName.trim(),
      phone: dto.phone || '',
      role: 'CUSTOMER',
      status: 'active',
      avatar_key: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Create profile entry
    db.profiles.push({
      id: userId,
      email: newUser.email,
      full_name: newUser.full_name,
      phone: newUser.phone,
      avatar_key: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    saveDb();

    const tokenData = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: sanitizeUser(newUser),
      token: tokenData.token,
      jti: tokenData.jti,
      expiresIn: tokenData.expiresIn,
    };
  }

  async login(dto: LoginDto) {
    const user = db.users.find((u) => u.email.toLowerCase() === dto.email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    const isValid = verifyPassword(dto.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    const tokenData = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      token: tokenData.token,
      jti: tokenData.jti,
      expiresIn: tokenData.expiresIn,
    };
  }

  async revokeUserSession(tokenOrJti?: string) {
    if (tokenOrJti) {
      revokeToken(tokenOrJti);
    }
    return { success: true, message: 'Session successfully revoked and logged out.' };
  }


  async getMe(userId: string) {
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User account not found.',
      });
    }
    return sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    if (dto.fullName) user.full_name = dto.fullName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();
    if (dto.avatarKey !== undefined) user.avatar_key = dto.avatarKey;
    user.updated_at = new Date().toISOString();

    const profile = db.profiles.find((p) => p.id === userId);
    if (profile) {
      if (dto.fullName) profile.full_name = dto.fullName.trim();
      if (dto.phone !== undefined) profile.phone = dto.phone.trim();
      profile.updated_at = new Date().toISOString();
    }

    return sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    const isValid = verifyPassword(dto.currentPassword, user.password_hash);
    if (!isValid) {
      throw new BadRequestException({
        code: 'INVALID_PASSWORD',
        message: 'Current password does not match.',
      });
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestException({
        code: 'WEAK_PASSWORD',
        message: 'New password must be at least 6 characters long.',
      });
    }

    const now = new Date().toISOString();
    user.password_hash = hashPassword(dto.newPassword);
    user.password_changed_at = now; // AuthGuard rejects tokens issued before this
    user.updated_at = now;
    saveDb();

    return { success: true, message: 'Password changed successfully. Please log in again.' };
  }

  async forgotPassword(email: string) {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour validity
      user.reset_token = hashResetToken(resetToken);
      user.reset_token_expiry = resetTokenExpiry;
      user.updated_at = new Date().toISOString();
      saveDb();
      this.emailService
        .sendPasswordResetEmail(user.email, resetToken, user.full_name)
        .catch(() => {});
    }
    // Always return generic success to prevent email enumeration
    return {
      success: true,
      message: 'If an account exists with that email, a password reset link has been dispatched.',
    };
  }

  async resetPassword(token: string, newPass: string) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException({
        code: 'INVALID_TOKEN',
        message: 'Invalid or missing password reset token.',
      });
    }

    if (!newPass || newPass.length < 8) {
      throw new BadRequestException({
        code: 'WEAK_PASSWORD',
        message: 'Password must be at least 8 characters long.',
      });
    }

    const tokenHash = hashResetToken(token);
    const user = db.users.find(
      (u) => u.reset_token && u.reset_token === tokenHash && u.reset_token_expiry > Date.now(),
    );

    if (!user) {
      throw new BadRequestException({
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    const now = new Date().toISOString();
    user.password_hash = hashPassword(newPass);
    user.password_changed_at = now; // AuthGuard rejects tokens issued before this
    user.reset_token = null;
    user.reset_token_expiry = null;
    user.updated_at = now;
    saveDb();

    return {
      success: true,
      message: 'Password has been reset successfully. You can now login.',
    };
  }
}

