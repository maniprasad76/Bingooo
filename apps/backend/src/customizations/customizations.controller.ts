import { Controller, Get, Post, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomizationsService } from './customizations.service';

@ApiTags('Customizations')
@Controller('customizations')
export class CustomizationsController {
  constructor(private readonly customizationsService: CustomizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Save new custom design project' })
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
  @ApiOperation({ summary: 'Submit new custom requirement' })
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
