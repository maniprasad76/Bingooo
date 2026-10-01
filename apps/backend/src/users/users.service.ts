import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDb } from '../common/database/store';
import { hashPassword } from '../common/utils/crypto.util';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';

/** Roles that bypass every permission check in RolesGuard. */
const PRIVILEGED_ROLES = ['SUPER_ADMIN', 'ADMIN'];


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
    saveDb();
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
    saveDb();
    return address;
  }

  deleteAddress(userId: string, addressId: string) {
    db.addresses = db.addresses.filter((a) => !(a.user_id === userId && a.id === addressId));
    saveDb();
    return this.getAddresses(userId);
  }

  setDefaultAddress(userId: string, addressId: string) {
    db.addresses.forEach((a) => {
      if (a.user_id === userId) a.is_default = a.id === addressId;
    });
    saveDb();
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

  /**
   * Resolve and authorise a staff role assignment. The role must exist, cannot
   * be CUSTOMER, and the roles that bypass every permission check (ADMIN,
   * SUPER_ADMIN) can only be granted by a SUPER_ADMIN.
   */
  private resolveStaffRole(rawRole: string, caller: { roles?: string[] }): string {
    const code = rawRole.toUpperCase().trim().replace(/\s+/g, '_');
    const role = db.roles.find((r) => r.code === code);
    if (!role || code === 'CUSTOMER') {
      throw new BadRequestException({ code: 'INVALID_ROLE', message: `Unknown staff role "${rawRole}".` });
    }
    if (PRIVILEGED_ROLES.includes(code) && !caller.roles?.includes('SUPER_ADMIN')) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Only a Super Admin can grant this role.' });
    }
    return code;
  }

  createStaffUser(data: CreateStaffDto, caller: { id: string; roles?: string[] }) {
    const email = data.email.toLowerCase().trim();
    const existing = db.users.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      throw new ConflictException({ code: 'USER_EXISTS', message: 'User with this email already exists.' });
    }

    const now = new Date().toISOString();
    const newStaff = {
      id: `staff-${uuidv4()}`,
      email,
      password_hash: hashPassword(data.password),
      full_name: data.name.trim(),
      phone: '',
      role: this.resolveStaffRole(data.role, caller),
      status: 'active',
      avatar_key: null,
      created_at: now,
      updated_at: now,
    };

    db.users.push(newStaff);
    saveDb();
    const { password_hash, ...safe } = newStaff;
    return { ...safe, name: newStaff.full_name, twoFactorEnabled: false, lastActive: newStaff.updated_at };
  }

  updateStaffUser(id: string, data: UpdateStaffDto, caller: { id: string; roles?: string[] }) {
    const user = db.users.find((u) => u.id === id && u.role !== 'CUSTOMER');
    if (!user) {
      throw new NotFoundException({ code: 'STAFF_NOT_FOUND', message: 'Staff member not found.' });
    }
    if (user.id === caller.id && (data.role || data.status)) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'You cannot change your own role or status.' });
    }
    if (PRIVILEGED_ROLES.includes(user.role) && !caller.roles?.includes('SUPER_ADMIN')) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Only a Super Admin can modify this account.' });
    }

    if (data.name) user.full_name = data.name.trim();
    if (data.role) user.role = this.resolveStaffRole(data.role, caller);
    if (data.status) user.status = data.status;
    user.updated_at = new Date().toISOString();
    saveDb();

    const { password_hash, ...safe } = user;
    return { ...safe, name: user.full_name, twoFactorEnabled: false, lastActive: user.updated_at };
  }

  /**
   * Delete User Account & Associated Personal Data
   * Complies with Apple App Store Guideline 5.1.1(v) and Google Play Store User Data policy.
   * - Purges user profile and authentication record
   * - Purges saved addresses, active cart, and wishlist
   * - Anonymizes customer identifiers on existing orders (retaining financial records for statutory tax/accounting compliance)
   */
  deleteAccount(userId: string) {
    // 1. Remove from users and profiles
    const userIndex = db.users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      db.users.splice(userIndex, 1);
    }

    const profileIndex = db.profiles.findIndex((p) => p.id === userId);
    if (profileIndex !== -1) {
      db.profiles.splice(profileIndex, 1);
    }

    // 2. Remove all saved shipping addresses
    db.addresses = db.addresses.filter((a) => a.user_id !== userId);

    // 3. Remove user cart & cart items
    const userCart = db.carts.find((c) => c.user_id === userId);
    if (userCart) {
      db.cart_items = db.cart_items.filter((item) => item.cart_id !== userCart.id);
      db.carts = db.carts.filter((c) => c.id !== userCart.id);
    }

    // 4. Remove wishlist entries
    if (db.wishlists) {
      db.wishlists = db.wishlists.filter((w: any) => w.user_id !== userId);
    }

    // 5. Anonymize orders for GDPR / DPDP compliance
    db.orders.forEach((order) => {
      if (order.user_id === userId) {
        order.user_id = 'deleted-user';
        if (order.shipping_address) {
          order.shipping_address = {
            fullName: 'Deleted User',
            phone: '0000000000',
            addressLine1: 'Redacted (Account Deleted)',
            city: order.shipping_address.city || 'Redacted',
            state: order.shipping_address.state || 'Redacted',
            postalCode: '000000',
            country: 'IN',
          };
        }
        if (order.customer_email) order.customer_email = 'deleted@bingooo.in';
        if (order.customer_name) order.customer_name = 'Deleted User';
      }
    });

    saveDb();

    return {
      success: true,
      message: 'Your account, profile, and associated personal data have been permanently deleted.',
      deletedAt: new Date().toISOString(),
    };
  }
}
