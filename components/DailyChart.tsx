'use client';

import { useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, Receipt, Euro, ShowChart } from '@mui/icons-material';
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
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
          <p className="text-gray-600 dark:text-gray-300">{`Datum: ${new Date(label).toLocaleDateString('de-DE')}`}</p>
          <p className="text-bitcoin-orange font-semibold">
            {`Eingänge: ${formatCurrency(data.euros, 'EUR')}`}
          </p>
          <p className="text-lightning-blue">
            {`Sats: ${formatCurrency(data.sats, 'SATS')}`}
          </p>
          <p className="text-gray-500">
            {`Transaktionen: ${data.transactionCount}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-4 shadow-lg">
      <CardContent className="p-6">
        <Box className="flex items-center justify-between mb-6">
          <Box className="flex items-center space-x-3">
            <TrendingUp className="text-bitcoin-orange" />
            <Box>
              <Typography variant="h6" className="font-semibold">
                Tägliche Kaffee-Eingänge
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {timeRange === 'current-month' && '📅 September 2025'}
                {timeRange === 'all-time' && '📅 Seit 1. Februar 2025'}
                {timeRange === 'custom' && customStartDate && customEndDate && 
                  `📅 ${new Date(customStartDate).toLocaleDateString('de-DE')} - ${new Date(customEndDate).toLocaleDateString('de-DE')}`
                }
              </Typography>
            </Box>
          </Box>
          
          {/* Erweiterte Zeitraum-Auswahl */}
          <DateRangeSelector />
            
          {/* Statistiken */}
          <div className="flex space-x-4 max-w-md">
            <div className="text-center">
              <Typography variant="caption" className="text-gray-500">
                Gesamt
              </Typography>
              <Typography variant="body2" className="font-semibold text-bitcoin-orange">
                {formatCurrency(stats.totalEuros, 'EUR')}
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="caption" className="text-gray-500">
                Ø/Tag
              </Typography>
              <Typography variant="body2" className="font-semibold text-green-600">
                {formatCurrency(stats.dailyAverage, 'EUR')}
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="caption" className="text-gray-500">
                TX
              </Typography>
              <Typography variant="body2" className="font-semibold text-blue-600">
                {stats.totalTransactions}
              </Typography>
            </div>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <Euro className="text-bitcoin-orange mb-1" />
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
              Ø pro Transaktion
            </Typography>
            <Typography variant="h6" className="font-semibold text-bitcoin-orange">
              {formatCurrency(stats.averageTransactionValue, 'EUR')}
            </Typography>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <Receipt className="text-lightning-blue mb-1" />
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
              Gesamt Sats
            </Typography>
            <Typography variant="h6" className="font-semibold text-lightning-blue">
              {formatCurrency(stats.totalSats, 'SATS')}
            </Typography>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <ShowChart className="text-green-600 mb-1" />
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
              Tage erfasst
            </Typography>
            <Typography variant="h6" className="font-semibold text-green-600">
              {dailyData.length}
            </Typography>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <TrendingUp className="text-blue-600 mb-1" />
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
              Status
            </Typography>
            <Typography variant="h6" className="font-semibold text-green-600">
              ⚡ Aktiv
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};