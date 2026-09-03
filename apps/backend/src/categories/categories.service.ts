import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

@Injectable()
export class CategoriesService {
  findAll() {
    return db.categories.filter((c) => c.is_active).map((c) => ({
      ...c,
      productCount: db.products.filter((p) => p.category_id === c.id && p.status === 'active').length,
    }));
  }

  findBySlug(slug: string) {
    const category = db.categories.find((c) => c.slug === slug && c.is_active);
    if (!category) throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', message: `Category "${slug}" not found` });
    return {
      ...category,
      productCount: db.products.filter((p) => p.category_id === category.id && p.status === 'active').length,
    };
  }

  create(data: { name: string; slug: string; parentId?: string }) {
    if (db.categories.some((c) => c.slug === data.slug)) {
      throw new ConflictException({ code: 'SLUG_TAKEN', message: 'Category slug already exists' });
    }
    const cat = {
      id: uuidv4(), name: data.name, slug: data.slug,
      parent_id: data.parentId || null, image_key: null, is_active: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    db.categories.push(cat);
    return cat;
  }

  update(id: string, data: Partial<{ name: string; slug: string; isActive: boolean }>) {
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', message: 'Category not found' });
    db.categories[idx] = { ...db.categories[idx], ...data, updated_at: new Date().toISOString() };
    return db.categories[idx];
  }

  remove(id: string) {
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', message: 'Category not found' });
    db.categories.splice(idx, 1);
  }
}
