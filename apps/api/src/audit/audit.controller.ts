import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // TODO: Implement endpoints: GET /logs
}
