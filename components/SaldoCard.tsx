'use client';

import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { TrendingUp, AccountBalanceWallet, Refresh } from '@mui/icons-material';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { ClientOnly } from '@/components/ClientOnly';

export const SaldoCard = () => {
  const { saldoEur, saldoSats, currentPrice, isLoading, lastUpdate, fetchData } = useStore();

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
      <Card className="mb-6 bg-gradient-to-r from-bitcoin-orange to-lightning-blue shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-yellow-400/20">
        <CardContent className="p-8">
          <Box className="flex items-center justify-between mb-6">
            <Box className="flex items-center space-x-4">
              <AccountBalanceWallet className="text-white text-5xl drop-shadow-lg" />
              <Box>
                <Typography variant="caption" className="text-white/80 uppercase tracking-wide font-semibold">
                  💰 Aktueller Kaffee-Shop Saldo
                </Typography>
                <Typography variant="h2" className="text-white font-bold text-shadow-lg leading-tight">
                  {formatCurrency(saldoEur, 'EUR')}
                </Typography>
                <Typography variant="h6" className="text-white/90 font-medium">
                  {formatCurrency(saldoSats, 'SATS')} ⚡
                </Typography>
              </Box>
            </Box>
            <Box className="text-right flex items-center space-x-3">
              <IconButton 
                onClick={handleRefresh} 
                className="text-white bg-white/20 hover:bg-white/30 transition-colors" 
                size="large"
              >
                <Refresh className={isLoading ? 'animate-spin' : ''} fontSize="large" />
              </IconButton>
              <Chip 
                icon={<TrendingUp />} 
                label="Live Balance" 
                className="bg-green-500/80 text-white font-semibold px-3 py-1"
                size="medium"
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