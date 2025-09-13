import { groupBy } from 'lodash';

// Types für bessere TypeScript-Unterstützung
export interface BlinkTransaction {
  id: string;
  direction: 'SEND' | 'RECEIVE';
  status: string;
  amount?: number;  // Legacy for mock data
  createdAt: string | number;  // Can be Unix timestamp or ISO string
  settlementAmount: number;
  settlementCurrency: string;
  memo?: string;
}

export interface DashboardData {
  date: string;
  euros: number;
  sats: number;
  transactionCount: number;
  profit: 'positive' | 'negative' | 'neutral';
}

export interface DailyData {
  date: string; // YYYY-MM-DD
  euros: number;
  sats: number;
  transactionCount: number;
  coffeeCount: number; // Intelligente Kaffee-Anzahl basierend auf Transaktionsgrößen
  multiCoffeeTransactions: number; // Anzahl Transaktionen über Standard-Kaffeepreis
  profit: 'positive' | 'negative' | 'neutral';
  // Neue Felder für komplette Wallet-Übersicht
  receivedEuros: number; // Nur Eingänge (RECEIVE)
  sentEuros: number; // Nur Ausgänge (SEND)
  netEuros: number; // Saldo (received - sent)
  receivedSats: number;
  sentSats: number;
  netSats: number;
  receiveCount: number; // Anzahl RECEIVE Transaktionen
  sendCount: number; // Anzahl SEND Transaktionen
}

export interface AggregatedStats {
  totalEuros: number;
  totalSats: number;
  totalTransactions: number;
  averageTransactionValue: number;
  dailyAverage: number;
  totalCoffees: number;
}

export interface CoffeeStats {
  coffeePrice: number;
  estimatedCoffeeCount: number; // Einfache Division durch Kaffeepreis
  smartCoffeeCount: number; // Intelligente Erkennung
  multiCoffeeTransactions: number; // Anzahl Transaktionen mit mehreren Kaffees
  expectedRevenue: number; // Erwarteter Umsatz basierend auf smartCoffeeCount
  actualRevenue: number; // Tatsächlicher Umsatz (nur RECEIVE)
  revenueDifference: number; // Differenz zwischen actual und expected
  averagePricePerCoffee: number; // Durchschnittspreis pro Kaffee
  accuracyImprovement: number; // Verbesserung in % durch intelligente Erkennung
  // Einfache Ausgaben-Info
  totalSent: number; // Gesamt-Ausgaben
  sendCount: number; // Anzahl Ausgaben-Transaktionen
}

/**
 * Berechnet intelligente Kaffee-Anzahl basierend auf Transaktionsgrößen
 * @param eurAmount - Transaktionsbetrag in EUR
 * @param coffeePrice - Preis pro Kaffee (standardmäßig 0.30€)
 * @returns Anzahl der wahrscheinlich gekauften Kaffees
 */
function calculateSmartCoffeeCount(eurAmount: number, coffeePrice: number = 0.30): number {
  // Unter 0.25€: Zu niedrig, ignorieren (Trinkgeld, Rundungsfehler)
  if (eurAmount < 0.25) {
    return 0;
  }
  
  // Berechne wie viele Kaffees theoretisch gekauft wurden
  const theoreticalCoffees = eurAmount / coffeePrice;
  const wholeNumber = Math.floor(theoreticalCoffees);
  const remainder = eurAmount % coffeePrice;
  
  // Wenn der Rest sehr klein ist (< 0.05€), dann ist es wahrscheinlich ein Vielfaches
  if (remainder < 0.05) {
    return wholeNumber;
  }
  
  // Wenn der Rest sehr nah am Kaffeepreis ist (> 0.25€), dann +1 Kaffee
  if (remainder > 0.25) {
    return wholeNumber + 1;
  }
  
  // Einzelkaffee-Bereich: 0.25€ - 0.35€ = genau 1 Kaffee
  if (eurAmount >= 0.25 && eurAmount <= 0.35) {
    return 1;
  }
  
  // Standard-Rundung für alle anderen Fälle
  return Math.round(theoreticalCoffees);
}

/**
 * Aggregiert tägliche Transaktionen und berechnet Euro-Werte
 * @param transactions - Array von Transaktionen
 * @param eurPrice - Aktueller EUR/BTC Preis
 * @param timeRange - 'current-month' | 'all-time' | 'custom'
 * @param customStartDate - Startdatum für custom range (YYYY-MM-DD)
 * @param customEndDate - Enddatum für custom range (YYYY-MM-DD)
 */
export function aggregateDaily(
  transactions: BlinkTransaction[], 
  eurPrice: number,
  timeRange: 'current-month' | 'all-time' | 'custom' = 'current-month',
  customStartDate?: string,
  customEndDate?: string
): DailyData[] {
  // Bestimme Start- und Enddatum basierend auf timeRange
  let startDate: Date;
  let endDate: Date = new Date(); // Default: heute
  
  if (timeRange === 'current-month') {
    // Aktueller Monat: September 2025 (echter aktueller Monat)
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1); // 1. September 2025
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Letzter Tag des aktuellen Monats
  } else if (timeRange === 'custom' && customStartDate && customEndDate) {
    // Benutzerdefinierter Zeitraum
    startDate = new Date(customStartDate + 'T00:00:00.000Z');
    endDate = new Date(customEndDate + 'T23:59:59.999Z');
  } else {
    // All-time: Ab 1. Februar 2025
    startDate = new Date(2025, 1, 1); // 1. Februar 2025
  }
  
  // Alle erfolgreiche Transaktionen im gewählten Zeitraum (sowohl RECEIVE als auch SEND)
  const allTransactions = transactions.filter(tx => {
    if (tx.status !== 'SUCCESS') {
      return false;
    }
    
    // Handle both Unix timestamp (number) and ISO string for date filtering
    const txDate = typeof tx.createdAt === 'number' 
      ? new Date(tx.createdAt * 1000)  // Unix timestamp to Date
      : new Date(tx.createdAt);        // ISO string to Date
    
    // Vergleiche nur das Datum (ohne Uhrzeit) für bessere Filterung
    const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    return txDateOnly >= startDateOnly && txDateOnly <= endDateOnly;
  });

  // Separate RECEIVE und SEND Transaktionen für Kaffee-Analyse
  const receivedTransactions = allTransactions.filter(tx => tx.direction === 'RECEIVE');
  const sentTransactions = allTransactions.filter(tx => tx.direction === 'SEND');

  // Nach Datum gruppieren
  // Gruppiere alle Transaktionen nach Datum
  const grouped = groupBy(allTransactions, tx => {
    // Handle both Unix timestamp (number) and ISO string
    const date = typeof tx.createdAt === 'number' 
      ? new Date(tx.createdAt * 1000)  // Unix timestamp to Date
      : new Date(tx.createdAt);        // ISO string to Date
    return date.toISOString().split('T')[0]; // YYYY-MM-DD Format
  });

  // Tägliche Daten berechnen
  const dailyData: DailyData[] = Object.entries(grouped)
    .map(([date, txs]) => {
      // Separiere RECEIVE und SEND Transaktionen
      const receiveTxs = txs.filter(tx => tx.direction === 'RECEIVE');
      const sendTxs = txs.filter(tx => tx.direction === 'SEND');
      
      // Berechne RECEIVE (Eingänge)
      const receivedSats = receiveTxs.reduce((sum, tx) => sum + Math.abs(tx.settlementAmount || tx.amount || 0), 0);
      const receivedEuros = (receivedSats / 100_000_000) * eurPrice;
      
      // Berechne SEND (Ausgänge)
      const sentSats = sendTxs.reduce((sum, tx) => sum + Math.abs(tx.settlementAmount || tx.amount || 0), 0);
      const sentEuros = (sentSats / 100_000_000) * eurPrice;
      
      // Netto-Saldo
      const netSats = receivedSats - sentSats;
      const netEuros = receivedEuros - sentEuros;
      
      // Gesamt-Statistiken (für Kompatibilität)
      const totalSats = receivedSats; // Für Kaffee-Analyse nur RECEIVE verwenden
      const euros = receivedEuros;    // Für Kaffee-Analyse nur RECEIVE verwenden
      
      // Berechne intelligente Kaffee-Anzahl nur für RECEIVE Transaktionen
      const coffeeCount = receiveTxs.reduce((sum, tx) => {
        const txSats = Math.abs(tx.settlementAmount || tx.amount || 0);
        const txEuros = (txSats / 100_000_000) * eurPrice;
        return sum + calculateSmartCoffeeCount(txEuros);
      }, 0);
      
      // Zähle Mehrfach-Käufe nur für RECEIVE Transaktionen über €0.30
      const multiCoffeeTransactions = receiveTxs.filter(tx => {
        const txSats = Math.abs(tx.settlementAmount || tx.amount || 0);
        const txEuros = (txSats / 100_000_000) * eurPrice;
        return txEuros > 0.30; // Transaktionen über Standard-Kaffeepreis
      }).length;
      
      return {
        date,
        euros: Number(euros.toFixed(2)),
        sats: totalSats,
        transactionCount: receiveTxs.length, // Nur RECEIVE für Kaffee-Statistiken
        coffeeCount,
        multiCoffeeTransactions,
        profit: (netEuros > 0 ? 'positive' : netEuros < 0 ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral',
        // Neue detaillierte Felder
        receivedEuros: Number(receivedEuros.toFixed(2)),
        sentEuros: Number(sentEuros.toFixed(2)),
        netEuros: Number(netEuros.toFixed(2)),
        receivedSats,
        sentSats,
        netSats,
        receiveCount: receiveTxs.length,
        sendCount: sendTxs.length
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
  const totalCoffees = dailyData.reduce((sum, day) => sum + (day.coffeeCount ?? 0), 0);
  
  const averageTransactionValue = totalTransactions > 0 ? totalEuros / totalTransactions : 0;
  const dailyAverage = dailyData.length > 0 ? totalEuros / dailyData.length : 0;
  
  return {
  totalEuros: Number(totalEuros.toFixed(2)),
  totalSats,
  totalTransactions,
  averageTransactionValue: Number(averageTransactionValue.toFixed(2)),
  dailyAverage: Number(dailyAverage.toFixed(2)),
  totalCoffees: totalCoffees
  };
}

/**
 * Berechnet erweiterte Kaffee-spezifische Statistiken mit intelligenter Erkennung
 * @param dailyData - Aggregierte tägliche Daten
 * @param currentBalanceEur - Aktueller Wallet-Saldo in EUR
 */
export function calculateCoffeeStats(
  dailyData: DailyData[], 
  currentBalanceEur: number
): CoffeeStats {
  const coffeePrice = 0.30; // Standard Kaffeepreis in EUR
  
  // Kaffee-Umsatz (nur RECEIVE Transaktionen)
  const actualRevenue = dailyData.reduce((sum, day) => sum + day.euros, 0);
  
  // Wallet-Ausgaben Berechnungen
  const totalSent = dailyData.reduce((sum, day) => sum + day.sentEuros, 0);
  const sendCount = dailyData.reduce((sum, day) => sum + day.sendCount, 0);
  
  // Einfache Berechnung (bisherige Logik)
  const estimatedCoffeeCount = Math.round(actualRevenue / coffeePrice);
  
  // Intelligente Berechnung basierend auf einzelnen Transaktionsanalysen
  const smartCoffeeCount = dailyData.reduce((sum, day) => sum + day.coffeeCount, 0);
  
  // Summiere alle Mehrfach-Käufe aus den täglichen Daten
  const multiCoffeeTransactions = dailyData.reduce((sum, day) => sum + day.multiCoffeeTransactions, 0);
  
  // Erwarteter Umsatz basierend auf intelligenter Kaffeeanzahl
  const expectedRevenue = smartCoffeeCount * coffeePrice;
  
  // Differenz zwischen tatsächlichem und erwartetem Umsatz
  const revenueDifference = actualRevenue - expectedRevenue;
  
  // Durchschnittspreis pro geschätztem Kaffee (intelligente Berechnung)
  const averagePricePerCoffee = smartCoffeeCount > 0 ? actualRevenue / smartCoffeeCount : 0;
  
  // Berechne Verbesserung der Genauigkeit durch intelligente Erkennung
  const simpleEstimateError = Math.abs(actualRevenue - (estimatedCoffeeCount * coffeePrice));
  const smartEstimateError = Math.abs(actualRevenue - expectedRevenue);
  const accuracyImprovement = simpleEstimateError > 0 
    ? Math.max(0, ((simpleEstimateError - smartEstimateError) / simpleEstimateError) * 100)
    : 0;
  
  return {
    coffeePrice,
    estimatedCoffeeCount,
    smartCoffeeCount,
    multiCoffeeTransactions,
    expectedRevenue,
    actualRevenue,
    revenueDifference,
    averagePricePerCoffee,
    accuracyImprovement: Number(accuracyImprovement.toFixed(1)),
    // Einfache Ausgaben-Info
    totalSent,
    sendCount
  };
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