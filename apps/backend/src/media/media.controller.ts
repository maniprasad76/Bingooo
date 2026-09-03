import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

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
}
