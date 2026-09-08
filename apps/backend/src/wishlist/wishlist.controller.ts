import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get authenticated user wishlist' })
  getUserWishlist(@Req() req: any) {
    return this.wishlistService.getUserWishlist(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to authenticated user wishlist' })
  addToWishlist(@Req() req: any, @Body('productId') productId: string) {
    return this.wishlistService.addToWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from authenticated user wishlist' })
  removeFromWishlist(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in authenticated user wishlist' })
  isInWishlist(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.isInWishlist(req.user.id, productId);
  }
}

