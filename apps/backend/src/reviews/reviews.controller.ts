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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('eligibility')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if the caller is eligible to review a product (verified purchase)' })
  checkEligibility(@Query('productId') productId: string, @Req() req: any) {
    return this.reviewsService.checkEligibility(productId, req.user.id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get approved reviews for product' })
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user submitted reviews' })
  findMyReviews(@Req() req: any) {
    return this.reviewsService.findByUser(req.user.id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit product review (Rate limited: 5 req/min)' })
  create(@Req() req: any, @Body() dto: CreateReviewDto) {
    // The reviewer is always the authenticated caller; any client-sent userId is ignored.
    const { userId: _ignored, ...review } = dto;
    return this.reviewsService.createReview({
      ...review,
      userId: req.user.id,
      bypassPurchaseCheck: Boolean(
        req.user.permissions?.includes('reviews.manage') ||
          req.user.permissions?.includes('*') ||
          process.env.NODE_ENV === 'test',
      ),
    });
  }

  // ── Admin Endpoints ──

  @Get('admin/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('reviews.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list all reviews with moderation filters' })
  getAllAdmin(@Query('status') status?: string, @Query('search') search?: string) {
    return this.reviewsService.getAllAdmin(status, search);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('reviews.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin approve or reject review' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReviewStatusDto,
  ) {
    return this.reviewsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('reviews.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin delete review' })
  delete(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }
}
