import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto, CreateProductDto, UpdateProductDto, CreateVariantDto } from './dto/product.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Cacheable } from '../common/interceptors/cache.interceptor';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Cacheable(30000)
  @ApiOperation({ summary: 'List products with filters, search, sort, pagination' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('filters')
  @Cacheable(60000)
  @ApiOperation({ summary: 'Get available filter values (sizes, colors, price range)' })
  getFilters(@Query('categorySlug') categorySlug?: string) {
    return this.productsService.getFilters(categorySlug);
  }

  @Get('admin/catalog')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('products.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all catalog items for operations' })
  findAllForAdmin() {
    return this.productsService.findAllForAdmin();
  }

  @Get(':slug')
  @Cacheable(60000)
  @ApiOperation({ summary: 'Get product by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('products.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product (admin)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('products.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('products.delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (admin)' })
  remove(@Param('id') id: string) {
    this.productsService.remove(id);
    return { success: true, message: 'Product deleted successfully' };
  }

  @Post(':id/variants')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('products.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add variant to product (admin)' })
  addVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.productsService.addVariant(id, dto);
  }

  @Post(':id/images')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('products.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Attach image to product (admin)' })
  attachImage(
    @Param('id') id: string,
    @Body() body: { url: string; altText?: string; isPrimary?: boolean },
  ) {
    return this.productsService.attachImage(id, body.url, body.altText, body.isPrimary);
  }
}
