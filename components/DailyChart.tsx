'use client';

import { useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, Receipt, Euro, ShowChart, Coffee } from '@mui/icons-material';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { DateRangeSelector } from './DateRangeSelector';

export const DailyChart = () => {
  const { dailyData, stats, isLoading, timeRange, customStartDate, customEndDate, fetchData } = useStore();

  // Daten neu laden wenn sich der Zeitraum ändert
  useEffect(() => {
    fetchData();
  }, [timeRange, fetchData]);

  if (isLoading) {
    return (
      <Card className="mb-4 animate-pulse">
        <CardContent>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Custom Tooltip für bessere UX
  interface TooltipPayload {
    payload: {
      euros: number;
      transactionCount: number;
      coffeeCount?: number;
      [key: string]: unknown;
    };
  }
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
          <p className="text-gray-600 dark:text-gray-300">{`Datum: ${label ? new Date(label).toLocaleDateString('de-DE') : ''}`}</p>
          <p className="text-bitcoin-orange font-semibold">
            {`Eingänge: ${formatCurrency(data.euros, 'EUR')}`}
          </p>
          <p className="text-gray-500">
            {`Transaktionen: ${data.transactionCount}`}
          </p>
          <p className="text-green-700 font-semibold">
            {`Kaffees: ${data.coffeeCount ?? 0}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-6 bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-5xl w-full mx-auto">
      <CardContent className="p-8 max-w-5xl w-full mx-auto">
        <Box className="flex flex-col items-center justify-center mb-8">
          <TrendingUp className="text-bitcoin-orange text-5xl mb-2" />
          <Typography variant="h5" className="font-bold text-gray-900 mb-1 text-center">
            Tägliche Kaffee-Eingänge
          </Typography>
          <Typography variant="caption" className="text-gray-700 mb-2 text-center">
            {timeRange === 'current-month' && '📅 September 2025'}
            {timeRange === 'all-time' && '📅 Seit 1. Februar 2025'}
            {timeRange === 'custom' && customStartDate && customEndDate && 
              `📅 ${new Date(customStartDate).toLocaleDateString('de-DE')} - ${new Date(customEndDate).toLocaleDateString('de-DE')}`
            }
          </Typography>
          <DateRangeSelector />
        </Box>
        {/* Statistiken */}
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Box className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200 text-center shadow flex flex-col items-center">
            <Euro className="text-bitcoin-orange text-3xl mb-2" />
            <Typography variant="caption" className="text-gray-500">Gesamt</Typography>
            <Typography variant="h5" className="font-bold text-bitcoin-orange">{formatCurrency(stats.totalEuros, 'EUR')}</Typography>
          </Box>
          <Box className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200 text-center shadow flex flex-col items-center">
            <ShowChart className="text-green-600 text-3xl mb-2" />
            <Typography variant="caption" className="text-gray-500">Ø/Tag</Typography>
            <Typography variant="h5" className="font-bold text-green-600">{formatCurrency(stats.dailyAverage, 'EUR')}</Typography>
          </Box>
          <Box className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 text-center shadow flex flex-col items-center">
            <Coffee className="text-blue-600 text-3xl mb-2" />
            <Typography variant="caption" className="text-gray-500">Kaffees</Typography>
            <Typography variant="h5" className="font-bold text-blue-600">{stats.totalCoffees ?? 0}</Typography>
          </Box>
        </Box>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('de-DE', { 
                month: 'short', 
                day: 'numeric' 
              })}
              className="text-gray-600 dark:text-gray-300"
            />
            <YAxis 
              tickFormatter={(value) => `${value}€`}
              className="text-gray-600 dark:text-gray-300"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="euros" 
              fill="url(#bitcoinGradient)"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity duration-200"
            />
            <defs>
              <linearGradient id="bitcoinGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7931a" />
                <stop offset="100%" stopColor="#ffb300" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Erweiterte Statistiken */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Box className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200 text-center shadow flex flex-col items-center">
            <Receipt className="text-amber-600 text-3xl mb-2" />
            <Typography variant="body2" className="text-gray-600">Gesamt Sats</Typography>
            <Typography variant="h5" className="font-bold text-amber-600">{formatCurrency(stats.totalSats, 'SATS')}</Typography>
          </Box>
          <Box className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 text-center shadow flex flex-col items-center">
            <ShowChart className="text-blue-600 text-3xl mb-2" />
            <Typography variant="body2" className="text-gray-600">Tage erfasst</Typography>
            <Typography variant="h5" className="font-bold text-blue-600">{dailyData.length}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};