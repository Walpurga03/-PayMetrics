'use client';

import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { TrendingUp, AccountBalanceWallet, Refresh } from '@mui/icons-material';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { ClientOnly } from '@/components/ClientOnly';

export const SaldoCard = () => {
  const { saldoEur, saldoSats, currentPrice, isLoading, lastUpdate, useMockData, fetchData } = useStore();

  if (isLoading) {
    return (
      <Card className="mb-4 animate-pulse">
        <CardContent>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <ClientOnly fallback={
      <Card className="mb-4 bg-gradient-to-r from-orange-400 to-blue-500 shadow-lg">
        <CardContent className="p-6">
          <div className="h-24 bg-white/20 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    }>
      <Card className="mb-4 bg-gradient-to-r from-bitcoin-orange to-lightning-blue shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center space-x-3">
              <AccountBalanceWallet className="text-white text-3xl" />
              <Box>
                <Typography variant="h4" className="text-white font-bold">
                  {formatCurrency(saldoEur, 'EUR')}
                </Typography>
                <Typography variant="body2" className="text-white/80">
                  {formatCurrency(saldoSats, 'SATS')}
                </Typography>
              </Box>
            </Box>
            <Box className="text-right flex items-center space-x-2">
              <IconButton onClick={handleRefresh} className="text-white" size="small">
                <Refresh className={isLoading ? 'animate-spin' : ''} />
              </IconButton>
              <Chip 
                icon={<TrendingUp />} 
                label="Aktueller Saldo" 
                className="bg-white/20 text-white"
                size="small"
              />
            </Box>
          </Box>
          
          <Box className="grid grid-cols-2 gap-4 mt-4">
            <Box className="bg-white/10 p-3 rounded-lg">
              <Typography variant="body2" className="text-white/80">
                BTC Preis
              </Typography>
              <Typography variant="h6" className="text-white font-semibold">
                {formatCurrency(currentPrice, 'EUR')}
              </Typography>
            </Box>
            <Box className="bg-white/10 p-3 rounded-lg">
              <Typography variant="body2" className="text-white/80">
                BTC Balance
              </Typography>
              <Typography variant="h6" className="text-white font-semibold">
                ₿ {(saldoSats / 100_000_000).toFixed(8)}
              </Typography>
            </Box>
          </Box>

          {useMockData && (
            <Box className="mt-3 p-2 bg-yellow-500/20 rounded text-center">
              <Typography variant="caption" className="text-yellow-900 dark:text-yellow-100 font-medium">
                🧪 Entwicklungsmodus - Mock-Daten werden verwendet
              </Typography>
            </Box>
          )}

          {lastUpdate && (
            <Typography variant="caption" className="text-white/80 dark:text-white/60 mt-2 block" suppressHydrationWarning>
              Letzte Aktualisierung: {new Date(lastUpdate).toLocaleTimeString('de-DE')}
            </Typography>
          )}
        </CardContent>
      </Card>
    </ClientOnly>
  );
};