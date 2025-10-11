private token: string | null = null;
  private tokenExpiry: Date | null = null;
  async getToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }
    // Get new token using Client Credentials flow
    const credentials = btoa(
      `${import.meta.env.VITE_EBAY_APP_ID}:${import.meta.env.VITE_EBAY_CERT_ID}`
    );
    const response = await fetch(
      'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to get eBay token');
    }
    const data = await response.json();
    this.token = data.access_token;
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    return this.token;
  }
}
export const ebayAuth = new EbayAuth();