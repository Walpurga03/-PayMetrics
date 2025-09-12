'use client';

import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, AccountBalanceWallet } from '@mui/icons-material';
import { useStore } from '@/store/useStore';

export const SaldoCard = () => {
  const { saldoEur, saldoSats, isLoading } = useStore();

  if (isLoading) {
    return (
      <Card className="mb-4 animate-pulse">
        <CardContent>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 bg-gradient-to-r from-bitcoin-orange to-lightning-blue shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center space-x-3">
            <AccountBalanceWallet className="text-white text-3xl" />
            <Box>
              <Typography variant="h4" className="text-white font-bold">
                {saldoEur.toFixed(2)} €
              </Typography>
              <Typography variant="body2" className="text-white/80">
                {saldoSats.toLocaleString()} sats
              </Typography>
            </Box>
          </Box>
          <Box className="text-right">
            <Chip 
              icon={<TrendingUp />} 
              label="Aktueller Saldo" 
              className="bg-white/20 text-white"
              size="small"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};