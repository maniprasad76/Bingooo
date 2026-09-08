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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

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
    @Body() dto: CreateReviewDto,
  ) {
    const activeUserId = req?.user?.id || dto.userId || 'usr-cust-1';
    return this.reviewsService.createReview({ ...dto, userId: activeUserId });
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
