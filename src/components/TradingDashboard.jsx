import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import VendorManager from '../core/VendorManager';
import { YFinanceMarketData, YFinanceAnalytics, YFinanceBulkDownloader } from './YFinanceComponents';
import { CodeViewer, VendorStatus } from './AdminComponents';
import { TreeViewer } from './TreeViewer';

const TradingDashboard = () => {
  const [activeTab, setActiveTab] = useState('market');
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');

  useEffect(() => {
    setVendors(VendorManager.getAllVendors());
    if (VendorManager.getAllVendors().length > 0) {
      setSelectedVendor(VendorManager.getAllVendors()[0]);
    }
  }, []);

  const tabs = [
    { id: 'market', label: 'Market Data', capability: 'marketData' },
    { id: 'orders', label: 'Orders', capability: 'orderManagement' },
    { id: 'portfolio', label: 'Portfolio', capability: 'portfolio' },
    { id: 'analytics', label: 'Analytics', capability: 'analytics' },
    { id: 'admin', label: 'Admin', capability: 'admin' }
  ];

  const getAvailableTabs = () => {
    if (!selectedVendor) return [];
    const capabilities = VendorManager.getVendorCapabilities(selectedVendor);
    return tabs.filter(tab => tab.capability === 'admin' || capabilities[tab.capability]);
  };

  const renderTabContent = () => {
    const availableTabs = getAvailableTabs();
    const currentTab = availableTabs.find(tab => tab.id === activeTab);
    
    if (!currentTab) {
      return <div className="tab-content">Feature not available for selected vendor</div>;
    }

    switch (activeTab) {
      case 'market':
        return <MarketDataTab vendor={selectedVendor} />;
      case 'orders':
        return <OrdersTab vendor={selectedVendor} />;
      case 'portfolio':
        return <PortfolioTab vendor={selectedVendor} />;
      case 'analytics':
        return <AnalyticsTab vendor={selectedVendor} />;
      case 'admin':
        return <AdminTab vendor={selectedVendor} />;
      default:
        return <div className="tab-content">Select a tab</div>;
    }
  };

  return (
    <div className="trading-dashboard">
      <header className="dashboard-header">
        <h1>Trading Dashboard</h1>
        <select 
          value={selectedVendor} 
          onChange={(e) => setSelectedVendor(e.target.value)}
          className="vendor-selector"
        >
          <option value="">Select Vendor</option>
          {vendors.map(vendor => (
            <option key={vendor} value={vendor}>{vendor}</option>
          ))}
        </select>
      </header>

      <nav className="tab-navigation">
        {getAvailableTabs().map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="dashboard-content">
        <ErrorBoundary fallbackMessage="This tab is temporarily unavailable">
          {renderTabContent()}
        </ErrorBoundary>
      </main>
    </div>
  );
};

const MarketDataTab = ({ vendor }) => {
  if (vendor === 'yfinance') {
    return (
      <div className="tab-content">
        <h2>Market Data - Yahoo Finance</h2>
        <YFinanceMarketData vendor={vendor} />
      </div>
    );
  }
  return (
    <div className="tab-content">
      <h2>Market Data - {vendor}</h2>
      <p>Market data functionality for {vendor}</p>
    </div>
  );
};

const OrdersTab = ({ vendor }) => (
  <div className="tab-content">
    <h2>Order Management - {vendor}</h2>
    <p>Order management functionality for {vendor}</p>
  </div>
);

const PortfolioTab = ({ vendor }) => (
  <div className="tab-content">
    <h2>Portfolio - {vendor}</h2>
    <p>Portfolio functionality for {vendor}</p>
  </div>
);

const AnalyticsTab = ({ vendor }) => {
  if (vendor === 'yfinance') {
    return (
      <div className="tab-content">
        <h2>Analytics - Yahoo Finance</h2>
        <YFinanceAnalytics vendor={vendor} />
        <YFinanceBulkDownloader vendor={vendor} />
      </div>
    );
  }
  return (
    <div className="tab-content">
      <h2>Analytics - {vendor}</h2>
      <p>Analytics functionality for {vendor}</p>
    </div>
  );
};

const AdminTab = ({ vendor }) => {
  const [activeAdmin, setActiveAdmin] = useState('code');
  
  return (
    <div className="tab-content">
      <h2>Admin - {vendor}</h2>
      <div className="admin-nav">
        <button 
          className={`admin-btn ${activeAdmin === 'code' ? 'active' : ''}`}
          onClick={() => setActiveAdmin('code')}
        >
          Code
        </button>
        <button 
          className={`admin-btn ${activeAdmin === 'status' ? 'active' : ''}`}
          onClick={() => setActiveAdmin('status')}
        >
          Status
        </button>
        <button 
          className={`admin-btn ${activeAdmin === 'tree' ? 'active' : ''}`}
          onClick={() => setActiveAdmin('tree')}
        >
          Tree
        </button>
      </div>
      
      {activeAdmin === 'code' && <CodeViewer vendor={vendor} />}
      {activeAdmin === 'status' && <VendorStatus vendor={vendor} />}
      {activeAdmin === 'tree' && <TreeViewer />}
    </div>
  );
};

export default TradingDashboard;