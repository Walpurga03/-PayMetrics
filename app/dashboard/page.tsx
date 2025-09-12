'use client';

import { useEffect } from 'react';
import { Container, Typography, Box, Button, Alert } from '@mui/material';
import { Coffee, Refresh, DarkMode, LightMode, Settings } from '@mui/icons-material';
import { SaldoCard } from '@/components/SaldoCard';
import { DailyChart } from '@/components/DailyChart';
import { DebugPanel } from '@/components/DebugPanel';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function Dashboard() {
  const { fetchData, isLoading, error, useMockData, toggleMockData } = useStore();
  const [darkMode, setDarkMode] = useState(false);
  const [showDebug, setShowDebug] = useState(true); // Im Development-Modus standardmäßig anzeigen

  useEffect(() => {
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
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Container maxWidth="lg" className="py-8">
        {/* Header */}
        <Box className="flex items-center justify-between mb-8">
          <Box className="flex items-center space-x-3">
            <Coffee className="text-bitcoin-orange text-4xl" />
            <Box>
              <Typography variant="h3" className="font-bold text-gray-900 dark:text-white">
                ☕️ Kaffee Dashboard
              </Typography>
              <Typography variant="subtitle1" className="text-gray-600 dark:text-gray-300">
                Lightning-powered Coffee Payments
              </Typography>
            </Box>
          </Box>
          
          <Box className="flex items-center space-x-2">
            <Button
              variant="outlined"
              onClick={handleRefresh}
              disabled={isLoading}
              startIcon={<Refresh className={isLoading ? 'animate-spin' : ''} />}
              className="dark:border-gray-600 dark:text-white"
            >
              Aktualisieren
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setShowDebug(!showDebug)}
              startIcon={<Settings />}
              className="dark:border-gray-600 dark:text-white"
            >
              Debug
            </Button>
            
            <Button
              variant="outlined"
              onClick={toggleMockData}
              className="dark:border-gray-600 dark:text-white"
              color={useMockData ? 'warning' : 'primary'}
            >
              {useMockData ? '🧪 Mock' : '⚡ Live'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={toggleDarkMode}
              startIcon={darkMode ? <LightMode /> : <DarkMode />}
              className="dark:border-gray-600 dark:text-white"
            >
              {darkMode ? 'Hell' : 'Dunkel'}
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Dashboard Content */}
        <Box className="space-y-6">
          {/* Debug Panel - nur in Development */}
          {showDebug && process.env.NODE_ENV === 'development' && (
            <DebugPanel />
          )}
          
          <SaldoCard />
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
      </Container>
    </div>
  );
}