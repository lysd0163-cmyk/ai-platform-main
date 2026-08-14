export type TradingBroker = "mt4" | "mt5" | "tradingview" | "generic";
export type Side = "buy" | "sell";

export interface OHLCV { timestamp:number; open:number; high:number; low:number; close:number; volume?:number; }
export interface Order { id:string; symbol:string; side:Side; quantity:number; price?:number; stopLoss?:number; takeProfit?:number; }
export interface RiskConfig { maxRiskPerTradePct:number; maxDailyLossPct:number; maxOpenPositions:number; }
export interface Strategy { id:string; name:string; symbols:string[]; timeframe:string; evaluate(data:OHLCV[]): Promise<Order[]>; }
export interface BacktestResult { trades:number; pnl:number; maxDrawdownPct:number; winRate:number; profitFactor:number; }
export interface BrokerAdapter { readonly id:TradingBroker; placeOrder(order:Order):Promise<{id:string;status:"accepted"|"rejected"}>; cancelOrder(id:string):Promise<void>; }

export function validateRisk(config:RiskConfig):void {
  if (config.maxRiskPerTradePct<=0 || config.maxRiskPerTradePct>5) throw new Error("maxRiskPerTradePct must be >0 and <=5");
  if (config.maxDailyLossPct<=0 || config.maxDailyLossPct>20) throw new Error("maxDailyLossPct must be >0 and <=20");
  if (config.maxOpenPositions<1) throw new Error("maxOpenPositions must be >=1");
}

export class RiskEngine {
  constructor(private readonly config:RiskConfig){ validateRisk(config); }
  approve(order:Order, equity:number, currentDailyLossPct:number, openPositions:number):boolean {
    if (openPositions>=this.config.maxOpenPositions) return false;
    if (currentDailyLossPct>=this.config.maxDailyLossPct) return false;
    if (!order.quantity || order.quantity<=0 || equity<=0) return false;
    return true;
  }
}

export function summarizeBacktest(pnlSeries:number[]):BacktestResult {
  if (!pnlSeries.length) return {trades:0,pnl:0,maxDrawdownPct:0,winRate:0,profitFactor:0};
  let equity=0, peak=0, drawdown=0, wins=0, grossProfit=0, grossLoss=0;
  for(const pnl of pnlSeries){ equity+=pnl; peak=Math.max(peak,equity); drawdown=Math.max(drawdown, peak-equity); if(pnl>0){wins++;grossProfit+=pnl;} else grossLoss+=Math.abs(pnl); }
  return { trades:pnlSeries.length, pnl:equity, maxDrawdownPct:peak>0?(drawdown/peak)*100:0, winRate:(wins/pnlSeries.length)*100, profitFactor:grossLoss?grossProfit/grossLoss:Infinity };
}
