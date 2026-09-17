import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDb } from '../common/database/store';
import { ProductQueryDto, CreateProductDto, UpdateProductDto, CreateVariantDto } from './dto/product.dto';
import {
  getProductById,
  getProductBySlug,
  getCategoryById,
  getCategoryBySlug,
  getCollectionBySlug,
  getVariantsByProductId,
  getImagesByProductId,
  getProductIdsByCollectionId,
  getReviewsByProductId,
} from '../common/database/db-index.service';


@Injectable()
export class ProductsService {
  /** List products with filtering, search, sort, pagination */
  findAll(query: ProductQueryDto) {
    let items = [...db.products];
    const page = query.page || 1;
    const limit = query.limit || 12;

    // Filter: status (default to active for public)
    if (query.status) {
      items = items.filter((p) => p.status === query.status);
    } else {
      items = items.filter((p) => p.status === 'active');
    }

    // Filter: category
    if (query.categorySlug) {
      const cat = getCategoryBySlug(query.categorySlug);
      if (cat) items = items.filter((p) => p.category_id === cat.id);
      else items = [];
    }

    // Filter: collection
    if (query.collectionSlug) {
      const col = getCollectionBySlug(query.collectionSlug);
      if (col) {
        const productIds = getProductIdsByCollectionId(col.id);
        items = items.filter((p) => productIds.includes(p.id));
      } else {
        items = [];
      }
    }

    // Filter: price range
    if (query.minPrice !== undefined && query.minPrice !== null) {
      const minP = Number(query.minPrice);
      if (!isNaN(minP)) {
        items = items.filter((p) => p.base_price >= minP);
      }
    }
    if (query.maxPrice !== undefined && query.maxPrice !== null) {
      const maxP = Number(query.maxPrice);
      if (!isNaN(maxP)) {
        items = items.filter((p) => p.base_price <= maxP);
      }
    }

    // Filter: customizable
    if (query.customizable !== undefined && query.customizable !== null) {
      const isCustomizable = String(query.customizable) === 'true';
      items = items.filter((p) => p.customization_enabled === isCustomizable);
    }

    // Filter: sizes / colors (check variants)
    if (query.sizes) {
      const sizes = query.sizes.split(',').map((s) => s.trim().toUpperCase());
      items = items.filter((p) =>
        getVariantsByProductId(p.id).some(
          (v) => v.is_active && sizes.includes(v.size?.toUpperCase()),
        ),
      );
    }
    if (query.colors) {
      const colors = query.colors.split(',').map((c) => c.trim().toLowerCase());
      items = items.filter((p) =>
        getVariantsByProductId(p.id).some(
          (v) => v.is_active && colors.includes(v.color?.toLowerCase()),
        ),
      );
    }

    // Search
    if (query.search) {
      const term = query.search.toLowerCase().trim();
      const matchedCategoryIds = db.categories
        .filter((c) => c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term))
        .map((c) => c.id);

      items = items.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(term);
        const descMatch = p.description && p.description.toLowerCase().includes(term);
        const slugMatch = p.slug && p.slug.toLowerCase().includes(term);
        const catMatch = matchedCategoryIds.includes(p.category_id);
        const fabricMatch = (p as any).fabric && String((p as any).fabric).toLowerCase().includes(term);
        const tagsMatch = Array.isArray((p as any).tags) && (p as any).tags.some((t: string) => String(t).toLowerCase().includes(term));
        return titleMatch || descMatch || slugMatch || catMatch || fabricMatch || tagsMatch;
      });
    }


    // Sort
    switch (query.sort) {
      case 'price_asc':
        items.sort((a, b) => a.base_price - b.base_price);
        break;
      case 'price_desc':
        items.sort((a, b) => b.base_price - a.base_price);
        break;
      case 'title_asc':
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'oldest':
        items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'newest':
      default:
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    // Pagination
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginated = items.slice(offset, offset + limit);

    // Enrich with category, variants, images
    const enriched = paginated.map((p) => this.enrichProduct(p));

    return {
      data: enriched,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /** Full catalog for the protected operations workspace. */
  findAllForAdmin() {
    return db.products
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .map((product) => this.enrichProduct(product));
  }

  /** Get single product by slug or ID */
  findBySlug(slugOrId: string) {
    const product = getProductBySlug(slugOrId) || getProductById(slugOrId);
    if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: `Product "${slugOrId}" not found` });
    return this.enrichProduct(product);
  }

  /** Get single product by ID */
  findById(id: string) {
    const product = getProductById(id);
    if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: `Product not found` });
    return this.enrichProduct(product);
  }

  /** Create product (admin) */
  create(dto: CreateProductDto) {
    if (db.products.some((p) => p.slug === dto.slug)) {
      throw new ConflictException({ code: 'SLUG_TAKEN', message: `Slug "${dto.slug}" already exists` });
    }

    const product = {
      id: uuidv4(),
      category_id: dto.categoryId || null,
      title: dto.title,
      slug: dto.slug,
      description: dto.description || null,
      status: dto.status || 'draft',
      base_price: dto.basePrice,
      compare_at_price: dto.compareAtPrice || null,
      customization_enabled: dto.customizationEnabled ?? false,
      seo_title: dto.seoTitle || null,
      seo_description: dto.seoDescription || null,
      fabric: dto.fabric || null,
      gsm: dto.gsm || null,
      fit: dto.fit || null,
      design_details: dto.designDetails || null,
      care_instructions: dto.careInstructions || null,
      tags: dto.tags || [],
      featured: dto.featured ?? false,
      bestseller: dto.bestseller ?? false,
      is_sale: dto.isSale ?? false,
      sale_tag: dto.saleTag || null,
      badge_text: dto.badgeText || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.products.push(product);

    // Save images if provided
    if (dto.imageUrl) {
      db.product_images.push({
        id: uuidv4(),
        product_id: product.id,
        url: dto.imageUrl,
        object_key: dto.imageUrl,
        alt_text: product.title,
        sort_order: 0,
        is_primary: true,
      });
    } else if (dto.images && dto.images.length > 0) {
      dto.images.forEach((img, idx) => {
        db.product_images.push({
          id: uuidv4(),
          product_id: product.id,
          url: img.url,
          object_key: img.url,
          alt_text: img.alt_text || product.title,
          sort_order: idx,
          is_primary: img.is_primary !== undefined ? img.is_primary : idx === 0,
        });
      });
    }

    // Save variants if provided
    if (dto.variants && dto.variants.length > 0) {
      dto.variants.forEach((v) => {
        db.product_variants.push({
          id: v.id || uuidv4(),
          product_id: product.id,
          sku: v.sku || `${product.slug}-${v.size || 'STD'}-${v.color || 'DEF'}`.toUpperCase().replace(/\s+/g, '-'),
          size: v.size || null,
          color: v.color || null,
          color_hex: v.colorHex || null,
          price: v.price !== undefined ? v.price : product.base_price,
          stock_quantity: v.stockQuantity !== undefined ? v.stockQuantity : 10,
          reserved_quantity: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
    }

    saveDb();
    return this.enrichProduct(product);
  }

  /** Update product (admin) */
  update(id: string, dto: UpdateProductDto) {
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });

    if (dto.slug && dto.slug !== db.products[idx].slug) {
      if (db.products.some((p) => p.slug === dto.slug)) {
        throw new ConflictException({ code: 'SLUG_TAKEN', message: `Slug "${dto.slug}" already exists` });
      }
    }

    const updated = {
      ...db.products[idx],
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.categoryId !== undefined && { category_id: dto.categoryId }),
      ...(dto.basePrice !== undefined && { base_price: dto.basePrice }),
      ...(dto.compareAtPrice !== undefined && { compare_at_price: dto.compareAtPrice }),
      ...(dto.customizationEnabled !== undefined && { customization_enabled: dto.customizationEnabled }),
      ...(dto.seoTitle !== undefined && { seo_title: dto.seoTitle }),
      ...(dto.seoDescription !== undefined && { seo_description: dto.seoDescription }),
      ...(dto.fabric !== undefined && { fabric: dto.fabric }),
      ...(dto.gsm !== undefined && { gsm: dto.gsm }),
      ...(dto.fit !== undefined && { fit: dto.fit }),
      ...(dto.designDetails !== undefined && { design_details: dto.designDetails }),
      ...(dto.careInstructions !== undefined && { care_instructions: dto.careInstructions }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.featured !== undefined && { featured: dto.featured }),
      ...(dto.bestseller !== undefined && { bestseller: dto.bestseller }),
      ...(dto.isSale !== undefined && { is_sale: dto.isSale }),
      ...(dto.saleTag !== undefined && { sale_tag: dto.saleTag }),
      ...(dto.badgeText !== undefined && { badge_text: dto.badgeText }),
      ...(dto.status !== undefined && { status: dto.status }),
      updated_at: new Date().toISOString(),
    };

    db.products[idx] = updated;

    // Update images if provided
    if (dto.imageUrl !== undefined) {
      const existing = db.product_images.find((i: any) => i.product_id === id && i.is_primary);
      if (existing) {
        existing.url = dto.imageUrl;
        existing.object_key = dto.imageUrl;
      } else if (dto.imageUrl) {
        db.product_images.push({
          id: uuidv4(),
          product_id: id,
          url: dto.imageUrl,
          object_key: dto.imageUrl,
          alt_text: updated.title,
          sort_order: 0,
          is_primary: true,
        });
      }
    } else if (dto.images && dto.images.length > 0) {
      db.product_images = db.product_images.filter((i: any) => i.product_id !== id);
      dto.images.forEach((img, idx) => {
        db.product_images.push({
          id: uuidv4(),
          product_id: id,
          url: img.url,
          object_key: img.url,
          alt_text: img.alt_text || updated.title,
          sort_order: idx,
          is_primary: img.is_primary !== undefined ? img.is_primary : idx === 0,
        });
      });
    }

    // Update variants if provided
    if (dto.variants !== undefined) {
      db.product_variants = db.product_variants.filter((v: any) => v.product_id !== id);
      dto.variants.forEach((v) => {
        db.product_variants.push({
          id: v.id || uuidv4(),
          product_id: id,
          sku: v.sku || `${updated.slug}-${v.size || 'STD'}-${v.color || 'DEF'}`.toUpperCase().replace(/\s+/g, '-'),
          size: v.size || null,
          color: v.color || null,
          color_hex: v.colorHex || null,
          price: v.price !== undefined ? v.price : updated.base_price,
          stock_quantity: v.stockQuantity !== undefined ? v.stockQuantity : 10,
          reserved_quantity: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
    }

    saveDb();
    return this.enrichProduct(updated);
  }

  /** Attach image to product */
  attachImage(productId: string, url: string, altText?: string, isPrimary = false) {
    this.findById(productId);
    const image = {
      id: uuidv4(),
      product_id: productId,
      url,
      object_key: url,
      alt_text: altText || null,
      sort_order: db.product_images.filter((i: any) => i.product_id === productId).length,
      is_primary: isPrimary,
    };
    db.product_images.push(image);
    saveDb();
    return image;
  }

  /** Delete product (admin) */
  remove(id: string) {
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    db.products.splice(idx, 1);
    // Cascade delete variants, images, etc.
    db.product_variants = db.product_variants.filter((v) => v.product_id !== id);
    db.product_images = db.product_images.filter((i) => i.product_id !== id);
    db.product_collections = db.product_collections.filter((pc) => pc.product_id !== id);
    if (db.wishlists) {
      db.wishlists = db.wishlists.filter((w) => w.product_id !== id);
    }
    if (db.reviews) {
      db.reviews = db.reviews.filter((r) => r.product_id !== id);
    }
    saveDb();
  }

  /** Add variant to product */
  addVariant(productId: string, dto: CreateVariantDto) {
    this.findById(productId);
    if (db.product_variants.some((v) => v.sku === dto.sku)) {
      throw new ConflictException({ code: 'SKU_TAKEN', message: `SKU "${dto.sku}" already exists` });
    }

    const variant = {
      id: uuidv4(),
      product_id: productId,
      sku: dto.sku,
      size: dto.size || null,
      color: dto.color || null,
      color_hex: dto.colorHex || null,
      price: dto.price,
      stock_quantity: dto.stockQuantity,
      reserved_quantity: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.product_variants.push(variant);
    saveDb();
    return variant;
  }


  /** Get available filter values for a set of products */
  getFilters(categorySlug?: string) {
    let products = db.products.filter((p) => p.status === 'active');
    if (categorySlug) {
      const cat = getCategoryBySlug(categorySlug);
      if (cat) products = products.filter((p) => p.category_id === cat.id);
    }

    const variants: any[] = [];
    for (const p of products) {
      variants.push(...getVariantsByProductId(p.id).filter((v) => v.is_active));
    }

    const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
    const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
    const priceRange = {
      min: Math.min(...products.map((p) => p.base_price)),
      max: Math.max(...products.map((p) => p.base_price)),
    };

    return { sizes, colors, priceRange };
  }

  /** Enrich product with relations — uses O(1) index lookups */
  private enrichProduct(product: any) {
    const category = getCategoryById(product.category_id);
    const variants = getVariantsByProductId(product.id);
    const images = getImagesByProductId(product.id);
    const collectionIds = getProductIdsByCollectionId(product.id); // note: reuse via mapping
    // For collections, we still need to look up from product_collections since index is collection→products
    const pcCollectionIds = db.product_collections
      .filter((pc) => pc.product_id === product.id)
      .map((pc) => pc.collection_id);
    const collections = pcCollectionIds.map((cid) => {
      const c = require('../common/database/db-index.service').getCollectionById(cid);
      return c ? { id: c.id, name: c.name, slug: c.slug } : null;
    }).filter(Boolean);
    const reviews = getReviewsByProductId(product.id).filter((r) => r.status === 'approved');
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : null;

    return {
      ...product,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        colorHex: v.color_hex,
        price: v.price,
        inStock: v.stock_quantity - v.reserved_quantity > 0,
        stockQuantity: v.stock_quantity,
        reservedQuantity: v.reserved_quantity,
      })),
      images: [...images].sort((a: any, b: any) => a.sort_order - b.sort_order),
      collections,
      reviewCount: reviews.length,
      avgRating,
    };
  }
}
