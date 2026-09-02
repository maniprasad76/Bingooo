import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomizationsService } from './customizations.service';

@ApiTags('Customizations')
@Controller('customizations')
export class CustomizationsController {
  constructor(private readonly customizationsService: CustomizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Save new custom design project' })
  save(@Body() body: { userId?: string; productId: string; designJson: any; previewKey?: string; printFileKey?: string }) {
    return this.customizationsService.saveCustomization(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get custom design by ID' })
  findById(@Param('id') id: string) {
    return this.customizationsService.findById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List saved designs for user' })
  findByUser(@Param('userId') userId: string) {
    return this.customizationsService.findByUser(userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update customization review status (admin)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.customizationsService.updateStatus(id, status);
  }

  @Get()
  @ApiOperation({ summary: 'List all customizations for admin review' })
  getAllForAdmin() {
    return this.customizationsService.getAllForAdmin();
  }
}
