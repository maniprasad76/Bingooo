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
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BannersService, BannerItem } from './banners.service';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active banners for storefront hero carousel' })
  findAllActive() {
    return this.bannersService.findAllActive();
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all banners including inactive (admin)' })
  findAllAdmin() {
    return this.bannersService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID' })
  findById(@Param('id') id: string) {
    return this.bannersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new hero banner' })
  create(@Body() body: Omit<BannerItem, 'id'>) {
    return this.bannersService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update hero banner' })
  update(@Param('id') id: string, @Body() body: Partial<BannerItem>) {
    return this.bannersService.update(id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Patch hero banner' })
  patch(@Param('id') id: string, @Body() body: Partial<BannerItem>) {
    return this.bannersService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete hero banner' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
