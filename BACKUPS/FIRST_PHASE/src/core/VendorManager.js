class VendorManager {
  constructor() {
    this.vendors = new Map();
    this.capabilities = new Map();
  }

  registerVendor(vendorId, vendorAdapter) {
    try {
      if (!vendorAdapter.name || !vendorAdapter.getCapabilities) {
        throw new Error(`Invalid vendor adapter for ${vendorId}`);
      }

      this.vendors.set(vendorId, vendorAdapter);
      this.capabilities.set(vendorId, vendorAdapter.getCapabilities());
      return true;
    } catch (error) {
      console.error(`Failed to register vendor ${vendorId}:`, error);
      return false;
    }
  }

  getVendor(vendorId) {
    return this.vendors.get(vendorId);
  }

  getVendorCapabilities(vendorId) {
    return this.capabilities.get(vendorId) || {};
  }

  getAllVendors() {
    return Array.from(this.vendors.keys());
  }

  getVendorsWithCapability(capability) {
    return Array.from(this.vendors.keys()).filter(vendorId => 
      this.getVendorCapabilities(vendorId)[capability]
    );
  }

  async executeVendorMethod(vendorId, method, ...args) {
    try {
      const vendor = this.getVendor(vendorId);
      if (!vendor || !vendor[method]) {
        throw new Error(`Method ${method} not available for vendor ${vendorId}`);
      }
      return await vendor[method](...args);
    } catch (error) {
      console.error(`Error executing ${method} for vendor ${vendorId}:`, error);
      throw error;
    }
  }
}

export default new VendorManager();