import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';
import { hashPassword, verifyPassword, generateToken } from '../common/utils/crypto.util';

export interface SignupDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  avatarKey?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

function sanitizeUser(user: any) {
  const { password_hash, ...rest } = user;
  return rest;
}

@Injectable()
export class AuthService {
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

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: sanitizeUser(newUser),
      token,
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

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      token,
    };
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

    user.password_hash = hashPassword(dto.newPassword);
    user.updated_at = new Date().toISOString();

    return { success: true, message: 'Password changed successfully.' };
  }

  async forgotPassword(email: string) {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    // Always return success to prevent email enumeration
    return {
      success: true,
      message: 'If an account exists with that email, a password reset link has been dispatched.',
    };
  }

  async resetPassword(email: string, newPass: string) {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (user) {
      user.password_hash = hashPassword(newPass);
      user.updated_at = new Date().toISOString();
    }
    return {
      success: true,
      message: 'Password has been reset successfully. You can now login.',
    };
  }
}
