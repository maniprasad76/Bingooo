import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  targetUrl: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  badge?: string;
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable()
export class BannersService {
  findAllActive(): BannerItem[] {
    return (db.banners || [])
      .filter((b: BannerItem) => b.isActive)
      .sort((a: BannerItem, b: BannerItem) => a.priority - b.priority);
  }

  findAllAdmin(): BannerItem[] {
    return [...(db.banners || [])].sort((a: BannerItem, b: BannerItem) => a.priority - b.priority);
  }

  findById(id: string): BannerItem {
    const banner = (db.banners || []).find((b: BannerItem) => b.id === id);
    if (!banner) {
      throw new NotFoundException({ code: 'BANNER_NOT_FOUND', message: `Banner ${id} not found` });
    }
    return banner;
  }

  create(data: Omit<BannerItem, 'id' | 'created_at' | 'updated_at'>): BannerItem {
    const newBanner: BannerItem = {
      id: `ban-${Date.now()}`,
      title: data.title || '',
      subtitle: data.subtitle || '',
      ctaText: data.ctaText || "Shop Men's Wear",
      targetUrl: data.targetUrl || '/shop',
      desktopImageUrl: data.desktopImageUrl || '/hero-banner.png',
      mobileImageUrl: data.mobileImageUrl || data.desktopImageUrl || '/hero-banner.png',
      badge: data.badge || 'EXCLUSIVE DROP',
      priority: Number(data.priority) || (db.banners?.length || 0) + 1,
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate,
      endDate: data.endDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!db.banners) db.banners = [];
    db.banners.push(newBanner);
    return newBanner;
  }

  update(id: string, data: Partial<BannerItem>): BannerItem {
    const idx = (db.banners || []).findIndex((b: BannerItem) => b.id === id);
    if (idx === -1) {
      throw new NotFoundException({ code: 'BANNER_NOT_FOUND', message: `Banner ${id} not found` });
    }

    db.banners[idx] = {
      ...db.banners[idx],
      ...data,
      priority: data.priority !== undefined ? Number(data.priority) : db.banners[idx].priority,
      updated_at: new Date().toISOString(),
    };

    return db.banners[idx];
  }

  remove(id: string): { success: boolean } {
    const idx = (db.banners || []).findIndex((b: BannerItem) => b.id === id);
    if (idx === -1) {
      throw new NotFoundException({ code: 'BANNER_NOT_FOUND', message: `Banner ${id} not found` });
    }

    db.banners.splice(idx, 1);
    return { success: true };
  }
}
