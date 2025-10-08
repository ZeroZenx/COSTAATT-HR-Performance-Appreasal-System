const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function auditLog(req, res, next) {
  // Skip audit for health checks and static assets
  if (req.path === '/health' || req.path.startsWith('/static')) {
    return next();
  }

  const originalSend = res.send;
  const originalJson = res.json;

  // Capture response data
  let responseData = null;
  
  res.send = function(data) {
    responseData = data;
    return originalSend.call(this, data);
  };

  res.json = function(data) {
    responseData = data;
    return originalJson.call(this, data);
  };

  // Log after response is sent
  res.on('finish', async () => {
    try {
        const auditData = {
          actorId: req.user?.id || null,
          action: getActionFromMethod(req.method),
          entity: getResourceFromPath(req.path),
          entityId: extractResourceId(req.path),
          before: null, // Could be enhanced to capture old values for updates
          after: req.method !== 'GET' ? req.body : null,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        };

      // Only log significant actions (not every GET request)
      if (shouldLogRequest(req.method, req.path, res.statusCode)) {
        await prisma.auditLog.create({
          data: auditData
        });
      }
    } catch (error) {
      console.error('Audit log error:', error);
      // Don't fail the request if audit logging fails
    }
  });

  next();
}

function getActionFromMethod(method) {
  const actions = {
    'GET': 'READ',
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
  };
  return actions[method] || 'UNKNOWN';
}

function getResourceFromPath(path) {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'root';
  
  // Map common API paths to resources
  const resourceMap = {
    'auth': 'authentication',
    'employees': 'employee',
    'appraisals': 'appraisal',
    'templates': 'template',
    'cycles': 'cycle',
    'competencies': 'competency',
    'dashboard': 'dashboard'
  };
  
  return resourceMap[segments[0]] || segments[0];
}

function extractResourceId(path) {
  // Extract ID from paths like /appraisals/123 or /employees/456
  const idMatch = path.match(/\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(?:\/|$)/);
  return idMatch ? idMatch[2] : null;
}

function shouldLogRequest(method, path, statusCode) {
  // Log all non-GET requests
  if (method !== 'GET') return true;
  
  // Log important GET requests
  const importantPaths = ['/dashboard', '/appraisals', '/employees'];
  if (importantPaths.some(p => path.startsWith(p))) return true;
  
  // Log authentication-related requests
  if (path.includes('auth')) return true;
  
  // Log errors
  if (statusCode >= 400) return true;
  
  return false;
}

module.exports = auditLog;
