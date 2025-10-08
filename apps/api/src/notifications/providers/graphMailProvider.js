// Note: This would require the Microsoft Graph SDK to be installed
// For now, this is a placeholder that will throw an error if used

class GraphMailProvider {
  constructor() {
    throw new Error('Microsoft Graph provider not implemented. Please use SMTP provider instead.');
  }

  async sendMail(options) {
    throw new Error('Microsoft Graph provider not implemented');
  }

  async testConnection() {
    throw new Error('Microsoft Graph provider not implemented');
  }
}

module.exports = { GraphMailProvider };
