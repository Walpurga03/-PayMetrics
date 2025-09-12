'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useStore } from '@/store/useStore';

export const DailyChart = () => {
  const { dailyData, isLoading } = useStore();

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
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
          <p className="text-gray-600 dark:text-gray-300">{`Datum: ${new Date(label).toLocaleDateString('de-DE')}`}</p>
          <p className="text-bitcoin-orange font-semibold">
            {`Eingänge: ${payload[0].value.toFixed(2)} €`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-4 shadow-lg">
      <CardContent className="p-6">
        <Box className="flex items-center space-x-2 mb-4">
          <TrendingUp className="text-bitcoin-orange" />
          <Typography variant="h6" className="font-semibold">
            Tägliche Kaffee-Eingänge
          </Typography>
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
        
        <Box className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
            ☕️ Gesamt der letzten 5 Tage: <span className="font-semibold text-bitcoin-orange">
              {dailyData.reduce((sum, day) => sum + day.euros, 0).toFixed(2)} €
            </span>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};