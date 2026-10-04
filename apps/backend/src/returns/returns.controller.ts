import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReturnsService, CreateReturnDto, UpdateReturnStatusDto, RefundReturnDto } from './returns.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a new customer return request for authenticated user' })
  create(@Req() req: any, @Body() body: CreateReturnDto) {
    return this.returnsService.create(req.user.id, body);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user returns' })
  findMyReturns(@Req() req: any) {
    return this.returnsService.findMyReturns(req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('returns.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list all returns (Staff/Admin only)' })
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.returnsService.findAll({ status, search });
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('returns.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin update return workflow status (not refunds)' })
  updateStatus(@Param('id') id: string, @Body() body: UpdateReturnStatusDto) {
    return this.returnsService.updateStatus(id, body);
  }

  @Post(':id/refund')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('refunds.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a return through Razorpay (moves real money)' })
  refund(@Param('id') id: string, @Body() body: RefundReturnDto, @Req() req: any) {
    return this.returnsService.refund(id, body.notes, { email: req.user.email, ip: req.ip });
  }
}

