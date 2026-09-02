import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  getUserWishlist(@Query('userId') userId = 'mock-user-id') {
    return this.wishlistService.getUserWishlist(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  addToWishlist(@Body('productId') productId: string, @Query('userId') userId = 'mock-user-id') {
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeFromWishlist(@Param('productId') productId: string, @Query('userId') userId = 'mock-user-id') {
    return this.wishlistService.removeFromWishlist(userId, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  isInWishlist(@Param('productId') productId: string, @Query('userId') userId = 'mock-user-id') {
    return this.wishlistService.isInWishlist(userId, productId);
  }
}
