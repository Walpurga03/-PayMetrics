import { create } from 'zustand';
import { aggregateDaily, calculateStats, calculateCoffeeStats, CoffeeStats, AggregatedStats } from '@/lib/utils';
// import type { Transaction } from '@/types/blink'; // Removed because the module does not exist

// Erweiterte BlinkTransaction mit notwendigen Feldern
export interface BlinkTransaction {
  id: string;
  direction: 'SEND' | 'RECEIVE';
  status: string;
  settlementAmount: number;
  settlementCurrency: string;
  createdAt: string | number;
  memo?: string;
  initiationVia?: {
    counterPartyUsername?: string;
    paymentHash?: string;
    address?: string;
  };
}

export interface DailyData {
  date: string;
  euros: number;
  sats: number;
  transactionCount: number;
  sentEuros: number;
  sendCount: number;
}

export interface Stats {
  totalEuros: number;
  totalSats: number;
  totalTransactions: number;
  averageTransactionValue: number;
  dailyAverage: number;
  totalCoffees: number;
}

interface StoreState {
  saldoEur: number;
  saldoSats: number;
  dailyData: DailyData[];
  stats: Stats;
  coffeeStats: CoffeeStats;
  currentPrice: number;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  timeRange: 'current-month' | 'all-time' | 'custom';
  customStartDate: string | null;
  customEndDate: string | null;
  setTimeRange: (range: 'current-month' | 'all-time' | 'custom') => void;
  toggleTimeRange: () => void;
  setCustomDateRange: (startDate: string, endDate: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchPrice: () => Promise<number>;
  fetchTransactions: () => Promise<BlinkTransaction[]>;
  fetchData: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  saldoEur: 0,
  saldoSats: 0,
  dailyData: [],
  stats: {
    totalEuros: 0,
    totalSats: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    dailyAverage: 0,
    totalCoffees: 0,
  },
  coffeeStats: {
    coffeePrice: 0.30,
    estimatedCoffeeCount: 0,
    smartCoffeeCount: 0,
    multiCoffeeTransactions: 0,
    expectedRevenue: 0,
    actualRevenue: 0,
    revenueDifference: 0,
    averagePricePerCoffee: 0,
    accuracyImprovement: 0,
    totalSent: 0,
    sendCount: 0,
  },
  currentPrice: 0,
  isLoading: false,
  error: null,
  lastUpdate: null,
  timeRange: 'current-month',
  customStartDate: null,
  customEndDate: null,

  setTimeRange: (range) => {
    set({ timeRange: range });
    // Automatisch Daten neu laden wenn sich der Zeitraum ändert
    get().fetchData();
  },

  setCustomDateRange: (startDate, endDate) => {
    set({ 
      customStartDate: startDate, 
      customEndDate: endDate,
      timeRange: 'custom'
    });
    // Automatisch Daten neu laden
    get().fetchData();
  },

  toggleTimeRange: () => {
    const { timeRange } = get();
    const newTimeRange = timeRange === 'current-month' ? 'all-time' : 'current-month';
    set({ timeRange: newTimeRange });
    get().fetchData();
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Bitcoin Preis von CoinGecko abrufen
  fetchPrice: async (): Promise<number> => {
    try {
      const response = await fetch('/api/price?currency=eur');
      if (!response.ok) {
        throw new Error(`Price API Error: ${response.status}`);
      }
      const data = await response.json();
      
      // Handle new format: direct object with price property
      if (data && typeof data.price === 'number') {
        return data.price;
      }
      // Handle legacy format: nested bitcoin.eur structure
      else if (data && data.bitcoin && typeof data.bitcoin.eur === 'number') {
        return data.bitcoin.eur;
      } else {
        console.error('Invalid price data structure from API:', JSON.stringify(data, null, 2));
        throw new Error('Invalid price data structure from API');
      }
    } catch (error) {
      console.error('Price fetch error:', error);
      throw error;
    }
  },

  // Transaktionen von Blink API abrufen (mit robuster Fehlerbehandlung)
  fetchTransactions: async (): Promise<BlinkTransaction[]> => {
    try {
      let allTransactions: BlinkTransaction[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;
      let requestCount = 0;
      const maxRequests = 20; // Sicherheitsgrenze um Endlosschleifen zu vermeiden
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 3; // Nach 3 aufeinanderfolgenden Fehlern stoppen

      // Pagination durch alle Transaktionen seit Feb 2024
      while (hasNextPage && requestCount < maxRequests && consecutiveErrors < maxConsecutiveErrors) {
        const variables: any = { first: 100 };
        if (cursor) {
          variables.after = cursor;
        }

        try {
          const response = await fetch('/api/blink', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              queryType: 'transactions',
              variables
            })
          });

          if (!response.ok) {
            consecutiveErrors++;
            console.warn(`Transactions API Error: ${response.status} (consecutive errors: ${consecutiveErrors}/${maxConsecutiveErrors})`);
            
            // Bei Fehlern kurz warten bevor nächster Versuch
            if (consecutiveErrors < maxConsecutiveErrors) {
              await new Promise(resolve => setTimeout(resolve, 1000 * consecutiveErrors));
              requestCount++; // Zähle auch fehlgeschlagene Requests
              continue;
            } else {
              console.error(`Too many consecutive errors (${consecutiveErrors}), stopping pagination`);
              break; // Stoppe bei zu vielen Fehlern, aber gib bereits geladene Daten zurück
            }
          }

          const data = await response.json();
          consecutiveErrors = 0; // Reset bei erfolgreichem Request
        
          // Extrahiere Transaktionen aus Blink API Response
          const pageTransactions = data?.me?.defaultAccount?.transactions?.edges?.map(
            (edge: any) => edge.node
          ) || [];
        
          // Prüfe ob wir schon Transaktionen vor 11.02.2025 erreicht haben
          const earliestDate = new Date('2025-02-11T00:00:00Z');
          const hasOldTransactions = pageTransactions.some((tx: any) => {
            const txDate = typeof tx.createdAt === 'number' 
              ? new Date(tx.createdAt * 1000)
              : new Date(tx.createdAt);
            return txDate < earliestDate;
          });

          allTransactions = [...allTransactions, ...pageTransactions];
        
          // Pagination Info
          const pageInfo = data?.me?.defaultAccount?.transactions?.pageInfo;
          hasNextPage = pageInfo?.hasNextPage && !hasOldTransactions;
          cursor = pageInfo?.endCursor;
          requestCount++;

          // Stoppe wenn wir Transaktionen vor 11.02.2025 erreicht haben
          if (hasOldTransactions) {
            console.log(`Reached transactions before 11.02.2025, stopping pagination at ${allTransactions.length} transactions`);
            break;
          }
        } catch (error) {
          consecutiveErrors++;
          console.warn(`Request ${requestCount + 1} failed:`, error);
          
          // Bei Fehlern kurz warten bevor nächster Versuch
          if (consecutiveErrors < maxConsecutiveErrors) {
            await new Promise(resolve => setTimeout(resolve, 1000 * consecutiveErrors));
            requestCount++; // Zähle auch fehlgeschlagene Requests
            continue;
          } else {
            console.error(`Too many consecutive errors (${consecutiveErrors}), stopping pagination`);
            break;
          }
        }
      }

      console.log(`Fetched ${allTransactions.length} transactions in ${requestCount} requests`);
      return allTransactions;
    } catch (error) {
      console.error('Transactions fetch error:', error);
      return []; // Gib leeres Array zurück statt Exception zu werfen
    }
  },
  
  // Hauptfunktion: Alle Daten laden und aggregieren (mit robuster Fehlerbehandlung)
  fetchData: async () => {
    const { setLoading, setError, fetchTransactions, timeRange, customStartDate, customEndDate } = get();
    
    setLoading(true);
    setError(null);
    
    try {
      // Zuerst den Preis laden
      let currentPrice = 0;
      try {
        currentPrice = await get().fetchPrice();
      } catch (error) {
        console.warn('Price fetch failed, using 0:', error);
      }
      
      // Balance und Transaktionen parallel laden mit individueller Fehlerbehandlung
      const [balanceResult, transactionsResult] = await Promise.allSettled([
        fetch('/api/blink', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queryType: 'balance' })
        }).then(async (response) => {
          if (!response.ok) {
            throw new Error(`Balance API Error: ${response.status}`);
          }
          const data = await response.json();
          const wallet = data?.me?.defaultAccount?.wallets?.[0];
          if (!wallet) {
            throw new Error('Keine Wallet-Daten gefunden');
          }
          return wallet.balance || 0;
        }),
        fetchTransactions()
      ]);

      // Balance verarbeiten
      let saldoSats = 0;
      if (balanceResult.status === 'fulfilled') {
        saldoSats = balanceResult.value;
      } else {
        console.warn('Balance fetch failed:', balanceResult.reason);
      }
      
      const saldoEur = (saldoSats / 100_000_000) * currentPrice;

      // Transaktionen verarbeiten
      const validTransactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value : [];
      if (transactionsResult.status === 'rejected') {
        console.warn('Transactions fetch failed:', transactionsResult.reason);
      }

      // Tägliche Daten aggregieren basierend auf timeRange
      const dailyData = aggregateDaily(
        validTransactions, 
        currentPrice, 
        timeRange, 
        customStartDate || undefined, 
        customEndDate || undefined
      );
      const stats = calculateStats(dailyData);
      const coffeeStats = calculateCoffeeStats(dailyData, saldoEur);

      set({ 
        currentPrice,
        saldoSats,
        saldoEur,
        dailyData,
        stats,
        coffeeStats,
        isLoading: false,
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Data fetch error:', error);
      setError(`Fehler beim Laden der Daten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      setLoading(false);
    }
  },
}));