import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService, BannerItem } from './banners.service';
import { Cacheable } from '../common/interceptors/cache.interceptor';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // Public: storefront hero carousel.
  @Get()
  @Cacheable(60000)
  @ApiOperation({ summary: 'Get all active banners for storefront hero carousel' })
  findAllActive() {
    return this.bannersService.findAllActive();
  }

  // Everything below is admin content management. Previously unauthenticated:
  // anyone could replace/delete the banners every storefront visitor sees.
  @Get('all')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('banners.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all banners including inactive (admin)' })
  findAllAdmin() {
    return this.bannersService.findAllAdmin();
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('banners.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get banner by ID (admin)' })
  findById(@Param('id') id: string) {
    return this.bannersService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('banners.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new hero banner (admin)' })
  create(@Body() body: Omit<BannerItem, 'id'>) {
    return this.bannersService.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('banners.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hero banner (admin)' })
  update(@Param('id') id: string, @Body() body: Partial<BannerItem>) {
    return this.bannersService.update(id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('banners.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Patch hero banner (admin)' })
  patch(@Param('id') id: string, @Body() body: Partial<BannerItem>) {
    return this.bannersService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('banners.manage')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete hero banner (admin)' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
