import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, MergeCartDto } from './dto/cart.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { verifyToken } from '../common/utils/crypto.util';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private extractVerifiedUserId(req: any): string | undefined {
    // 1. If req.user is set by guard
    if (req?.user?.id) return req.user.id;

    // 2. Safely parse token if present
    const auth = req?.headers?.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      const payload = verifyToken(auth.slice(7).trim());
      if (payload?.sub) return payload.sub;
    }

    if (req?.cookies?.access_token) {
      const payload = verifyToken(req.cookies.access_token);
      if (payload?.sub) return payload.sub;
    }

    // Never trust client-supplied query params for userId
    return undefined;
  }

  @Get()
  @ApiOperation({ summary: 'Get current user or guest cart' })
  @ApiHeader({ name: 'x-session-id', required: false })
  getCart(@Req() req: any, @Headers('x-session-id') sessionId?: string) {
    const userId = this.extractVerifiedUserId(req);
    return this.cartService.getOrCreateCart(userId, sessionId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(@Req() req: any, @Body() dto: AddToCartDto, @Headers('x-session-id') sessionId?: string) {
    if (!dto.sessionId && sessionId) dto.sessionId = sessionId;
    const userId = this.extractVerifiedUserId(req);
    return this.cartService.addItem(dto, userId);
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
  clearCart(@Req() req: any, @Headers('x-session-id') sessionId?: string) {
    const userId = this.extractVerifiedUserId(req);
    return this.cartService.clearCart(userId, sessionId);
  }

  @Post('merge')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Merge guest cart into authenticated user cart' })
  mergeCart(@Req() req: any, @Body() dto: MergeCartDto) {
    return this.cartService.mergeCart(dto.guestSessionId, req.user.id);
  }
}

