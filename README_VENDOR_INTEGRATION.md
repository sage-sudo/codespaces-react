# Vendor Integration Guide

## Adding New Vendors

### 1. Create Vendor Adapter

Create a new file in `src/vendors/YourVendor.js`:

```javascript
import { BaseVendorAdapter } from '../core/BaseVendorAdapter';

class YourVendor extends BaseVendorAdapter {
  constructor(config = {}) {
    super('Your Vendor Name', config);
  }

  getCapabilities() {
    return {
      marketData: true,      // Can fetch market data
      orderManagement: false, // Cannot place orders
      portfolio: true,       // Can get portfolio data
      analytics: false,      // No analytics
      realtime: true         // Supports real-time data
    };
  }

  async connect() {
    // Your connection logic
    this.isConnected = true;
    return { success: true };
  }

  async getMarketData(symbol) {
    // Your market data implementation
    return {
      success: true,
      data: { symbol, price: 100, change: 5 }
    };
  }

  // Implement other methods as needed
}

export default YourVendor;
```

### 2. Register Vendor

In `src/App.jsx`, add your vendor:

```javascript
import YourVendor from './vendors/YourVendor';

// In useEffect
VendorManager.registerVendor('yourVendorId', new YourVendor());
```

### 3. Vendor Capabilities

The UI automatically adapts based on vendor capabilities:
- Tabs only show if vendor supports the feature
- Error boundaries prevent crashes
- Graceful fallbacks for missing features

### 4. API Integration

Each vendor can have completely different:
- API endpoints
- Authentication methods
- Data formats
- Available features

The BaseVendorAdapter provides error handling and standardized interface.

## Architecture Benefits

- **Fault Isolation**: Vendor failures don't crash the UI
- **Dynamic Capabilities**: UI adapts to vendor features
- **Easy Extension**: Add vendors without changing core UI
- **Consistent Interface**: All vendors use same base methods
- **Error Recovery**: Built-in retry mechanisms