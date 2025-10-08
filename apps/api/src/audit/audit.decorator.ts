import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditOptions {
  action: string;
  entity: string;
  description?: string;
  includeRequestBody?: boolean;
  includeResponseBody?: boolean;
  includeUser?: boolean;
}

/**
 * Decorator to automatically log audit events for admin actions
 */
export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_KEY, options);

