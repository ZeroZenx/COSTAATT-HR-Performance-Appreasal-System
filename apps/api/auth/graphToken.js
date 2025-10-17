const { ClientSecretCredential } = require("@azure/identity");

// Azure AD credentials
const tenantId = "023c2cf6-b378-495b-a3cd-591490b7f6e1";
const clientId = "7911cfad-b0d5-419c-83b2-62aab8833a66";
const clientSecret = process.env.AZURE_CLIENT_SECRET || "your-client-secret-here";

// Microsoft Graph scope
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

async function getAccessToken() {
  try {
    const tokenResponse = await credential.getToken("https://graph.microsoft.com/.default");
    return tokenResponse.token;
  } catch (err) {
    console.error("❌ Error getting access token:", err);
    throw err;
  }
}

module.exports = getAccessToken;
