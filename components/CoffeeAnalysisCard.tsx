'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { Coffee, TrendingUp } from '@mui/icons-material'; // Removed unused imports
// import { Assessment, Psychology, ShoppingCart } from '@mui/icons-material'; // Unused imports removed
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { ClientOnly } from '@/components/ClientOnly';

export const CoffeeAnalysisCard = () => {
  const { coffeeStats, isLoading, saldoEur } = useStore();

  if (isLoading) {
    return (
      <Card className="mb-6 shadow-lg border-0">
        <CardContent className="p-6">
          <div className="h-80 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const {
    coffeePrice,
    smartCoffeeCount,
    averagePricePerCoffee
  } = coffeeStats;

  // Keine Umsatz- oder KI-Analyse mehr

  return (
    <ClientOnly fallback={
      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <div className="h-80 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl animate-pulse"></div>
        </CardContent>
      </Card>
    }>
      <Card className="mb-6 bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-5xl w-full mx-auto">
        <CardContent className="p-8 max-w-5xl w-full mx-auto">
          <Box className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Coffee Icon & Price */}
            <Box className="flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200 shadow">
              <Coffee className="text-amber-600 text-5xl mb-2" />
              <Typography variant="h5" className="text-amber-700 font-bold mb-1">Kaffee-Analyse</Typography>
              <Typography variant="body2" className="text-gray-700 mb-2">{formatCurrency(coffeePrice, 'EUR')} pro Kaffee</Typography>
            </Box>
            {/* Coffee Count & Average Price */}
            <Box className="flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-amber-50 to-white rounded-lg p-6 border border-amber-100 shadow">
              <Typography variant="h2" className="text-amber-600 font-extrabold mb-1 leading-none">{smartCoffeeCount}</Typography>
              <Typography variant="caption" className="text-gray-500 font-semibold uppercase tracking-wider mb-2">Kaffees (intelligente Zählung)</Typography>
              <Box className="flex flex-col items-center">
                <Typography variant="h5" className="text-gray-900 font-bold mb-1">{formatCurrency(averagePricePerCoffee, 'EUR')}</Typography>
                <Typography variant="caption" className="text-gray-600">Ø Preis/Kaffee</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </ClientOnly>
  );
};