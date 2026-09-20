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
  UseGuards,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import * as path from 'path';
import { MediaService } from './media.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // Only the admin console uploads/manages media — the customer storefront
  // never calls these routes — so gating them behind admin auth doesn't
  // affect the storefront. Left ungated, these previously allowed anyone
  // to upload arbitrary files or wipe the media library with no login.
  @Post('upload')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('media.manage')
  @ApiBearerAuth()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload an image or asset file (Staff/Admin only, rate limited: 20 req/min)' })
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
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('media.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get presigned upload URL for Cloudflare R2 (Staff/Admin only)' })
  getPresignedUrl(@Body() body: { fileName: string; fileType: string; fileSize?: number }) {
    return this.mediaService.getPresignedUrl(body.fileName, body.fileType, body.fileSize);
  }

  @Post('mock-upload')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('media.manage')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mock upload target for development (Staff/Admin only)' })
  mockUpload() {
    return { success: true, message: 'File uploaded successfully' };
  }

  @Get('assets')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('media.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List media assets library (Staff/Admin only)' })
  listAssets(@Query('category') category?: string, @Query('search') search?: string) {
    return this.mediaService.listAssets(category, search);
  }

  @Post('assets')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('media.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register uploaded media asset (Staff/Admin only)' })
  createAsset(@Body() body: { name: string; category?: string; url: string; sizeBytes?: number; dimensions?: string }) {
    return this.mediaService.createAsset(body);
  }

  @Post('assets/:id/delete')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('media.manage')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete media asset (Staff/Admin only)' })
  deleteAsset(@Param('id') id: string) {
    return this.mediaService.deleteAsset(id);
  }
}

