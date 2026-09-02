import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active categories with product counts' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (admin)' })
  create(@Body() body: { name: string; slug: string; parentId?: string }) {
    return this.categoriesService.create(body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (admin)' })
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; slug: string; isActive: boolean }>) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category (admin)' })
  remove(@Param('id') id: string) {
    this.categoriesService.remove(id);
  }
}
