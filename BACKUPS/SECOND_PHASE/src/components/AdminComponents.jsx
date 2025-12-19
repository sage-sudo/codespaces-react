import React, { useState } from 'react';
import VendorManager from '../core/VendorManager';
import { CodeEditor } from './CodeEditor';

export const CodeViewer = ({ vendor }) => {
  const [activeCode, setActiveCode] = useState('fetch');
  const [editMode, setEditMode] = useState(false);
  const [customCode, setCustomCode] = useState({});
  
  const codeExamples = {
    fetch: {
      title: 'Data Fetching Code',
      code: `// Market Data Fetch
const fetchMarketData = async (symbol, interval = '1d') => {
  const url = \`https://query1.finance.yahoo.com/v8/finance/chart/\${symbol}?interval=\${interval}&range=1d\`;
  const response = await fetch(url);
  const data = await response.json();
  return parseYahooResponse(data, symbol);
};

// Historical Data Fetch
const fetchHistoricalData = async (symbol, interval, period) => {
  const url = \`https://query1.finance.yahoo.com/v8/finance/chart/\${symbol}?interval=\${interval}&range=\${period}\`;
  const response = await fetch(url);
  const data = await response.json();
  return parseHistoricalData(data, symbol);
};

// Bulk Download
const bulkDownload = async (symbols, intervals, options) => {
  const results = {};
  const batchSize = options.batchSize || 10;
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    
    for (const symbol of batch) {
      for (const interval of intervals) {
        const data = await fetchHistoricalData(symbol, interval, options.period);
        if (!results[symbol]) results[symbol] = {};
        results[symbol][interval] = data;
      }
    }
    
    // Rate limiting
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};`
    },
    parser: {
      title: 'Data Parser Code',
      code: `// Yahoo Response Parser
const parseYahooResponse = (data, symbol) => {
  const chart = data.chart?.result?.[0];
  const meta = chart.meta;
  const quote = chart.indicators?.quote?.[0];
  
  return {
    symbol,
    price: meta.regularMarketPrice || 0,
    change: (meta.regularMarketPrice - meta.previousClose) || 0,
    changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
    volume: meta.regularMarketVolume || 0,
    high: quote?.high?.[quote.high.length - 1] || meta.regularMarketDayHigh,
    low: quote?.low?.[quote.low.length - 1] || meta.regularMarketDayLow,
    open: quote?.open?.[0] || meta.regularMarketDayLow,
    previousClose: meta.previousClose || 0,
    timestamp: Date.now()
  };
};

// Historical Data Parser
const parseHistoricalData = (data, symbol) => {
  const chart = data.chart?.result?.[0];
  const timestamps = chart.timestamp || [];
  const quote = chart.indicators?.quote?.[0] || {};
  
  return {
    symbol,
    data: timestamps.map((ts, i) => ({
      timestamp: new Date(ts * 1000).toISOString(),
      open: quote.open?.[i] || null,
      high: quote.high?.[i] || null,
      low: quote.low?.[i] || null,
      close: quote.close?.[i] || null,
      volume: quote.volume?.[i] || null
    })).filter(item => item.close !== null)
  };
};`
    },
    analytics: {
      title: 'Analytics Code',
      code: `// Volatility Calculator
const calculateVolatility = (dailyData, weeklyData) => {
  const dailyChange = Math.abs(dailyData.changePercent || 0);
  const weeklyChange = Math.abs(weeklyData.changePercent || 0);
  
  if (dailyChange > 5 || weeklyChange > 15) return 'HIGH';
  if (dailyChange > 2 || weeklyChange > 8) return 'MEDIUM';
  return 'LOW';
};

// Recommendation Generator
const generateRecommendation = (data) => {
  const { changePercent, volume, pe } = data;
  
  let score = 0;
  if (changePercent > 2) score += 1;
  if (changePercent < -2) score -= 1;
  if (volume > 1000000) score += 0.5;
  if (pe && pe < 15) score += 0.5;
  if (pe && pe > 30) score -= 0.5;
  
  if (score > 1) return 'BUY';
  if (score < -1) return 'SELL';
  return 'HOLD';
};

// Analytics Fetch
const getAnalytics = async (symbol, timeframe = '1mo') => {
  const [daily, weekly] = await Promise.all([
    getMarketData(symbol, '1d'),
    getMarketData(symbol, '1wk')
  ]);

  return {
    symbol,
    price: daily.data.price,
    change: daily.data.change,
    changePercent: daily.data.changePercent,
    volume: daily.data.volume,
    volatility: calculateVolatility(daily.data, weekly.data),
    weeklyTrend: weekly.data.change > 0 ? 'UP' : 'DOWN',
    recommendation: generateRecommendation(daily.data)
  };
};`
    },
    vendor: {
      title: 'Vendor Adapter Code',
      code: `// YFinance Vendor Class
class YFinanceVendor extends BaseVendorAdapter {
  constructor(config = {}) {
    super('Yahoo Finance', {
      baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/',
      intervals: ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'],
      ...config
    });
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  getCapabilities() {
    return {
      marketData: true,
      orderManagement: false,
      portfolio: false,
      analytics: true,
      realtime: true
    };
  }

  async connect() {
    try {
      const testResult = await this.getMarketData('AAPL');
      this.isConnected = testResult.success;
      return { success: this.isConnected };
    } catch (error) {
      return this.handleError(error, 'connect');
    }
  }

  async getMarketData(symbol, interval = '1d') {
    try {
      const cacheKey = \`\${symbol}_\${interval}\`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return { success: true, data: cached.data };
      }

      const url = \`\${this.config.baseUrl}\${symbol}?interval=\${interval}&range=1d\`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }

      const data = await response.json();
      const result = this.parseYahooResponse(data, symbol);
      
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error, 'getMarketData');
    }
  }
}`
    }
  };

  const handleCodeSave = (code) => {
    setCustomCode(prev => ({
      ...prev,
      [activeCode]: code
    }));
  };

  const getCurrentCode = () => {
    return customCode[activeCode] || codeExamples[activeCode].code;
  };

  return (
    <div className="code-viewer">
      <div className="code-header">
        <div className="code-tabs">
          {Object.entries(codeExamples).map(([key, example]) => (
            <button
              key={key}
              className={`code-tab ${activeCode === key ? 'active' : ''}`}
              onClick={() => setActiveCode(key)}
            >
              {example.title}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setEditMode(!editMode)}
          className={`edit-toggle ${editMode ? 'active' : ''}`}
        >
          {editMode ? 'View' : 'Edit'}
        </button>
      </div>
      
      <div className="code-display">
        {editMode ? (
          <CodeEditor
            initialCode={getCurrentCode()}
            title={codeExamples[activeCode].title}
            onSave={handleCodeSave}
          />
        ) : (
          <div>
            <h4>{codeExamples[activeCode].title}</h4>
            <pre className="code-block">
              <code>{getCurrentCode()}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export const VendorStatus = ({ vendor }) => {
  const [status, setStatus] = useState(null);
  
  const checkStatus = async () => {
    try {
      const vendorInstance = VendorManager.getVendor(vendor);
      const capabilities = VendorManager.getVendorCapabilities(vendor);
      
      setStatus({
        name: vendorInstance?.name || 'Unknown',
        connected: vendorInstance?.isConnected || false,
        capabilities,
        cacheSize: vendorInstance?.cache?.size || 0
      });
    } catch (error) {
      setStatus({ error: error.message });
    }
  };

  return (
    <div className="vendor-status">
      <button onClick={checkStatus} className="status-btn">
        Check Vendor Status
      </button>
      
      {status && (
        <div className="status-display">
          {status.error ? (
            <div className="error">Error: {status.error}</div>
          ) : (
            <div className="status-grid">
              <div className="status-item">
                <label>Vendor Name:</label>
                <span>{status.name}</span>
              </div>
              <div className="status-item">
                <label>Connection:</label>
                <span className={status.connected ? 'connected' : 'disconnected'}>
                  {status.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="status-item">
                <label>Cache Size:</label>
                <span>{status.cacheSize} items</span>
              </div>
              <div className="status-item">
                <label>Capabilities:</label>
                <div className="capabilities">
                  {Object.entries(status.capabilities).map(([cap, enabled]) => (
                    <span key={cap} className={`capability ${enabled ? 'enabled' : 'disabled'}`}>
                      {cap}: {enabled ? '✓' : '✗'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};