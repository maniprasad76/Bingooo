import { Controller, Get, Post, Patch, Delete, Param, Query, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, MergeCartDto } from './dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user or guest cart' })
  @ApiHeader({ name: 'x-session-id', required: false })
  getCart(@Headers('x-session-id') sessionId?: string, @Query('userId') userId?: string) {
    return this.cartService.getOrCreateCart(userId, sessionId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(@Body() dto: AddToCartDto, @Headers('x-session-id') sessionId?: string) {
    if (!dto.sessionId && sessionId) dto.sessionId = sessionId;
    return this.cartService.addItem(dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(@Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear cart' })
  clearCart(@Headers('x-session-id') sessionId?: string, @Query('userId') userId?: string) {
    return this.cartService.clearCart(userId, sessionId);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart into authenticated user cart' })
  mergeCart(@Body() dto: MergeCartDto, @Query('userId') userId: string) {
    return this.cartService.mergeCart(dto.guestSessionId, userId || 'mock-user-id');
  }
}
