import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'List stock by sellable variant' })
  findAll(@Query('search') search?: string, @Query('lowStock') lowStock?: string) {
    return this.inventoryService.findAll(search, lowStock === 'true');
  }

  @Patch(':id/adjust')
  @Permissions('inventory.update')
  @ApiOperation({ summary: 'Apply a manual stock adjustment' })
  adjust(
    @Param('id') id: string,
    @Body() body: { quantity: number; reason?: string },
    @Req() request: { user?: { id?: string } },
  ) {
    return this.inventoryService.adjust(id, body.quantity, body.reason, request.user?.id);
  }

  @Get(':id/history')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'List stock movement history for a variant' })
  history(@Param('id') id: string) {
    return this.inventoryService.history(id);
  }
}
