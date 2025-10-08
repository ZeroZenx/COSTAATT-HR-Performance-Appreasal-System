import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService, AuditLogData } from './audit.service';
import { AUDIT_KEY, AuditOptions } from './audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(AUDIT_KEY, context.getHandler());
    
    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;
    
    if (!user) {
      this.logger.warn('No user found in request for audit logging');
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.logAuditEvent(auditOptions, request, user, response, null, startTime);
        },
        error: (error) => {
          this.logAuditEvent(auditOptions, request, user, null, error, startTime);
        },
      }),
    );
  }

  private async logAuditEvent(
    options: AuditOptions,
    request: Request,
    user: any,
    response: any,
    error: any,
    startTime: number,
  ) {
    try {
      const duration = Date.now() - startTime;
      const ip = this.getClientIp(request);
      const userAgent = request.get('User-Agent');

      // Determine entity ID from request parameters or response
      let entityId = this.extractEntityId(request, response);

      // Prepare audit data
      const auditData: AuditLogData = {
        action: options.action,
        entity: options.entity,
        entityId: entityId || 'unknown',
        actorId: user.id,
        description: options.description || `${options.action} on ${options.entity}`,
        ip,
        userAgent,
        metadata: {
          method: request.method,
          url: request.url,
          duration,
          success: !error,
          error: error?.message,
        },
      };

      // Include request/response data if specified
      if (options.includeRequestBody && request.body) {
        auditData.metadata.requestBody = this.sanitizeData(request.body);
      }

      if (options.includeResponseBody && response) {
        auditData.metadata.responseBody = this.sanitizeData(response);
      }

      if (options.includeUser) {
        auditData.metadata.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }

      // Log the audit event
      await this.auditService.log(auditData);

      this.logger.log(`Audit logged: ${options.action} on ${options.entity} by ${user.email}`);
    } catch (auditError) {
      this.logger.error(`Failed to log audit event: ${auditError.message}`, auditError.stack);
    }
  }

  private extractEntityId(request: Request, response: any): string | null {
    // Try to get entity ID from URL parameters
    const params = request.params;
    if (params.id) {
      return params.id;
    }

    // Try to get entity ID from response
    if (response?.id) {
      return response.id;
    }

    // Try to get entity ID from request body
    if (request.body?.id) {
      return request.body.id;
    }

    return null;
  }

  private getClientIp(request: Request): string {
    return (
      request.get('X-Forwarded-For') ||
      request.get('X-Real-IP') ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}

