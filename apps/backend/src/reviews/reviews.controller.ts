import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get approved reviews for product' })
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user submitted reviews' })
  findMyReviews(@Req() req: any, @Query('userId') userId?: string) {
    const activeUserId = req?.user?.id || userId || 'usr-cust-1';
    return this.reviewsService.findByUser(activeUserId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit product review' })
  create(
    @Req() req: any,
    @Body()
    body: {
      productId: string;
      userId?: string;
      rating: number;
      title?: string;
      body?: string;
      customerName?: string;
      imageUrl?: string;
    },
  ) {
    const activeUserId = req?.user?.id || body.userId || 'usr-cust-1';
    return this.reviewsService.createReview({ ...body, userId: activeUserId });
  }

  // ── Admin Endpoints ──

  @Get('admin/all')
  @ApiOperation({ summary: 'Admin list all reviews with moderation filters' })
  getAllAdmin(@Query('status') status?: string, @Query('search') search?: string) {
    return this.reviewsService.getAllAdmin(status, search);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin approve or reject review' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'rejected' | 'pending' },
  ) {
    return this.reviewsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Admin delete review' })
  delete(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }
}
