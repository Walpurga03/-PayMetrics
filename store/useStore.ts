import { create } from 'zustand';

interface DashboardData {
  date: string;
  euros: number;
  profit: 'positive' | 'negative' | 'neutral';
}

interface StoreState {
  saldoEur: number;
  saldoSats: number;
  dailyData: DashboardData[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  saldoEur: 0,
  saldoSats: 0,
  dailyData: [],
  isLoading: false,
  error: null,
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  
  fetchData: async () => {
    const { setLoading, setError } = get();
    setLoading(true);
    setError(null);
    
    try {
      // Erstmal Mock-Daten für die Entwicklung
      // TODO: Später durch echte API-Calls ersetzen
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const mockData: DashboardData[] = [
        { date: '2025-09-08', euros: 12.50, profit: 'positive' },
        { date: '2025-09-09', euros: 8.75, profit: 'positive' },
        { date: '2025-09-10', euros: 15.25, profit: 'positive' },
        { date: '2025-09-11', euros: 22.00, profit: 'positive' },
        { date: '2025-09-12', euros: 18.50, profit: 'positive' },
      ];
      
      set({ 
        saldoEur: 157.50,
        saldoSats: 250000,
        dailyData: mockData,
        isLoading: false 
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler');
      setLoading(false);
    }
  },
}));