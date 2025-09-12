import { create } from 'zustand';
import { aggregateDaily, calculateStats, generateMockTransactions, type BlinkTransaction } from '@/lib/utils';

interface DashboardData {
  date: string;
  euros: number;
  sats: number;
  transactionCount: number;
  profit: 'positive' | 'negative' | 'neutral';
}

interface Stats {
  totalEuros: number;
  totalSats: number;
  totalTransactions: number;
  averageTransactionValue: number;
  dailyAverage: number;
}

interface StoreState {
  saldoEur: number;
  saldoSats: number;
  dailyData: DashboardData[];
  stats: Stats;
  currentPrice: number;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  useMockData: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  fetchPrice: () => Promise<number>;
  fetchBalance: () => Promise<{ sats: number; eur: number }>;
  fetchTransactions: () => Promise<BlinkTransaction[]>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleMockData: () => void;
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
    dailyAverage: 0
  },
  currentPrice: 52000, // Fallback BTC Preis
  isLoading: false,
  error: null,
  lastUpdate: null,
  useMockData: true, // Standardmäßig Mock-Daten für Entwicklung
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  toggleMockData: () => set(state => ({ useMockData: !state.useMockData })),
  
  // Aktuelle BTC/EUR Preise abrufen
  fetchPrice: async (): Promise<number> => {
    try {
      const response = await fetch('/api/price?currency=eur');
      if (!response.ok) throw new Error('Preis konnte nicht abgerufen werden');
      
      const data = await response.json();
      return data.price || 52000; // Fallback
    } catch (error) {
      console.error('Price fetch error:', error);
      return 52000; // Fallback Preis
    }
  },

  // Wallet Balance von Blink API abrufen
  fetchBalance: async (): Promise<{ sats: number; eur: number }> => {
    const { useMockData, currentPrice } = get();
    
    if (useMockData) {
      return { sats: 250000, eur: (250000 / 100_000_000) * currentPrice };
    }

    try {
      const response = await fetch('/api/blink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryType: 'balance' })
      });

      if (!response.ok) {
        throw new Error(`Balance API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extrahiere Balance aus Blink API Response
      const wallet = data?.me?.defaultAccount?.wallets?.[0];
      if (!wallet) {
        throw new Error('Keine Wallet-Daten gefunden');
      }

      const sats = wallet.balance || 0;
      const eur = (sats / 100_000_000) * currentPrice;
      
      return { sats, eur };
    } catch (error) {
      console.error('Balance fetch error:', error);
      throw error;
    }
  },

  // Transaktionen von Blink API abrufen
  fetchTransactions: async (): Promise<BlinkTransaction[]> => {
    const { useMockData } = get();
    
    if (useMockData) {
      return generateMockTransactions();
    }

    try {
      const response = await fetch('/api/blink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          queryType: 'transactions',
          variables: { first: 100 }
        })
      });

      if (!response.ok) {
        throw new Error(`Transactions API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extrahiere Transaktionen aus Blink API Response
      const transactions = data?.me?.defaultAccount?.wallets?.[0]?.transactions?.edges?.map(
        (edge: any) => edge.node
      ) || [];
      
      return transactions;
    } catch (error) {
      console.error('Transactions fetch error:', error);
      throw error;
    }
  },
  
  // Hauptfunktion: Alle Daten laden und aggregieren
  fetchData: async () => {
    const { setLoading, setError, fetchPrice, fetchBalance, fetchTransactions } = get();
    
    setLoading(true);
    setError(null);
    
    try {
      // Parallel API-Calls für bessere Performance
      const [currentPrice, balance, transactions] = await Promise.all([
        fetchPrice(),
        fetchBalance().catch(() => ({ sats: 250000, eur: 130 })), // Fallback bei Fehlern
        fetchTransactions().catch(() => generateMockTransactions()) // Fallback zu Mock-Daten
      ]);

      // Tägliche Daten aggregieren
      const dailyData = aggregateDaily(transactions, currentPrice);
      const stats = calculateStats(dailyData);

      set({ 
        currentPrice,
        saldoSats: balance.sats,
        saldoEur: balance.eur,
        dailyData,
        stats,
        isLoading: false,
        lastUpdate: new Date().toISOString()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Data fetch error:', error);
      
      setError(errorMessage);
      setLoading(false);
      
      // Im Fehlerfall Mock-Daten laden
      try {
        const mockTransactions = generateMockTransactions();
        const currentPrice = 52000;
        const dailyData = aggregateDaily(mockTransactions, currentPrice);
        const stats = calculateStats(dailyData);
        
        set({
          currentPrice,
          saldoSats: 250000,
          saldoEur: 130,
          dailyData,
          stats,
          useMockData: true
        });
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }
  },
}));