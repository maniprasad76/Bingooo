import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';
import { hashPassword } from '../common/utils/crypto.util';

@Injectable()
export class UsersService {
  /** Get current customer/staff user profile */
  getProfile(userId: string) {
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }

    let profile = db.profiles.find((p) => p.id === userId);
    if (!profile) {
      profile = {
        id: userId,
        full_name: 'Bingooo User',
        email: 'user@bingooo.in',
        phone: '+91 9876543210',
        avatar_key: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.profiles.push(profile);
    }
    return profile;
  }

  updateProfile(userId: string, data: Partial<{ fullName: string; phone: string; avatarKey?: string }>) {
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      if (data.fullName !== undefined) user.full_name = data.fullName.trim();
      if (data.phone !== undefined) user.phone = data.phone.trim();
      if (data.avatarKey !== undefined) user.avatar_key = data.avatarKey;
      user.updated_at = new Date().toISOString();
    }

    let profile = db.profiles.find((p) => p.id === userId);
    if (profile) {
      if (data.fullName !== undefined) profile.full_name = data.fullName.trim();
      if (data.phone !== undefined) profile.phone = data.phone.trim();
      profile.updated_at = new Date().toISOString();
    }

    return this.getProfile(userId);
  }

  /** Customer addresses */
  getAddresses(userId: string) {
    return db.addresses.filter((a) => a.user_id === userId);
  }

  addAddress(userId: string, data: any) {
    const isFirst = db.addresses.filter((a) => a.user_id === userId).length === 0;
    const isDefault = data.isDefault !== undefined ? Boolean(data.isDefault) : isFirst;

    if (isDefault) {
      db.addresses.forEach((a) => {
        if (a.user_id === userId) a.is_default = false;
      });
    }

    const address = {
      id: uuidv4(),
      user_id: userId,
      name: data.name,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      state: data.state,
      postal_code: data.postalCode || data.postal_code,
      country: data.country || 'IN',
      is_default: isDefault,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.addresses.push(address);
    return address;
  }

  updateAddress(userId: string, addressId: string, data: any) {
    const address = db.addresses.find((a) => a.user_id === userId && a.id === addressId);
    if (!address) {
      throw new NotFoundException({ code: 'ADDRESS_NOT_FOUND', message: 'Address not found.' });
    }

    if (data.name !== undefined) address.name = data.name;
    if (data.phone !== undefined) address.phone = data.phone;
    if (data.line1 !== undefined) address.line1 = data.line1;
    if (data.line2 !== undefined) address.line2 = data.line2;
    if (data.city !== undefined) address.city = data.city;
    if (data.state !== undefined) address.state = data.state;
    if (data.postalCode !== undefined || data.postal_code !== undefined) {
      address.postal_code = data.postalCode || data.postal_code;
    }
    if (data.isDefault) {
      db.addresses.forEach((a) => {
        if (a.user_id === userId) a.is_default = false;
      });
      address.is_default = true;
    }
    address.updated_at = new Date().toISOString();
    return address;
  }

  deleteAddress(userId: string, addressId: string) {
    db.addresses = db.addresses.filter((a) => !(a.user_id === userId && a.id === addressId));
    return this.getAddresses(userId);
  }

  setDefaultAddress(userId: string, addressId: string) {
    db.addresses.forEach((a) => {
      if (a.user_id === userId) a.is_default = a.id === addressId;
    });
    return this.getAddresses(userId);
  }

  /** Admin: List customer users with orders aggregation */
  getAllCustomers(search?: string) {
    let customers = db.users.filter((u) => u.role === 'CUSTOMER' || !u.role);

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q),
      );
    }

    return customers.map((c) => {
      const orders = db.orders.filter((o) => o.user_id === c.id);
      const totalSpent = orders
        .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
        .reduce((sum, o) => sum + (o.total || 0), 0);
      const addresses = db.addresses.filter((a) => a.user_id === c.id);
      const lastOrder = orders[orders.length - 1];

      return {
        id: c.id,
        name: c.full_name,
        email: c.email,
        phone: c.phone || '',
        orderCount: orders.length,
        totalSpent,
        status: c.status || 'active',
        created_at: c.created_at,
        lastOrderDate: lastOrder?.created_at || null,
        addressCount: addresses.length,
      };
    });
  }

  /** Admin: Single customer detail */
  getCustomerDetail(id: string) {
    const customer = db.users.find((u) => u.id === id);
    if (!customer) {
      throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found.' });
    }

    const orders = db.orders.filter((o) => o.user_id === customer.id);
    const addresses = db.addresses.filter((a) => a.user_id === customer.id);
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    const { password_hash, ...safeCustomer } = customer;
    return {
      ...safeCustomer,
      totalSpent,
      orderCount: orders.length,
      orders,
      addresses,
    };
  }

  /** Admin: Staff management */
  getStaffUsers() {
    return db.users
      .filter((u) => u.role !== 'CUSTOMER')
      .map((u) => {
        const { password_hash, ...safe } = u;
        return {
          ...safe,
          name: u.full_name,
          twoFactorEnabled: false,
          lastActive: u.updated_at,
        };
      });
  }

  createStaffUser(data: { name: string; email: string; role: string; password?: string }) {
    const existing = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase().trim());
    if (existing) {
      throw new ConflictException({ code: 'USER_EXISTS', message: 'User with this email already exists.' });
    }

    const defaultPass = data.password || 'Staff@123456';
    const newStaff = {
      id: `staff-${Date.now()}`,
      email: data.email.toLowerCase().trim(),
      password_hash: hashPassword(defaultPass),
      full_name: data.name.trim(),
      phone: '',
      role: data.role.toUpperCase().replace(/\s+/g, '_'),
      status: 'active',
      avatar_key: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.users.push(newStaff);
    const { password_hash, ...safe } = newStaff;
    return { ...safe, name: newStaff.full_name, twoFactorEnabled: false, lastActive: newStaff.updated_at };
  }

  updateStaffUser(id: string, data: Partial<{ role: string; status: string; name: string }>) {
    const user = db.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException({ code: 'STAFF_NOT_FOUND', message: 'Staff member not found.' });
    }

    if (data.name) user.full_name = data.name.trim();
    if (data.role) user.role = data.role.toUpperCase().replace(/\s+/g, '_');
    if (data.status) user.status = data.status;
    user.updated_at = new Date().toISOString();

    const { password_hash, ...safe } = user;
    return { ...safe, name: user.full_name, twoFactorEnabled: false, lastActive: user.updated_at };
  }
}
