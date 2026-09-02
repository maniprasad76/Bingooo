import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

@Injectable()
export class UsersService {
  getProfile(userId: string) {
    let profile = db.profiles.find((p) => p.id === userId);
    if (!profile) {
      profile = {
        id: userId,
        full_name: 'Demo User',
        email: 'user@example.com',
        phone: '+91 9876543210',
        avatar_key: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.profiles.push(profile);
    }
    return profile;
  }

  updateProfile(userId: string, data: Partial<{ fullName: string; phone: string }>) {
    const profile = this.getProfile(userId);
    if (data.fullName !== undefined) profile.full_name = data.fullName;
    if (data.phone !== undefined) profile.phone = data.phone;
    profile.updated_at = new Date().toISOString();
    return profile;
  }

  getAddresses(userId: string) {
    return db.addresses.filter((a) => a.user_id === userId);
  }

  addAddress(userId: string, data: any) {
    const isFirst = db.addresses.filter((a) => a.user_id === userId).length === 0;
    const address = {
      id: uuidv4(),
      user_id: userId,
      name: data.name,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      state: data.state,
      postal_code: data.postalCode,
      country: data.country || 'IN',
      is_default: data.isDefault || isFirst,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (address.is_default) {
      db.addresses.forEach((a) => {
        if (a.user_id === userId) a.is_default = false;
      });
    }

    db.addresses.push(address);
    return address;
  }

  deleteAddress(userId: string, addressId: string) {
    db.addresses = db.addresses.filter((a) => !(a.user_id === userId && a.id === addressId));
    return this.getAddresses(userId);
  }
}
