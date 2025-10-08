// Microsoft 365 SSO Configuration
export const azureConfig = {
  clientId: (import.meta as any).env?.VITE_AZURE_CLIENT_ID || '7911cfad-b0d5-419c-83b2-62aab8833a66',
  tenantId: (import.meta as any).env?.VITE_AZURE_TENANT_ID || '023c2cf6-b378-495b-a3cd-591490b7f6e1',
  redirectUri: (import.meta as any).env?.VITE_REDIRECT_URI || 'http://localhost:5173',
};

// Instructions for HR Admin to configure Microsoft 365 SSO
export const ssoSetupInstructions = {
  title: 'Microsoft 365 SSO Setup Instructions',
  steps: [
    {
      step: 1,
      title: 'Register Application in Azure Portal',
      description: 'Go to Azure Portal > App registrations > New registration',
      details: [
        'Name: COSTAATT HR Performance Gateway',
        'Supported account types: Accounts in this organizational directory only',
        'Redirect URI: Single-page application (SPA) - https://hr.costaatt.edu.tt'
      ]
    },
    {
      step: 2,
      title: 'Configure Authentication',
      description: 'In the Authentication section of your app registration',
      details: [
        'Platform configurations: Single-page application',
        'Redirect URIs: Add your production URL',
        'Logout URL: Add your production URL',
        'Implicit grant and hybrid flows: Check "Access tokens" and "ID tokens"'
      ]
    },
    {
      step: 3,
      title: 'Create Security Groups',
      description: 'Create Azure AD security groups for role mapping',
      details: [
        'HR_Admin - for HR administrators',
        'Supervisor - for supervisors and managers', 
        'Employee - for regular employees'
      ]
    },
    {
      step: 4,
      title: 'Configure App Roles',
      description: 'In the App roles section, add the following roles',
      details: [
        'HR_ADMIN - Full system access',
        'SUPERVISOR - Team management access',
        'EMPLOYEE - Self-service access'
      ]
    },
    {
      step: 5,
      title: 'Update Application Settings',
      description: 'Update the environment variables in your application',
      details: [
        'VITE_AZURE_CLIENT_ID: Your application (client) ID',
        'VITE_AZURE_TENANT_ID: Your directory (tenant) ID',
        'VITE_REDIRECT_URI: Your production URL'
      ]
    }
  ]
};
