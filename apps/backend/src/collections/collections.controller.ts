import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Cacheable } from '../common/interceptors/cache.interceptor';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @Cacheable(60000)
  @ApiOperation({ summary: 'List all active collections with product counts' })
  findAll() {
    return this.collectionsService.findAll();
  }

  @Get(':slug')
  @Cacheable(60000)
  @ApiOperation({ summary: 'Get collection by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.collectionsService.findBySlug(slug);
  }

  // Was AuthGuard only, which meant any logged-in customer (not just staff)
  // could create/edit/delete collections. Now requires a staff role.
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('collections.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create collection (admin)' })
  create(@Body() body: { name: string; slug: string; description?: string; bannerKey?: string }) {
    return this.collectionsService.create(body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('collections.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update collection (admin)' })
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; slug: string; description: string; isActive: boolean }>) {
    return this.collectionsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('collections.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete collection (admin)' })
  remove(@Param('id') id: string) {
    this.collectionsService.remove(id);
    return { success: true, message: 'Collection deleted successfully' };
  }
}
