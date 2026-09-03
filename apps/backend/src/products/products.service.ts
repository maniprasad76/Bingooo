import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';
import { ProductQueryDto, CreateProductDto, UpdateProductDto, CreateVariantDto } from './dto/product.dto';

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
      const cat = db.categories.find((c) => c.slug === query.categorySlug);
      if (cat) items = items.filter((p) => p.category_id === cat.id);
      else items = [];
    }

    // Filter: collection
    if (query.collectionSlug) {
      const col = db.collections.find((c) => c.slug === query.collectionSlug);
      if (col) {
        const productIds = db.product_collections
          .filter((pc) => pc.collection_id === col.id)
          .map((pc) => pc.product_id);
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
        db.product_variants.some(
          (v) => v.product_id === p.id && v.is_active && sizes.includes(v.size?.toUpperCase()),
        ),
      );
    }
    if (query.colors) {
      const colors = query.colors.split(',').map((c) => c.trim().toLowerCase());
      items = items.filter((p) =>
        db.product_variants.some(
          (v) => v.product_id === p.id && v.is_active && colors.includes(v.color?.toLowerCase()),
        ),
      );
    }

    // Search
    if (query.search) {
      const term = query.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)),
      );
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

  /** Get single product by slug */
  findBySlug(slug: string) {
    const product = db.products.find((p) => p.slug === slug);
    if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: `Product "${slug}" not found` });
    return this.enrichProduct(product);
  }

  /** Get single product by ID */
  findById(id: string) {
    const product = db.products.find((p) => p.id === id);
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.products.push(product);
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
      ...(dto.status !== undefined && { status: dto.status }),
      updated_at: new Date().toISOString(),
    };

    db.products[idx] = updated;
    return this.enrichProduct(updated);
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
    return variant;
  }

  /** Get available filter values for a set of products */
  getFilters(categorySlug?: string) {
    let products = db.products.filter((p) => p.status === 'active');
    if (categorySlug) {
      const cat = db.categories.find((c) => c.slug === categorySlug);
      if (cat) products = products.filter((p) => p.category_id === cat.id);
    }

    const productIds = products.map((p) => p.id);
    const variants = db.product_variants.filter(
      (v) => productIds.includes(v.product_id) && v.is_active,
    );

    const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
    const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
    const priceRange = {
      min: Math.min(...products.map((p) => p.base_price)),
      max: Math.max(...products.map((p) => p.base_price)),
    };

    return { sizes, colors, priceRange };
  }

  /** Enrich product with relations */
  private enrichProduct(product: any) {
    const category = db.categories.find((c) => c.id === product.category_id);
    const variants = db.product_variants.filter((v) => v.product_id === product.id);
    const images = db.product_images.filter((i) => i.product_id === product.id);
    const collectionIds = db.product_collections
      .filter((pc) => pc.product_id === product.id)
      .map((pc) => pc.collection_id);
    const collections = db.collections.filter((c) => collectionIds.includes(c.id));
    const reviews = db.reviews.filter((r) => r.product_id === product.id && r.status === 'approved');
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
      images: images.sort((a: any, b: any) => a.sort_order - b.sort_order),
      collections: collections.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      reviewCount: reviews.length,
      avgRating,
    };
  }
}
