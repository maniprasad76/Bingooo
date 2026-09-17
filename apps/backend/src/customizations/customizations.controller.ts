import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomizationsService } from './customizations.service';

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
  @ApiOperation({ summary: 'Update entire customizer studio configuration' })
  updateStudioConfig(@Body() body: any) {
    return this.customizationsService.updateStudioConfig(body);
  }

  @Post('studio/garments/:garmentId/colors')
  @ApiOperation({ summary: 'Add a new color and photo mockup to a garment' })
  addColor(
    @Param('garmentId') garmentId: string,
    @Body() body: { name: string; hex: string; frontImageUrl: string; backImageUrl?: string; textContrast?: string; isActive?: boolean },
  ) {
    return this.customizationsService.addColorToGarment(garmentId, body);
  }

  @Patch('studio/garments/:garmentId/colors/:colorId')
  @ApiOperation({ summary: 'Update a garment color and mockup photo' })
  updateColor(
    @Param('garmentId') garmentId: string,
    @Param('colorId') colorId: string,
    @Body() body: any,
  ) {
    return this.customizationsService.updateGarmentColor(garmentId, colorId, body);
  }

  @Delete('studio/garments/:garmentId/colors/:colorId')
  @ApiOperation({ summary: 'Delete a color and mockup from a garment' })
  deleteColor(
    @Param('garmentId') garmentId: string,
    @Param('colorId') colorId: string,
  ) {
    return this.customizationsService.deleteGarmentColor(garmentId, colorId);
  }

  @Post()
  @Throttle({ default: { limit: 25, ttl: 60000 } })
  @ApiOperation({ summary: 'Save new custom design project (Rate limited: 25 req/min)' })
  save(
    @Req() req: any,
    @Body()
    body: {
      userId?: string;
      productId: string;
      productSlug?: string;
      designJson: any;
      previewKey?: string;
      printFileKey?: string;
      printSpec?: any;
      customerNotes?: string;
    },
  ) {
    const activeUserId = req?.user?.id || body.userId || 'usr-cust-1';
    return this.customizationsService.saveCustomization({ ...body, userId: activeUserId });
  }

  @Get('queue')
  @ApiOperation({ summary: 'Admin list custom design print queue' })
  getQueue(@Query('status') status?: string, @Query('search') search?: string) {
    return this.customizationsService.getQueue({ status, search });
  }

  @Get('requirements')
  @ApiOperation({ summary: 'List custom requirements / bulk inquiries' })
  getRequirements(@Query('status') status?: string, @Query('search') search?: string) {
    return this.customizationsService.getRequirements({ status, search });
  }

  @Post('requirements')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit new custom requirement (Rate limited: 10 req/min)' })
  createRequirement(@Body() body: any) {
    return this.customizationsService.createRequirement(body);
  }

  @Patch('requirements/:id')
  @ApiOperation({ summary: 'Update custom requirement status, budget, or notes' })
  updateRequirement(@Param('id') id: string, @Body() body: any) {
    return this.customizationsService.updateRequirement(id, body);
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
  @ApiOperation({ summary: 'Update customization review/print status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; printStatus?: string },
  ) {
    return this.customizationsService.updateStatus(id, body.status, body.printStatus);
  }

  @Get()
  @ApiOperation({ summary: 'List all customizations' })
  getAll() {
    return this.customizationsService.getQueue();
  }
}
