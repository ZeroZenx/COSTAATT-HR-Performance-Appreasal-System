import { usePermissions } from './RoleGuard';
import { RoleGuard } from './RoleGuard';
import { UserRole } from '../lib/rbac';

/**
 * Test component to demonstrate RBAC functionality
 * This can be used to verify that role-based access is working correctly
 */
export function RBACTest() {
  const { user, isEmployee, isSupervisor, isHRAdmin, can } = usePermissions();

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">RBAC Test Panel</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Current User:</h3>
          <p>Role: {user?.role}</p>
          <p>Name: {user?.firstName} {user?.lastName}</p>
          <p>Email: {user?.email}</p>
        </div>

        <div>
          <h3 className="font-semibold">Role Checks:</h3>
          <ul className="space-y-1">
            <li>Is Employee: {isEmployee ? '✅' : '❌'}</li>
            <li>Is Supervisor: {isSupervisor ? '✅' : '❌'}</li>
            <li>Is HR Admin: {isHRAdmin ? '✅' : '❌'}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Permission Tests:</h3>
          <ul className="space-y-1">
            <li>Can create appraisal: {can('create', 'appraisal') ? '✅' : '❌'}</li>
            <li>Can view employees: {can('view', 'employee', { scope: 'team' }) ? '✅' : '❌'}</li>
            <li>Can view reports: {can('view', 'report') ? '✅' : '❌'}</li>
            <li>Can edit own appraisal: {can('edit', 'appraisal', { employeeId: user?.id }) ? '✅' : '❌'}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Component Tests:</h3>
          
          <RoleGuard action="create" resource="appraisal" fallback={<p className="text-red-500">❌ Cannot create appraisals</p>}>
            <p className="text-green-500">✅ Can create appraisals</p>
          </RoleGuard>

          <RoleGuard action="view" resource="employee" context={{ scope: 'team' }} fallback={<p className="text-red-500">❌ Cannot view employees</p>}>
            <p className="text-green-500">✅ Can view employees</p>
          </RoleGuard>

          <RoleGuard action="view" resource="report" fallback={<p className="text-red-500">❌ Cannot view reports</p>}>
            <p className="text-green-500">✅ Can view reports</p>
          </RoleGuard>
        </div>

        <div>
          <h3 className="font-semibold">Expected Behavior by Role:</h3>
          {user?.role === UserRole.EMPLOYEE && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="font-medium text-blue-800">Employee Role:</p>
              <ul className="text-sm text-blue-700 mt-1">
                <li>• Should NOT see "Create New Appraisal" in navigation</li>
                <li>• Should NOT be able to access /appraisals/new route</li>
                <li>• Should NOT see "Employees" in navigation</li>
                <li>• Should NOT see "Reports" in navigation</li>
                <li>• Should only see "My Appraisals" for their own data</li>
                <li>• Can only edit self-assessment fields when status allows</li>
              </ul>
            </div>
          )}

          {user?.role === UserRole.SUPERVISOR && (
            <div className="bg-green-50 p-3 rounded">
              <p className="font-medium text-green-800">Supervisor Role:</p>
              <ul className="text-sm text-green-700 mt-1">
                <li>• Should see "Create New Appraisal" in navigation</li>
                <li>• Should be able to access /appraisals/new route</li>
                <li>• Should see "Employees" (Team Members) in navigation</li>
                <li>• Should see "Team Reports" in navigation</li>
                <li>• Can create appraisals for their team only</li>
                <li>• Can view team directory and reports</li>
              </ul>
            </div>
          )}

          {user?.role === UserRole.HR_ADMIN && (
            <div className="bg-purple-50 p-3 rounded">
              <p className="font-medium text-purple-800">HR Admin Role:</p>
              <ul className="text-sm text-purple-700 mt-1">
                <li>• Should see "Create New Appraisal" in navigation</li>
                <li>• Should be able to access /appraisals/new route</li>
                <li>• Should see "Employees" (full directory) in navigation</li>
                <li>• Should see "Reports" (global) in navigation</li>
                <li>• Should see "Settings" in navigation</li>
                <li>• Can create appraisals for any employee</li>
                <li>• Can view all employees and global reports</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
