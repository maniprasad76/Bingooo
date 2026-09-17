import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { db, saveDb } from '../common/database/store';


@Injectable()
export class MediaService {
  private readonly uploadDir: string;

  constructor() {
    // Ensure uploads directory exists in apps/backend/uploads
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /** Get absolute path of an uploaded file, validating against traversal */
  getFilePath(filename: string): string {
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.uploadDir, safeFilename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException({ code: 'FILE_NOT_FOUND', message: `File "${filename}" not found` });
    }
    return filePath;
  }

  /** Save file uploaded via multipart/form-data */
  async saveUploadedFile(
    file: Express.Multer.File,
    category?: string,
    customName?: string,
  ) {
    if (!file) {
      throw new BadRequestException({ code: 'NO_FILE_PROVIDED', message: 'No file was uploaded' });
    }

    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      throw new BadRequestException({
        code: 'FILE_TOO_LARGE',
        message: `File exceeds maximum allowed size of ${maxMb}MB`,
      });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        code: 'INVALID_FILE_TYPE',
        message: 'Only JPG, PNG, WEBP, SVG, and GIF files are supported',
      });
    }

    const originalName = customName || file.originalname || 'uploaded-image.png';
    const ext = path.extname(originalName) || (file.mimetype === 'image/png' ? '.png' : '.jpg');
    const sanitizedBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}-${uuidv4().slice(0, 8)}-${sanitizedBase}${ext}`;
    const destinationPath = path.join(this.uploadDir, filename);

    fs.writeFileSync(destinationPath, file.buffer);

    const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const publicUrl = `${baseUrl}/api/v1/media/file/${filename}`;

    const { db } = require('../common/database/store');
    const asset = {
      id: `asset-${Date.now()}-${uuidv4().slice(0, 6)}`,
      name: originalName,
      category: category || 'products',
      url: publicUrl,
      sizeBytes: file.size,
      dimensions: '1600x2000',
      uploaded_at: new Date().toISOString(),
    };

    if (!db.media_assets) {
      db.media_assets = [];
    }
    db.media_assets.unshift(asset);

    return {
      success: true,
      url: publicUrl,
      asset,
    };
  }

  /** Save file uploaded via Base64 dataURL (e.g. from customizer canvas) */
  async saveBase64File(dataUrl: string, category?: string, customName?: string) {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      throw new BadRequestException({ code: 'INVALID_DATA_URL', message: 'Invalid base64 data URL' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new BadRequestException({ code: 'MALFORMED_DATA_URL', message: 'Malformed data URL' });
    }

    const mimetype = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = mimetype === 'image/png' ? '.png' : mimetype === 'image/webp' ? '.webp' : '.jpg';
    const originalName = customName || `artwork-${Date.now()}${ext}`;
    const filename = `${Date.now()}-${uuidv4().slice(0, 8)}-${path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;
    const destinationPath = path.join(this.uploadDir, filename);

    fs.writeFileSync(destinationPath, buffer);

    const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const publicUrl = `${baseUrl}/api/v1/media/file/${filename}`;

    const { db } = require('../common/database/store');
    const asset = {
      id: `asset-${Date.now()}-${uuidv4().slice(0, 6)}`,
      name: originalName,
      category: category || 'designs',
      url: publicUrl,
      sizeBytes: buffer.length,
      dimensions: '1200x1200',
      uploaded_at: new Date().toISOString(),
    };

    if (!db.media_assets) {
      db.media_assets = [];
    }
    db.media_assets.unshift(asset);

    return {
      success: true,
      url: publicUrl,
      asset,
    };
  }

  /** Generate presigned upload URL for Cloudflare R2 / S3 */
  getPresignedUrl(fileName: string, fileType: string, fileSize?: number) {
    const maxMb = 10;
    if (fileSize && fileSize > maxMb * 1024 * 1024) {
      throw new BadRequestException({ code: 'FILE_TOO_LARGE', message: `File exceeds maximum allowed size of ${maxMb}MB` });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(fileType)) {
      throw new BadRequestException({ code: 'INVALID_FILE_TYPE', message: 'Only JPG, PNG, WEBP, and SVG files are supported' });
    }

    const key = `uploads/${Date.now()}-${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadUrl = `http://localhost:3000/api/v1/media/upload`;
    const publicUrl = `http://localhost:3000/api/v1/media/file/${encodeURIComponent(fileName)}`;

    return {
      uploadUrl,
      publicUrl,
      key,
      expiresIn: 3600,
    };
  }

  /** Media asset management for admin panel */
  listAssets(category?: string, search?: string) {
    const { db } = require('../common/database/store');
    let items = [...(db.media_assets || [])];
    if (category && category !== 'all') {
      items = items.filter((a) => a.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q),
      );
    }
    return items;
  }

  createAsset(data: { name: string; category?: string; url: string; sizeBytes?: number; dimensions?: string }) {
    const { db } = require('../common/database/store');
    const asset = {
      id: `asset-${Date.now()}-${uuidv4().slice(0, 6)}`,
      name: data.name,
      category: data.category || 'products',
      url: data.url,
      sizeBytes: data.sizeBytes || 500000,
      dimensions: data.dimensions || '1200x1200',
      uploaded_at: new Date().toISOString(),
    };
    if (!db.media_assets) {
      db.media_assets = [];
    }
    db.media_assets.unshift(asset);
    saveDb();
    return asset;
  }

  deleteAsset(id: string) {
    if (!db.media_assets) db.media_assets = [];
    db.media_assets = db.media_assets.filter((a: any) => a.id !== id);
    saveDb();
    return { success: true, id };
  }
}



