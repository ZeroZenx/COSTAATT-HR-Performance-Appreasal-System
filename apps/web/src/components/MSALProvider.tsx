import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '../lib/msalConfig';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

interface MSALProviderProps {
  children: React.ReactNode;
}

export function MSALProvider({ children }: MSALProviderProps) {
  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}
