import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReturnsService, CreateReturnDto } from './returns.service';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new customer return request' })
  create(@Req() req: any, @Body() body: CreateReturnDto, @Query('userId') userId?: string) {
    const activeUserId = req?.user?.id || userId || 'usr-cust-1';
    return this.returnsService.create(activeUserId, body);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user returns' })
  findMyReturns(@Req() req: any, @Query('userId') userId?: string) {
    const activeUserId = req?.user?.id || userId || 'usr-cust-1';
    return this.returnsService.findMyReturns(activeUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Admin list all returns' })
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.returnsService.findAll({ status, search });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin update return status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.returnsService.updateStatus(id, body.status, body.notes);
  }
}
