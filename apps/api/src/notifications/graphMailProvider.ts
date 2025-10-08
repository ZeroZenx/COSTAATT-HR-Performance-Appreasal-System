import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

export class GraphMailProvider {
  private client: any;
  private sender: string;

  constructor() {
    this.sender = process.env.GRAPH_SENDER || "hr-noreply@costaatt.edu.tt";
    this.client = Client.init({
      authProvider: async (done) => {
        try {
          const token = await this.getToken();
          done(null, token);
        } catch (err) {
          done(err, null);
        }
      },
    });
  }

  private async getToken(): Promise<string> {
    const url = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: process.env.AZURE_AD_CLIENT_ID!,
      client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    });

    const res = await fetch(url, {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = await res.json();
    if (!data.access_token) throw new Error("Graph token fetch failed");
    return data.access_token;
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    const message = {
      message: {
        subject,
        body: { contentType: "HTML", content: html },
        toRecipients: [{ emailAddress: { address: to } }],
        from: { emailAddress: { address: this.sender } },
      },
      saveToSentItems: "false",
    };

    try {
      await this.client.api("/users/" + this.sender + "/sendMail").post(message);
    } catch (err) {
      console.error("❌ Graph sendMail failed:", err);
      throw err;
    }
  }
}
