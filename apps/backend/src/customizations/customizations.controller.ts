import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomizationsService } from './customizations.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Customizations')
@Controller('customizations')
export class CustomizationsController {
  constructor(private readonly customizationsService: CustomizationsService) {}

  // ── Customizer Studio Configuration ──
  @Get('studio/config')
  @ApiOperation({ summary: 'Get customizer studio garments and color mockups' })
  getStudioConfig() {
    return this.customizationsService.getStudioConfig();
  }

  @Put('studio/config')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update entire customizer studio configuration (admin)' })
  updateStudioConfig(@Body() body: any) {
    return this.customizationsService.updateStudioConfig(body);
  }

  @Post('studio/garments/:garmentId/colors')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new color and photo mockup to a garment (admin)' })
  addColor(
    @Param('garmentId') garmentId: string,
    @Body() body: { name: string; hex: string; frontImageUrl: string; backImageUrl?: string; textContrast?: string; isActive?: boolean },
  ) {
    return this.customizationsService.addColorToGarment(garmentId, body);
  }

  @Patch('studio/garments/:garmentId/colors/:colorId')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a garment color and mockup photo (admin)' })
  updateColor(
    @Param('garmentId') garmentId: string,
    @Param('colorId') colorId: string,
    @Body() body: any,
  ) {
    return this.customizationsService.updateGarmentColor(garmentId, colorId, body);
  }

  @Delete('studio/garments/:garmentId/colors/:colorId')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a color and mockup from a garment (admin)' })
  deleteColor(
    @Param('garmentId') garmentId: string,
    @Param('colorId') colorId: string,
  ) {
    return this.customizationsService.deleteGarmentColor(garmentId, colorId);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 25, ttl: 60000 } })
  @ApiOperation({ summary: 'Save new custom design project (Rate limited: 25 req/min)' })
  save(
    @Req() req: any,
    @Body()
    body: {
      productId: string;
      productSlug?: string;
      designJson: any;
      previewKey?: string;
      printFileKey?: string;
      printSpec?: any;
      customerNotes?: string;
    },
  ) {
    // The owner is always the authenticated caller — never a client-supplied
    // userId, which previously let anyone save a design into any account
    // (or silently onto a hardcoded 'usr-cust-1' account when omitted).
    return this.customizationsService.saveCustomization({ ...body, userId: req.user.id });
  }

  @Get('queue')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list custom design print queue' })
  getQueue(@Query('status') status?: string, @Query('search') search?: string) {
    return this.customizationsService.getQueue({ status, search });
  }

  @Get('requirements')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List custom requirements / bulk inquiries (admin)' })
  getRequirements(@Query('status') status?: string, @Query('search') search?: string) {
    return this.customizationsService.getRequirements({ status, search });
  }

  // Public: a "request a bulk quote" style inquiry form, rate-limited.
  @Post('requirements')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit new custom requirement (Rate limited: 10 req/min)' })
  createRequirement(@Body() body: any) {
    return this.customizationsService.createRequirement(body);
  }

  @Patch('requirements/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update custom requirement status, budget, or notes (admin)' })
  updateRequirement(@Param('id') id: string, @Body() body: any) {
    return this.customizationsService.updateRequirement(id, body);
  }

  // Ownership-checked: a saved design can contain a customer's own artwork
  // and notes, so any logged-in user may fetch it only if it's theirs
  // (staff can access any of them).
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get custom design by ID (owner or staff only)' })
  findById(@Req() req: any, @Param('id') id: string) {
    const design = this.customizationsService.findById(id);
    const isPrivileged =
      req.user.roles?.includes('SUPER_ADMIN') ||
      req.user.roles?.includes('ADMIN') ||
      req.user.permissions?.includes('*') ||
      req.user.permissions?.includes('customizations.manage');
    if (design.user_id !== req.user.id && !isPrivileged) {
      throw new ForbiddenException({
        code: 'CUSTOMIZATION_ACCESS_DENIED',
        message: 'You do not have permission to view this design.',
      });
    }
    return design;
  }

  // Ownership-checked: always resolve against the authenticated caller,
  // never the URL param, so one customer can't read another's saved designs
  // by editing the :userId in the request.
  @Get('user/:userId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List saved designs for the authenticated user' })
  findByUser(@Req() req: any, @Param('userId') userId: string) {
    const isPrivileged =
      req.user.roles?.includes('SUPER_ADMIN') ||
      req.user.roles?.includes('ADMIN') ||
      req.user.permissions?.includes('*') ||
      req.user.permissions?.includes('customizations.manage');
    const targetUserId = isPrivileged ? userId : req.user.id;
    return this.customizationsService.findByUser(targetUserId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customization review/print status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; printStatus?: string },
  ) {
    return this.customizationsService.updateStatus(id, body.status, body.printStatus);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('customizations.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all customizations (admin)' })
  getAll() {
    return this.customizationsService.getQueue();
  }
}
