import { Injectable } from '@nestjs/common';
import { db } from '../common/database/store';

export interface AuditLogEntry {
  id: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  created_at: string;
}

@Injectable()
export class AuditService {
  /** Query audit logs with search and resource filtering */
  findAll(query?: { search?: string; resource?: string }) {
    let items = [...db.audit_logs];

    if (query?.resource && query.resource !== 'all') {
      items = items.filter((log) => log.resource.toLowerCase() === query.resource?.toLowerCase());
    }

    if (query?.search) {
      const term = query.search.toLowerCase();
      items = items.filter(
        (log) =>
          log.admin_email?.toLowerCase().includes(term) ||
          log.action?.toLowerCase().includes(term) ||
          log.details?.toLowerCase().includes(term) ||
          log.resource_id?.toLowerCase().includes(term),
      );
    }

    return items.map((log) => ({
      id: log.id,
      adminEmail: log.admin_email,
      action: log.action,
      resource: log.resource,
      resourceId: log.resource_id,
      details: log.details,
      ipAddress: log.ip_address || '127.0.0.1',
      created_at: log.created_at,
    }));
  }

  /** Record audit event */
  logEvent(data: {
    adminEmail: string;
    action: string;
    resource: string;
    resourceId: string;
    details: string;
    ipAddress?: string;
  }) {
    const entry = {
      id: `log-${Date.now()}`,
      admin_email: data.adminEmail,
      action: data.action,
      resource: data.resource,
      resource_id: data.resourceId,
      details: data.details,
      ip_address: data.ipAddress || '103.24.12.89',
      created_at: new Date().toISOString(),
    };
    db.audit_logs.unshift(entry);
    return entry;
  }
}
