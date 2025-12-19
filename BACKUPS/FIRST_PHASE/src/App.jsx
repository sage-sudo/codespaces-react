import React, { useEffect } from 'react';
import './App.css';
import TradingDashboard from './components/TradingDashboard';
import VendorManager from './core/VendorManager';
import ExampleVendorA from './vendors/ExampleVendorA';
import ExampleVendorB from './vendors/ExampleVendorB';
import YFinanceVendor from './vendors/YFinanceVendor';

function App() {
  useEffect(() => {
    // Register vendors on app startup
    VendorManager.registerVendor('vendorA', new ExampleVendorA());
    VendorManager.registerVendor('vendorB', new ExampleVendorB());
    VendorManager.registerVendor('yfinance', new YFinanceVendor());
  }, []);

  return (
    <div className="App">
      <TradingDashboard />
    </div>
  );
}

export default App;