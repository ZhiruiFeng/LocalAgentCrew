# Investment Analysis Agent Group

## Overview

The Investment Agent Group provides comprehensive financial analysis capabilities for stock market research, portfolio management, and investment decision support. It consists of 5 specialized subagents and 5 corresponding skills.

## Architecture

```
                    INVESTMENT ROOT COMMAND
                           │
     ┌─────────────────────┼─────────────────────┐
     │                     │                     │
  DATA LAYER          ANALYSIS LAYER        OUTPUT LAYER
     │                     │                     │
┌────┴────┐         ┌──────┼──────┐        ┌────┴────┐
│ Data    │         │      │      │        │ Report  │
│Collector│────────►│Screener│────►│        │Generator│
│(Haiku)  │         │(Haiku)│     │        │(Haiku)  │
└─────────┘         └───────┘     │        └─────────┘
                                  │
                         ┌────────┼────────┐
                         │                 │
                    ┌────┴────┐      ┌─────┴─────┐
                    │Company  │      │Portfolio  │
                    │Analyst  │      │Risk       │
                    │(Sonnet) │      │(Sonnet)   │
                    └─────────┘      └───────────┘
```

## Subagents

### 1. investment-data-collector (Haiku)
**Purpose**: Fetch real-time and historical stock data from authorized APIs

**Capabilities**:
- Real-time stock quotes from Finnhub
- Historical OHLCV data from Alpha Vantage
- Company fundamentals from Financial Modeling Prep
- Market news and earnings calendars
- Rate limit management and caching recommendations

**Tools**: WebFetch, WebSearch, Read, Write

### 2. stock-screener (Haiku)
**Purpose**: Screen and filter stocks based on quantitative criteria

**Capabilities**:
- Multi-factor screening (value, growth, quality, momentum)
- Preset screens (Value, Growth, Dividend, GARP, etc.)
- Custom criteria support
- Composite scoring and ranking
- Sector and market cap distribution analysis

**Preset Screens**:
- Value: P/E < 15, P/B < 2, ROE > 12%, Dividend > 2%
- Growth: Revenue growth > 20%, EPS growth > 25%, PEG < 2
- Quality: ROE > 20%, Operating margin > 15%, Debt/Equity < 0.5
- Dividend: Yield > 3%, Payout < 70%, 10+ years dividend growth
- Momentum: Price > 200-day SMA, RSI 50-70, Volume > average

**Tools**: WebFetch, WebSearch, Read, Write

### 3. company-analyst (Sonnet)
**Purpose**: Perform deep fundamental and technical analysis of individual stocks

**Capabilities**:
- Business model and competitive position analysis
- Financial statement analysis (income, balance sheet, cash flow)
- Ratio analysis (profitability, efficiency, leverage)
- Valuation analysis (multiples, DCF, comparables)
- Technical setup assessment
- Investment thesis development (bull/bear cases)

**Output**: Comprehensive company analysis report with rating and price target

**Tools**: WebFetch, WebSearch, Read, Write

### 4. portfolio-risk-analyst (Sonnet)
**Purpose**: Analyze portfolio risk metrics and provide risk management recommendations

**Capabilities**:
- Value at Risk (VaR) calculation (historical, parametric)
- Volatility analysis (standard deviation, beta)
- Drawdown measurement and analysis
- Concentration risk assessment (position, sector)
- Correlation analysis
- Stress testing (historical and hypothetical scenarios)
- Risk-adjusted return metrics (Sharpe, Sortino, Calmar)

**Tools**: WebFetch, WebSearch, Read, Write

### 5. investment-report-generator (Haiku)
**Purpose**: Generate comprehensive investment reports and alerts

**Report Types**:
- Daily Market Summary
- Portfolio Performance Report
- Technical Signal Alerts
- Stock Screening Results
- Risk Assessment Summary
- Earnings Calendar Briefing

**Tools**: Read, Write, WebSearch, WebFetch

## Skills

### 1. investment-daily-report
**Triggers**: "daily report", "investment report", "morning briefing", "market summary"

Generates comprehensive daily investment analysis including market overview, portfolio summary, technical signals, news, and opportunities.

### 2. stock-analyzer
**Triggers**: "analyze stock", "stock analysis", "company analysis", "research stock"

Performs deep analysis of individual stocks including fundamentals, technicals, valuation, and investment thesis.

### 3. stock-picker
**Triggers**: "pick stocks", "stock screener", "find stocks", "value stocks", "growth stocks"

Screens and filters stocks based on customizable quantitative criteria with preset and custom screens.

### 4. portfolio-risk
**Triggers**: "portfolio risk", "risk analysis", "VaR analysis", "risk metrics"

Analyzes portfolio risk including VaR, volatility, drawdown, concentration, and correlation.

### 5. market-data
**Triggers**: "stock price", "get quote", "market data", "historical prices"

Fetches real-time and historical market data from authorized APIs.

## Supported APIs

### Finnhub (Primary - Real-Time)
- **URL**: https://finnhub.io/
- **Rate Limit**: 60 calls/minute (free tier)
- **Data**: Real-time quotes, company news, basic financials, earnings calendar
- **Best For**: Current prices, news, events

### Alpha Vantage (Historical)
- **URL**: https://www.alphavantage.co/
- **Rate Limit**: 5 calls/minute, 500/day (free tier)
- **Data**: Daily/weekly/monthly OHLCV, technical indicators
- **Best For**: Historical analysis, backtesting

### Financial Modeling Prep (Fundamentals)
- **URL**: https://financialmodelingprep.com/
- **Rate Limit**: 250 calls/day (free tier)
- **Data**: Financial statements, ratios, key metrics
- **Best For**: Deep fundamental analysis

## Usage Examples

### Get a Stock Quote
```
"What's the price of AAPL?"
→ Activates: market-data skill
→ Uses: investment-data-collector agent
```

### Analyze a Company
```
"Analyze Tesla for investment"
→ Activates: stock-analyzer skill
→ Uses: company-analyst agent
```

### Screen for Stocks
```
"Find me undervalued quality stocks"
→ Activates: stock-picker skill
→ Uses: stock-screener agent
```

### Generate Daily Report
```
"Generate my daily investment report"
→ Activates: investment-daily-report skill
→ Uses: investment-report-generator agent
```

### Assess Portfolio Risk
```
"Analyze my portfolio risk"
→ Activates: portfolio-risk skill
→ Uses: portfolio-risk-analyst agent
```

## Model Tiering Rationale

| Agent | Model | Rationale |
|-------|-------|-----------|
| investment-data-collector | Haiku | Simple data fetching, formatting |
| stock-screener | Haiku | Rule-based filtering, ranking |
| company-analyst | Sonnet | Complex reasoning, valuation, thesis |
| portfolio-risk-analyst | Sonnet | Statistical analysis, stress testing |
| investment-report-generator | Haiku | Template-based report formatting |

## Key Metrics Reference

### Valuation
- P/E Ratio (Price/Earnings)
- PEG Ratio (P/E to Growth)
- P/B Ratio (Price/Book)
- P/S Ratio (Price/Sales)
- EV/EBITDA (Enterprise Value/EBITDA)

### Profitability
- Gross Margin
- Operating Margin
- Net Margin
- ROE (Return on Equity)
- ROA (Return on Assets)

### Financial Health
- Current Ratio
- Debt/Equity Ratio
- Interest Coverage
- Free Cash Flow

### Technical
- Moving Averages (20, 50, 200-day SMA/EMA)
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands

### Risk
- Beta
- VaR (Value at Risk)
- Standard Deviation (Volatility)
- Sharpe Ratio
- Maximum Drawdown

## Constraints & Disclaimers

1. **Data Freshness**: Real-time data may have 15-minute delays on free tiers
2. **Rate Limits**: Respect API rate limits to avoid service interruption
3. **Not Financial Advice**: All analysis is informational, not investment advice
4. **Data Quality**: Validate data before making decisions
5. **Model Limitations**: Risk models are approximations, not guarantees
6. **Past Performance**: Historical results don't guarantee future performance

## Future Enhancements

- [ ] Webhook integration for real-time alerts
- [ ] Portfolio tracking with persistent storage
- [ ] Automated daily report scheduling
- [ ] Options analysis capabilities
- [ ] Cryptocurrency support
- [ ] Social sentiment analysis integration
