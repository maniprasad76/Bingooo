import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Cacheable } from '../common/interceptors/cache.interceptor';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Cacheable(60000)
  @ApiOperation({ summary: 'List all active categories with product counts' })
  findAll(@Query('all') all?: string) {
    return this.categoriesService.findAll(all === 'true');
  }

  @Get(':slug')
  @Cacheable(60000)
  @ApiOperation({ summary: 'Get category by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('categories.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (admin)' })
  create(@Body() body: { name: string; slug: string; parentId?: string }) {
    return this.categoriesService.create(body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('categories.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (admin)' })
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; slug: string; isActive: boolean }>) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('categories.delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (admin)' })
  remove(@Param('id') id: string) {
    this.categoriesService.remove(id);
    return { success: true, message: 'Category deleted successfully' };
  }
}
