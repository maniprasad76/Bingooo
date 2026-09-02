import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // TODO: Implement endpoints: none yet
}
