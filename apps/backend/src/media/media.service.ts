import { Injectable, BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { db, saveDb } from '../common/database/store';
import { getUploadsDir } from '../common/utils/paths.util';
import {
  PUBLIC_MEDIA_BUCKET,
  isRemoteStorageEnabled,
  publicObjectUrl,
  uploadObject,
} from '../common/services/remote-storage';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};


@Injectable()
export class MediaService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = getUploadsDir();
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

  /** Get active base URL for media links */
  private getBaseUrl(): string {
    if (process.env.APP_URL) {
      return process.env.APP_URL.replace(/\/$/, '');
    }
    const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.VERCEL;
    return isProd ? 'https://api.bingooo.co.in' : 'http://localhost:3000';
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
    const originalName = customName || file.originalname || 'uploaded-image';
    return this.storeImage(file.buffer, file.mimetype, originalName, category || 'products', '1600x2000');
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

    const buffer = Buffer.from(matches[2], 'base64');
    const originalName = customName || `artwork-${Date.now()}`;
    return this.storeImage(buffer, matches[1], originalName, category || 'designs', '1200x1200');
  }

  /**
   * Validate and persist an image. With DATA_STORE=supabase it goes to the
   * public Supabase Storage bucket, because the API host's disk is wiped on
   * every deploy; otherwise to the local uploads directory.
   */
  private async storeImage(buffer: Buffer, mimetype: string, originalName: string, category: string, dimensions: string) {
    if (buffer.length > MAX_UPLOAD_BYTES) {
      throw new BadRequestException({
        code: 'FILE_TOO_LARGE',
        message: `File exceeds maximum allowed size of ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`,
      });
    }
    // Extension comes from the validated type, never the client's file name,
    // so an "image" can't be stored as .html/.svg and served as markup.
    const ext = IMAGE_EXTENSIONS[mimetype];
    if (!ext) {
      throw new BadRequestException({
        code: 'INVALID_FILE_TYPE',
        message: 'Only JPG, PNG and WEBP images are supported',
      });
    }

    const sanitizedBase = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'image';
    const filename = `${Date.now()}-${uuidv4().slice(0, 8)}-${sanitizedBase}${ext}`;

    let publicUrl: string;
    if (isRemoteStorageEnabled()) {
      const key = `uploads/${filename}`;
      try {
        await uploadObject(PUBLIC_MEDIA_BUCKET, key, buffer, mimetype);
      } catch (err) {
        console.error('[Media] Remote upload failed:', (err as Error).message);
        throw new ServiceUnavailableException({ code: 'UPLOAD_FAILED', message: 'Image storage is unavailable. Please try again.' });
      }
      publicUrl = publicObjectUrl(PUBLIC_MEDIA_BUCKET, key);
    } else {
      fs.writeFileSync(path.join(this.uploadDir, filename), buffer);
      publicUrl = `${this.getBaseUrl()}/api/v1/media/file/${filename}`;
    }

    const asset = {
      id: `asset-${Date.now()}-${uuidv4().slice(0, 6)}`,
      name: originalName,
      category,
      url: publicUrl,
      sizeBytes: buffer.length,
      dimensions,
      uploaded_at: new Date().toISOString(),
    };
    if (!db.media_assets) {
      db.media_assets = [];
    }
    db.media_assets.unshift(asset);
    saveDb();

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

    if (!IMAGE_EXTENSIONS[fileType]) {
      throw new BadRequestException({ code: 'INVALID_FILE_TYPE', message: 'Only JPG, PNG and WEBP images are supported' });
    }

    const baseUrl = this.getBaseUrl();
    const key = `uploads/${Date.now()}-${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadUrl = `${baseUrl}/api/v1/media/upload`;
    const publicUrl = `${baseUrl}/api/v1/media/file/${encodeURIComponent(fileName)}`;

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



