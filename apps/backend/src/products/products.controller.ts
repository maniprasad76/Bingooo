import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto, CreateProductDto, UpdateProductDto, CreateVariantDto } from './dto/product.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products with filters, search, sort, pagination' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('filters')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product (admin)' })
  remove(@Param('id') id: string) {
    this.productsService.remove(id);
  }

  @Post(':id/variants')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('products.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add variant to product (admin)' })
  addVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.productsService.addVariant(id, dto);
  }
}
