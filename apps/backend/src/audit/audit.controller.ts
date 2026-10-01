import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(AuthGuard, RolesGuard)
@Permissions('audit.read')
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List security and operational audit trail logs' })
  findAll(
    @Query('search') search?: string,
    @Query('resource') resource?: string,
  ) {
    return this.auditService.findAll({ search, resource });
  }
}
