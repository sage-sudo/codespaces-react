import VendorManager from '../core/VendorManager';

export const registerNewVendor = (vendorId, VendorClass, config = {}) => {
  try {
    const vendorInstance = new VendorClass(config);
    const success = VendorManager.registerVendor(vendorId, vendorInstance);
    
    if (success) {
      console.log(`✅ Vendor ${vendorId} registered successfully`);
      return true;
    } else {
      console.error(`❌ Failed to register vendor ${vendorId}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error registering vendor ${vendorId}:`, error);
    return false;
  }
};

export const getVendorInfo = (vendorId) => {
  const vendor = VendorManager.getVendor(vendorId);
  const capabilities = VendorManager.getVendorCapabilities(vendorId);
  
  return {
    exists: !!vendor,
    name: vendor?.name || 'Unknown',
    capabilities,
    isConnected: vendor?.isConnected || false
  };
};

export const testVendor = async (vendorId) => {
  try {
    const vendor = VendorManager.getVendor(vendorId);
    if (!vendor) {
      return { success: false, error: 'Vendor not found' };
    }

    const connectionResult = await vendor.connect();
    const capabilities = vendor.getCapabilities();
    
    return {
      success: true,
      connection: connectionResult,
      capabilities,
      vendor: vendor.name
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      vendor: vendorId
    };
  }
};