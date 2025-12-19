import { BaseVendorAdapter } from '../core/BaseVendorAdapter';

/**
 * Template for creating new vendor adapters
 * Copy this file and implement your vendor-specific logic
 */
class VendorTemplate extends BaseVendorAdapter {
  constructor(config = {}) {
    super('Vendor Name', {
      apiUrl: config.apiUrl || '',
      apiKey: config.apiKey || '',
      ...config
    });
  }

  /**
   * Define what this vendor can do
   * Set to true only for features this vendor supports
   */
  getCapabilities() {
    return {
      marketData: false,
      orderManagement: false,
      portfolio: false,
      analytics: false,
      realtime: false
    };
  }

  /**
   * Connect to vendor API
   */
  async connect() {
    try {
      // TODO: Implement your connection logic
      // Example: await fetch(this.config.apiUrl + '/connect')
      
      this.isConnected = true;
      return { success: true };
    } catch (error) {
      return this.handleError(error, 'connect');
    }
  }

  /**
   * Get market data for a symbol
   * Only implement if marketData capability is true
   */
  async getMarketData(symbol) {
    try {
      // TODO: Implement your market data API call
      // Example:
      // const response = await fetch(`${this.config.apiUrl}/market/${symbol}`);
      // const data = await response.json();
      
      return {
        success: true,
        data: {
          symbol,
          price: 0,
          change: 0,
          volume: 0
        }
      };
    } catch (error) {
      return this.handleError(error, 'getMarketData');
    }
  }

  /**
   * Place an order
   * Only implement if orderManagement capability is true
   */
  async placeOrder(orderData) {
    try {
      // TODO: Implement your order placement logic
      
      return {
        success: true,
        orderId: '',
        status: 'pending'
      };
    } catch (error) {
      return this.handleError(error, 'placeOrder');
    }
  }

  /**
   * Get portfolio data
   * Only implement if portfolio capability is true
   */
  async getPortfolio() {
    try {
      // TODO: Implement your portfolio API call
      
      return {
        success: true,
        data: {
          totalValue: 0,
          positions: []
        }
      };
    } catch (error) {
      return this.handleError(error, 'getPortfolio');
    }
  }

  /**
   * Get analytics for a symbol
   * Only implement if analytics capability is true
   */
  async getAnalytics(symbol) {
    try {
      // TODO: Implement your analytics API call
      
      return {
        success: true,
        data: {
          symbol,
          indicators: {}
        }
      };
    } catch (error) {
      return this.handleError(error, 'getAnalytics');
    }
  }

  /**
   * Add any custom methods your vendor needs
   */
  async customMethod() {
    try {
      // Your custom implementation
      return { success: true };
    } catch (error) {
      return this.handleError(error, 'customMethod');
    }
  }
}

export default VendorTemplate;