import { groupBy } from 'lodash';

// Types für bessere TypeScript-Unterstützung
export interface BlinkTransaction {
  id: string;
  direction: 'SEND' | 'RECEIVE';
  status: string;
  amount: number;
  createdAt: string;
  settlementAmount?: number;
  settlementCurrency?: string;
  memo?: string;
}

export interface DailyData {
  date: string;
  euros: number;
  sats: number;
  transactionCount: number;
  profit: 'positive' | 'negative' | 'neutral';
}

export interface AggregatedStats {
  totalEuros: number;
  totalSats: number;
  totalTransactions: number;
  averageTransactionValue: number;
  dailyAverage: number;
}

/**
 * Aggregiert tägliche Transaktionen und berechnet Euro-Werte
 */
export function aggregateDaily(
  transactions: BlinkTransaction[], 
  eurPrice: number
): DailyData[] {
  // Nur eingehende, erfolgreiche Transaktionen berücksichtigen
  const receivedTransactions = transactions.filter(
    tx => tx.direction === 'RECEIVE' && tx.status === 'SUCCESS'
  );

  // Nach Datum gruppieren
  const grouped = groupBy(receivedTransactions, tx => {
    const date = new Date(tx.createdAt);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD Format
  });

  // Tägliche Daten berechnen
  const dailyData: DailyData[] = Object.entries(grouped)
    .map(([date, txs]) => {
      const totalSats = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const euros = (totalSats / 100_000_000) * eurPrice; // Sats zu BTC zu EUR
      
      return {
        date,
        euros: Number(euros.toFixed(2)),
        sats: totalSats,
        transactionCount: txs.length,
        profit: (euros > 0 ? 'positive' : 'neutral') as 'positive' | 'negative' | 'neutral'
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return dailyData;
}

/**
 * Berechnet zusammenfassende Statistiken
 */
export function calculateStats(dailyData: DailyData[]): AggregatedStats {
  const totalEuros = dailyData.reduce((sum, day) => sum + day.euros, 0);
  const totalSats = dailyData.reduce((sum, day) => sum + day.sats, 0);
  const totalTransactions = dailyData.reduce((sum, day) => sum + day.transactionCount, 0);
  
  return {
    totalEuros: Number(totalEuros.toFixed(2)),
    totalSats,
    totalTransactions,
    averageTransactionValue: totalTransactions > 0 
      ? Number((totalEuros / totalTransactions).toFixed(2)) 
      : 0,
    dailyAverage: dailyData.length > 0 
      ? Number((totalEuros / dailyData.length).toFixed(2)) 
      : 0
  };
}

/**
 * Konvertiert Satoshis zu Bitcoin
 */
export function satsTobtc(sats: number): number {
  return sats / 100_000_000;
}

/**
 * Konvertiert Bitcoin zu Euro
 */
export function btcToEur(btc: number, eurPrice: number): number {
  return btc * eurPrice;
}

/**
 * Konvertiert Satoshis direkt zu Euro
 */
export function satsToEur(sats: number, eurPrice: number): number {
  return btcToEur(satsTobtc(sats), eurPrice);
}

/**
 * Formatiert Zahlen für die Anzeige
 */
export function formatCurrency(amount: number, currency: 'EUR' | 'BTC' | 'SATS'): string {
  switch (currency) {
    case 'EUR':
      return `${amount.toFixed(2)} €`;
    case 'BTC':
      return `₿ ${amount.toFixed(8)}`;
    case 'SATS':
      return `${amount.toLocaleString()} sats`;
    default:
      return amount.toString();
  }
}

/**
 * Generiert Mock-Daten für Entwicklung/Testing
 */
export function generateMockTransactions(): BlinkTransaction[] {
  const mockTransactions: BlinkTransaction[] = [];
  const now = new Date();
  
  // Generiere Daten für die letzten 7 Tage
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // 2-8 Transaktionen pro Tag
    const transactionsPerDay = Math.floor(Math.random() * 7) + 2;
    
    for (let j = 0; j < transactionsPerDay; j++) {
      const txDate = new Date(date);
      txDate.setHours(Math.floor(Math.random() * 16) + 7); // 7-23 Uhr
      txDate.setMinutes(Math.floor(Math.random() * 60));
      
      mockTransactions.push({
        id: `mock_${Date.now()}_${i}_${j}`,
        direction: 'RECEIVE',
        status: 'SUCCESS',
        amount: Math.floor(Math.random() * 100000) + 10000, // 10k-110k sats (ca. 2.50-27.50€)
        createdAt: txDate.toISOString(),
        memo: `Coffee Purchase #${j + 1}`
      });
    }
  }
  
  return mockTransactions.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}