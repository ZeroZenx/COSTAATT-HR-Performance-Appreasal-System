import { Configuration, PopupRequest } from '@azure/msal-browser';

import { azureConfig } from '../config/azure';

// MSAL configuration for Microsoft 365 SSO
export const msalConfig: Configuration = {
  auth: {
    clientId: azureConfig.clientId,
    authority: `https://login.microsoftonline.com/${azureConfig.tenantId}`,
    redirectUri: azureConfig.redirectUri,
    postLogoutRedirectUri: azureConfig.redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // LogLevel.Error
            console.error(message);
            return;
          case 1: // LogLevel.Warning
            console.warn(message);
            return;
          case 2: // LogLevel.Info
            console.info(message);
            return;
          case 3: // LogLevel.Verbose
            console.debug(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email'],
  extraQueryParameters: {
    // Request group claims in the ID token
    claims: JSON.stringify({
      "id_token": {
        "groups": {
          "essential": true
        }
      }
    })
  }
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphMailEndpoint: 'https://graph.microsoft.com/v1.0/me/messages',
};

// Role mapping from Azure AD groups to app roles
export const roleMapping = {
  'HR_Admin': 'HR_ADMIN',
  'Supervisor': 'SUPERVISOR', 
  'Employee': 'EMPLOYEE',
};

// Default role if no group mapping found
export const defaultRole = 'EMPLOYEE';
