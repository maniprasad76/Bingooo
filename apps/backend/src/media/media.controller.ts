import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import * as path from 'path';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload an image or asset file (Rate limited: 20 req/min)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: { category?: string; name?: string; dataUrl?: string },
  ) {
    if (file) {
      return this.mediaService.saveUploadedFile(file, body?.category, body?.name);
    }
    if (body?.dataUrl) {
      return this.mediaService.saveBase64File(body.dataUrl, body.category, body.name);
    }
    return this.mediaService.saveUploadedFile(file as any, body?.category, body?.name);
  }

  @Get('file/:filename')
  @ApiOperation({ summary: 'Serve uploaded static asset' })
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.mediaService.getFilePath(filename);
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.sendFile(filePath);
  }

  @Post('presign')
  @ApiOperation({ summary: 'Get presigned upload URL for Cloudflare R2' })
  getPresignedUrl(@Body() body: { fileName: string; fileType: string; fileSize?: number }) {
    return this.mediaService.getPresignedUrl(body.fileName, body.fileType, body.fileSize);
  }

  @Post('mock-upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mock upload target for development' })
  mockUpload() {
    return { success: true, message: 'File uploaded successfully' };
  }

  @Get('assets')
  @ApiOperation({ summary: 'List media assets library' })
  listAssets(@Query('category') category?: string, @Query('search') search?: string) {
    return this.mediaService.listAssets(category, search);
  }

  @Post('assets')
  @ApiOperation({ summary: 'Register uploaded media asset' })
  createAsset(@Body() body: { name: string; category?: string; url: string; sizeBytes?: number; dimensions?: string }) {
    return this.mediaService.createAsset(body);
  }

  @Post('assets/:id/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete media asset' })
  deleteAsset(@Param('id') id: string) {
    return this.mediaService.deleteAsset(id);
  }
}

