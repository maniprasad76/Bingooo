import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@Controller('audit')
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
