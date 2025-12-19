import { BaseVendorAdapter } from '../core/BaseVendorAdapter';

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
      // Test connection with a simple quote
      const testResult = await this.getMarketData('AAPL');
      this.isConnected = testResult.success;
      return { success: this.isConnected };
    } catch (error) {
      return this.handleError(error, 'connect');
    }
  }

  async getMarketData(symbol, interval = '1d') {
    try {
      const cacheKey = `${symbol}_${interval}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return { success: true, data: cached.data };
      }

      // Use Yahoo Finance API directly (simplified version of the Python script logic)
      const url = `${this.config.baseUrl}${symbol}?interval=${interval}&range=1d`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const result = this.parseYahooResponse(data, symbol);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error, 'getMarketData');
    }
  }

  async getHistoricalData(symbol, interval = '1d', period = '1mo') {
    try {
      const url = `${this.config.baseUrl}${symbol}?interval=${interval}&range=${period}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: this.parseHistoricalData(data, symbol)
      };
    } catch (error) {
      return this.handleError(error, 'getHistoricalData');
    }
  }

  async getAnalytics(symbol) {
    try {
      // Get multiple timeframes for analytics
      const [daily, weekly] = await Promise.all([
        this.getMarketData(symbol, '1d'),
        this.getMarketData(symbol, '1wk')
      ]);

      if (!daily.success || !weekly.success) {
        throw new Error('Failed to fetch data for analytics');
      }

      return {
        success: true,
        data: {
          symbol,
          price: daily.data.price,
          change: daily.data.change,
          changePercent: daily.data.changePercent,
          volume: daily.data.volume,
          marketCap: daily.data.marketCap,
          pe: daily.data.pe,
          weeklyTrend: weekly.data.change > 0 ? 'UP' : 'DOWN',
          volatility: this.calculateVolatility(daily.data, weekly.data),
          recommendation: this.generateRecommendation(daily.data)
        }
      };
    } catch (error) {
      return this.handleError(error, 'getAnalytics');
    }
  }

  parseYahooResponse(data, symbol) {
    try {
      const chart = data.chart?.result?.[0];
      if (!chart) {
        throw new Error('Invalid response format');
      }

      const meta = chart.meta;
      const quote = chart.indicators?.quote?.[0];
      
      return {
        symbol,
        price: meta.regularMarketPrice || 0,
        change: (meta.regularMarketPrice - meta.previousClose) || 0,
        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap || null,
        pe: meta.trailingPE || null,
        high: quote?.high?.[quote.high.length - 1] || meta.regularMarketDayHigh,
        low: quote?.low?.[quote.low.length - 1] || meta.regularMarketDayLow,
        open: quote?.open?.[0] || meta.regularMarketDayLow,
        previousClose: meta.previousClose || 0,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to parse Yahoo response: ${error.message}`);
    }
  }

  parseHistoricalData(data, symbol) {
    try {
      const chart = data.chart?.result?.[0];
      if (!chart) {
        throw new Error('Invalid historical data format');
      }

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
    } catch (error) {
      throw new Error(`Failed to parse historical data: ${error.message}`);
    }
  }

  calculateVolatility(dailyData, weeklyData) {
    // Simple volatility calculation
    const dailyChange = Math.abs(dailyData.changePercent || 0);
    const weeklyChange = Math.abs(weeklyData.changePercent || 0);
    
    if (dailyChange > 5 || weeklyChange > 15) return 'HIGH';
    if (dailyChange > 2 || weeklyChange > 8) return 'MEDIUM';
    return 'LOW';
  }

  generateRecommendation(data) {
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
  }

  // Bulk download method (adapted from Python script)
  async bulkDownload(symbols, intervals = ['1d'], options = {}) {
    try {
      const results = {};
      const batchSize = options.batchSize || 10;
      
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        
        for (const symbol of batch) {
          for (const interval of intervals) {
            try {
              const data = await this.getHistoricalData(symbol, interval, options.period || '1mo');
              if (!results[symbol]) results[symbol] = {};
              results[symbol][interval] = data;
            } catch (error) {
              console.warn(`Failed to download ${symbol} ${interval}:`, error);
            }
          }
        }
        
        // Rate limiting (like the Python script)
        if (i + batchSize < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return { success: true, data: results };
    } catch (error) {
      return this.handleError(error, 'bulkDownload');
    }
  }
}

export default YFinanceVendor;