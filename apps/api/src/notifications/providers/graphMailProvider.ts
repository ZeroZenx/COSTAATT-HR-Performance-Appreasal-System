import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

class GraphAuthProvider implements AuthenticationProvider {
  private credential: ClientSecretCredential;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.credential = new ClientSecretCredential(
      process.env.AZURE_AD_TENANT_ID!,
      process.env.AZURE_AD_CLIENT_ID!,
      process.env.AZURE_AD_CLIENT_SECRET!
    );
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const tokenResponse = await this.credential.getToken('https://graph.microsoft.com/.default');
    this.accessToken = tokenResponse!.token;
    this.tokenExpiry = new Date(tokenResponse!.expiresOnTimestamp);
    
    return this.accessToken;
  }
}

export class GraphMailProvider {
  private client: Client;
  private senderEmail: string;

  constructor() {
    const authProvider = new GraphAuthProvider();
    this.client = Client.initWithMiddleware({ authProvider });
    this.senderEmail = process.env.GRAPH_SENDER || 'hr-noreply@costaatt.edu.tt';
  }

  async sendMail(options: MailOptions): Promise<void> {
    try {
      const message = {
        message: {
          subject: options.subject,
          body: {
            contentType: 'HTML',
            content: options.html,
          },
          toRecipients: [
            {
              emailAddress: {
                address: options.to,
              },
            },
          ],
        },
        saveToSentItems: true,
      };

      await this.client
        .users(this.senderEmail)
        .sendMail(message)
        .send();
    } catch (error) {
      console.error('Graph mail send failed:', error);
      throw new Error(`Failed to send email via Graph: ${error}`);
    }
  }

  async testConnection(): Promise<void> {
    try {
      // Test by getting user info
      await this.client.users(this.senderEmail).get();
    } catch (error) {
      throw new Error(`Graph connection test failed: ${error}`);
    }
  }
}
