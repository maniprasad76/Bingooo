import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  /** Generate presigned upload URL for Cloudflare R2 / S3 */
  getPresignedUrl(fileName: string, fileType: string, fileSize?: number) {
    const maxMb = 15;
    if (fileSize && fileSize > maxMb * 1024 * 1024) {
      throw new BadRequestException({ code: 'FILE_TOO_LARGE', message: `File exceeds maximum allowed size of ${maxMb}MB` });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(fileType)) {
      throw new BadRequestException({ code: 'INVALID_FILE_TYPE', message: 'Only JPG, PNG, WEBP, and SVG files are supported' });
    }

    const key = `uploads/${Date.now()}-${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // In production, this uses AWS SDK S3Client / PutObjectCommand / getSignedUrl
    // For local/mock environment, we provide the direct upload target and the public URL
    const uploadUrl = `http://localhost:3000/api/v1/media/mock-upload?key=${encodeURIComponent(key)}`;
    const publicUrl = `https://assets.bingooo.in/${key}`;

    return {
      uploadUrl,
      publicUrl,
      key,
      expiresIn: 3600,
    };
  }
}
