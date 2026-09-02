import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // TODO: Implement endpoints: none yet
}
