'use client';

import { Card, CardContent, Typography, Box, Button, Chip, Switch, FormControlLabel } from '@mui/material';
import { BugReport, Api, DataObject } from '@mui/icons-material';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export const DebugPanel = () => {
  const { useMockData, toggleMockData, lastUpdate, error, isLoading, fetchData } = useStore();
  const [showDetails, setShowDetails] = useState(false);

  const testApiEndpoints = async () => {
    console.log('Testing API endpoints...');
    
    // Test Blink API
    try {
      const blinkResponse = await fetch('/api/blink');
      console.log('Blink API Status:', await blinkResponse.json());
    } catch (error) {
      console.error('Blink API Error:', error);
    }

    // Test Price API
    try {
      const priceResponse = await fetch('/api/price');
      console.log('Price API Status:', await priceResponse.json());
    } catch (error) {
      console.error('Price API Error:', error);
    }
  };

  return (
    <Card className="mb-4 border border-orange-200 bg-orange-50 dark:bg-orange-900/10">
      <CardContent className="p-4">
        <Box className="flex items-center justify-between mb-3">
          <Box className="flex items-center space-x-2">
            <BugReport className="text-orange-500" />
            <Typography variant="h6" className="text-orange-700 dark:text-orange-300">
              🛠️ Entwicklungs-Panel
            </Typography>
          </Box>
          <Chip 
            label={process.env.NODE_ENV || 'development'} 
            color="warning" 
            size="small" 
          />
        </Box>

        <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={useMockData}
                  onChange={toggleMockData}
                  color="warning"
                />
              }
              label="Mock-Daten verwenden"
            />
          </Box>
          
          <Box>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
              Status: <Chip 
                label={isLoading ? 'Lädt...' : error ? 'Fehler' : 'OK'} 
                color={isLoading ? 'info' : error ? 'error' : 'success'}
                size="small"
              />
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
              Letzte Aktualisierung: <span suppressHydrationWarning>{lastUpdate ? new Date(lastUpdate).toLocaleTimeString('de-DE') : 'Nie'}</span>
            </Typography>
          </Box>
        </Box>

        <Box className="flex flex-wrap gap-2">
          <Button
            variant="outlined"
            size="small"
            startIcon={<Api />}
            onClick={testApiEndpoints}
            className="text-orange-600 border-orange-300"
          >
            APIs testen
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<DataObject />}
            onClick={() => setShowDetails(!showDetails)}
            className="text-orange-600 border-orange-300"
          >
            Details {showDetails ? 'ausblenden' : 'anzeigen'}
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={fetchData}
            disabled={isLoading}
            className="text-orange-600 border-orange-300"
          >
            Daten neu laden
          </Button>
        </Box>

        {showDetails && (
          <Box className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
            <Typography variant="subtitle2" className="mb-2">
              🔧 Debug-Informationen:
            </Typography>
            <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto" suppressHydrationWarning>
              {JSON.stringify({
                useMockData,
                hasError: !!error,
                isLoading,
                lastUpdate,
                environment: {
                  NODE_ENV: process.env.NODE_ENV,
                  hasBlinkToken: !!process.env.BLINK_TOKEN,
                  hasCoinGeckoKey: !!process.env.COINGECKO_API_KEY
                }
              }, null, 2)}
            </pre>
          </Box>
        )}

        {error && (
          <Box className="mt-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 rounded">
            <Typography variant="body2" className="text-red-700 dark:text-red-300">
              ⚠️ Fehler: {error}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};