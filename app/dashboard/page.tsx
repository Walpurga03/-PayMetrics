'use client';

import { useEffect } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import { Coffee, Refresh, DarkMode, LightMode } from '@mui/icons-material';
import { SaldoCard } from '@/components/SaldoCard';
import { DailyChart } from '@/components/DailyChart';
import { CoffeeAnalysisCard } from '@/components/CoffeeAnalysisCard';
import { ClientOnly } from '@/components/ClientOnly';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function Dashboard() {
  const { fetchData, isLoading, error } = useStore();
  const [darkMode, setDarkMode] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Client-side Only Code
    setIsClient(true);
    
    // Daten beim ersten Laden holen
    fetchData();
    
    // Dark Mode aus localStorage laden
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Dark Mode CSS-Klasse anwenden
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [fetchData]);

  const toggleDarkMode = () => {
    if (!isClient) return; // Verhindere SSR-Probleme
    
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Entfernt: handleRefresh wurde nicht verwendet

  // Verhindere Hydration Mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <Coffee className="text-bitcoin-orange text-6xl mb-4 mx-auto" />
          <Typography variant="h4" className="text-gray-700">
            PayMetrics wird geladen...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="w-full px-4 py-8 mx-auto max-w-3xl">
        {/* Header */}
        <Box className="flex flex-col items-center justify-center mb-8">
          <Coffee className="text-bitcoin-orange text-5xl mb-2" />
          <Typography variant="h3" className="font-bold text-gray-900 dark:text-white text-center">
            ☕️ Kaffee Dashboard
          </Typography>
          <Typography variant="subtitle1" className="text-gray-700 dark:text-gray-300 text-center mt-1">
            Lightning-powered Coffee Payments
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" className="mb-6 max-w-lg mx-auto">
            {error}
          </Alert>
        )}

        {/* Dashboard Content */}
        <ClientOnly fallback={
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-gray-200 h-32 rounded-lg animate-pulse"></div>
            <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
          </div>
        }>
          <Box className="space-y-6 max-w-3xl mx-auto">
            <SaldoCard />
            <CoffeeAnalysisCard />
            <DailyChart />
            
            {/* Zusätzliche Info-Karte */}
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Box className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <Typography variant="h6" className="text-bitcoin-orange font-semibold mb-2">
                  ⚡ Lightning Network
                </Typography>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                  Sofortige, kostengünstige Bitcoin-Zahlungen für Ihren Kaffee
                </Typography>
              </Box>
              
              <Box className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <Typography variant="h6" className="text-lightning-blue font-semibold mb-2">
                  🔗 Blink Integration
                </Typography>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                  Powered by Blink Wallet für sichere Lightning-Transaktionen
                </Typography>
              </Box>
              
              <Box className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <Typography variant="h6" className="text-green-600 font-semibold mb-2">
                  📊 Real-time Analytics
                </Typography>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                  Live-Tracking Ihrer Kaffee-Verkäufe und Einnahmen
                </Typography>
              </Box>
            </Box>
          </Box>
        </ClientOnly>
      </div>
    </div>
  );
}