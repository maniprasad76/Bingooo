import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomizationsService } from './customizations.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

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
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.review')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customization review status (admin)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.customizationsService.updateStatus(id, status);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all customizations for admin review' })
  getAllForAdmin() {
    return this.customizationsService.getAllForAdmin();
  }
}
