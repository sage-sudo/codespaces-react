import React, { useState, useEffect } from 'react';
import VendorManager from '../core/VendorManager';

export const YFinanceMarketData = ({ vendor }) => {
  const [symbol, setSymbol] = useState('AAPL');
  const [assetType, setAssetType] = useState('stocks');
  const [interval, setInterval] = useState('1d');
  const [period, setPeriod] = useState('1mo');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const assetTypes = {
    stocks: { label: 'Stocks', examples: 'AAPL, GOOGL, MSFT' },
    forex: { label: 'Forex', examples: 'EURUSD=X, GBPUSD=X, USDJPY=X' },
    crypto: { label: 'Crypto', examples: 'BTC-USD, ETH-USD, ADA-USD' },
    commodities: { label: 'Commodities', examples: 'GC=F, CL=F, SI=F' },
    indices: { label: 'Indices', examples: '^GSPC, ^DJI, ^IXIC' }
  };

  const intervals = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'];
  const periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'];

  const fetchData = async () => {
    if (!symbol.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchParams = {
        symbol: symbol.toUpperCase(),
        interval,
        period: useCustomRange ? null : period,
        start: useCustomRange ? customStart : null,
        end: useCustomRange ? customEnd : null
      };

      const result = useCustomRange || period !== '1d' 
        ? await VendorManager.executeVendorMethod(vendor, 'getHistoricalData', fetchParams.symbol, fetchParams.interval, fetchParams.period || '1mo')
        : await VendorManager.executeVendorMethod(vendor, 'getMarketData', fetchParams.symbol, fetchParams.interval);
        
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="yfinance-market-data">
      <div className="fetch-controls">
        <div className="control-row">
          <div className="control-group">
            <label>Asset Type:</label>
            <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
              {Object.entries(assetTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label>Symbol:</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder={assetTypes[assetType].examples}
              onKeyPress={(e) => e.key === 'Enter' && fetchData()}
            />
          </div>
        </div>
        
        <div className="control-row">
          <div className="control-group">
            <label>Interval:</label>
            <select value={interval} onChange={(e) => setInterval(e.target.value)}>
              {intervals.map(int => (
                <option key={int} value={int}>{int}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={useCustomRange}
                onChange={(e) => setUseCustomRange(e.target.checked)}
              />
              Custom Date Range
            </label>
          </div>
        </div>

        {useCustomRange ? (
          <div className="control-row">
            <div className="control-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </div>
            <div className="control-group">
              <label>End Date:</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="control-row">
            <div className="control-group">
              <label>Period:</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                {periods.map(per => (
                  <option key={per} value={per}>{per}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button className="fetch-btn" onClick={fetchData} disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Data'}
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}
      
      {data && (
        <div className="quote-display">
          <h3>{data.symbol}</h3>
          {data.price ? (
            <div className="price-info">
              <span className="price">${data.price?.toFixed(2)}</span>
              <span className={`change ${data.change >= 0 ? 'positive' : 'negative'}`}>
                {data.change >= 0 ? '+' : ''}{data.change?.toFixed(2)} 
                ({data.changePercent?.toFixed(2)}%)
              </span>
            </div>
          ) : null}
          {data.data && (
            <div className="historical-summary">
              <p>Historical data: {data.data.length} records</p>
              <p>Latest: ${data.data[data.data.length - 1]?.close?.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const YFinanceAnalytics = ({ vendor }) => {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1mo');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const timeframes = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y'];

  const fetchAnalytics = async () => {
    if (!symbol.trim()) return;
    
    setLoading(true);
    try {
      const result = await VendorManager.executeVendorMethod(vendor, 'getAnalytics', symbol.toUpperCase(), timeframe);
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="yfinance-analytics">
      <div className="analytics-controls">
        <div className="control-group">
          <label>Symbol:</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter symbol for analysis"
            onKeyPress={(e) => e.key === 'Enter' && fetchAnalytics()}
          />
        </div>
        <div className="control-group">
          <label>Analysis Period:</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            {timeframes.map(tf => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>
        <button className="fetch-btn" onClick={fetchAnalytics} disabled={loading}>
          {loading ? 'Analyzing...' : 'Fetch Analytics'}
        </button>
      </div>

      {analytics && (
        <div className="analytics-display">
          <h3>Analysis for {analytics.symbol} ({timeframe})</h3>
          <div className="analytics-grid">
            <div className="metric">
              <label>Current Price</label>
              <span>${analytics.price?.toFixed(2)}</span>
            </div>
            <div className="metric">
              <label>Volatility</label>
              <span className={`volatility ${analytics.volatility?.toLowerCase()}`}>
                {analytics.volatility}
              </span>
            </div>
            <div className="metric">
              <label>Trend ({timeframe})</label>
              <span className={`trend ${analytics.weeklyTrend?.toLowerCase()}`}>
                {analytics.weeklyTrend}
              </span>
            </div>
            <div className="metric">
              <label>Recommendation</label>
              <span className={`recommendation ${analytics.recommendation?.toLowerCase()}`}>
                {analytics.recommendation}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const YFinanceBulkDownloader = ({ vendor }) => {
  const [symbols, setSymbols] = useState('AAPL,GOOGL,MSFT');
  const [intervals, setIntervals] = useState(['1d']);
  const [period, setPeriod] = useState('1mo');
  const [batchSize, setBatchSize] = useState(5);
  const [downloading, setDownloading] = useState(false);
  const [results, setResults] = useState(null);

  const availableIntervals = ['1m', '5m', '15m', '1h', '1d', '1wk', '1mo'];
  const periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max'];

  const handleBulkDownload = async () => {
    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
    if (symbolList.length === 0) return;

    setDownloading(true);
    try {
      const result = await VendorManager.executeVendorMethod(
        vendor, 
        'bulkDownload', 
        symbolList, 
        intervals,
        { period, batchSize }
      );
      setResults(result);
    } catch (err) {
      console.error('Bulk download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bulk-downloader">
      <h4>Bulk Historical Data Download</h4>
      <div className="bulk-controls">
        <div className="control-group">
          <label>Symbols (comma-separated):</label>
          <input
            type="text"
            value={symbols}
            onChange={(e) => setSymbols(e.target.value)}
            placeholder="AAPL,GOOGL,MSFT,BTC-USD,EURUSD=X"
          />
        </div>
        <div className="control-row">
          <div className="control-group">
            <label>Intervals:</label>
            <select 
              multiple 
              value={intervals} 
              onChange={(e) => setIntervals([...e.target.selectedOptions].map(o => o.value))}
            >
              {availableIntervals.map(int => (
                <option key={int} value={int}>{int}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label>Period:</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {periods.map(per => (
                <option key={per} value={per}>{per}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label>Batch Size:</label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              min="1"
              max="50"
            />
          </div>
        </div>
      </div>
      <button className="fetch-btn" onClick={handleBulkDownload} disabled={downloading}>
        {downloading ? 'Downloading...' : 'Download Data'}
      </button>
      
      {results && (
        <div className="download-results">
          <h5>Download Complete</h5>
          <p>Downloaded data for {Object.keys(results.data || {}).length} symbols</p>
        </div>
      )}
    </div>
  );
};