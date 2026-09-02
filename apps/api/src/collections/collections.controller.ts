import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active collections with product counts' })
  findAll() {
    return this.collectionsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get collection by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.collectionsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create collection (admin)' })
  create(@Body() body: { name: string; slug: string; description?: string; bannerKey?: string }) {
    return this.collectionsService.create(body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update collection (admin)' })
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; slug: string; description: string; isActive: boolean }>) {
    return this.collectionsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete collection (admin)' })
  remove(@Param('id') id: string) {
    this.collectionsService.remove(id);
  }
}
