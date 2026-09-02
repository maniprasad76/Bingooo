import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

@Injectable()
export class CollectionsService {
  findAll() {
    return db.collections.filter((c) => c.is_active).map((c) => ({
      ...c,
      productCount: db.product_collections.filter((pc) => pc.collection_id === c.id).length,
    }));
  }

  findBySlug(slug: string) {
    const collection = db.collections.find((c) => c.slug === slug && c.is_active);
    if (!collection) throw new NotFoundException({ code: 'COLLECTION_NOT_FOUND', message: `Collection "${slug}" not found` });
    return {
      ...collection,
      productCount: db.product_collections.filter((pc) => pc.collection_id === collection.id).length,
    };
  }

  create(data: { name: string; slug: string; description?: string; bannerKey?: string }) {
    if (db.collections.some((c) => c.slug === data.slug)) {
      throw new ConflictException({ code: 'SLUG_TAKEN', message: 'Collection slug already exists' });
    }
    const col = {
      id: uuidv4(), name: data.name, slug: data.slug,
      description: data.description || null, banner_key: data.bannerKey || null, is_active: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    db.collections.push(col);
    return col;
  }

  update(id: string, data: Partial<{ name: string; slug: string; description: string; isActive: boolean }>) {
    const idx = db.collections.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException({ code: 'COLLECTION_NOT_FOUND', message: 'Collection not found' });
    db.collections[idx] = { ...db.collections[idx], ...data, updated_at: new Date().toISOString() };
    return db.collections[idx];
  }

  remove(id: string) {
    const idx = db.collections.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException({ code: 'COLLECTION_NOT_FOUND', message: 'Collection not found' });
    db.collections.splice(idx, 1);
    db.product_collections = db.product_collections.filter((pc) => pc.collection_id !== id);
  }
}
