export class BaseVendorAdapter {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.isConnected = false;
  }

  getCapabilities() {
    return {
      marketData: false,
      orderManagement: false,
      portfolio: false,
      analytics: false,
      realtime: false
    };
  }

  async connect() {
    throw new Error('connect() must be implemented by vendor adapter');
  }

  async disconnect() {
    this.isConnected = false;
  }

  async getMarketData(symbol) {
    throw new Error('getMarketData() not implemented');
  }

  async placeOrder(orderData) {
    throw new Error('placeOrder() not implemented');
  }

  async getPortfolio() {
    throw new Error('getPortfolio() not implemented');
  }

  async getAnalytics(symbol) {
    throw new Error('getAnalytics() not implemented');
  }

  handleError(error, context) {
    console.error(`${this.name} Error in ${context}:`, error);
    return {
      success: false,
      error: error.message,
      vendor: this.name,
      context
    };
  }
}