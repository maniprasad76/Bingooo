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
import { ReturnsService, CreateReturnDto } from './returns.service';
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
  @Permissions('orders.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list all returns (Staff/Admin only)' })
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.returnsService.findAll({ status, search });
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('orders.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin update return status (Staff/Admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.returnsService.updateStatus(id, body.status, body.notes);
  }
}

