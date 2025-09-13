'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { Coffee, TrendingUp, TrendingDown, Assessment, Psychology, ShoppingCart } from '@mui/icons-material';
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
    estimatedCoffeeCount,
    smartCoffeeCount,
    multiCoffeeTransactions,
    expectedRevenue,
    actualRevenue,
    revenueDifference,
    averagePricePerCoffee,
    accuracyImprovement,
    totalSent,
    sendCount
  } = coffeeStats;

  const isDifferencePositive = revenueDifference > 0;

  return (
    <ClientOnly fallback={
      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <div className="h-80 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl animate-pulse"></div>
        </CardContent>
      </Card>
    }>
      <Card className="mb-6 overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900">
        <CardContent className="p-0">
          <Box className="p-6 pb-4 bg-gradient-to-r from-amber-600/20 via-orange-600/15 to-amber-700/20 border-b border-amber-500/20">
            <Box className="flex items-center justify-between">
              <Box className="flex items-center space-x-4">
                <Box className="p-3 bg-amber-500 rounded-2xl shadow-lg border-2 border-amber-400">
                  <Coffee className="text-white text-3xl drop-shadow-lg" />
                </Box>
                <Box>
                  <Typography variant="h5" className="text-white font-bold tracking-tight mb-1 drop-shadow-md">
                    ☕ Intelligente Kaffee-Analyse
                  </Typography>
                  <Typography variant="body2" className="text-gray-200 font-medium">
                    KI-basierte Erkennung • {formatCurrency(coffeePrice, 'EUR')} pro Kaffee
                  </Typography>
                </Box>
              </Box>
              
              <Box className="text-right">
                <Box className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 border-2 border-amber-400 shadow-xl">
                  <Typography variant="h3" className="text-white font-black tracking-tight mb-1 drop-shadow-lg">
                    {smartCoffeeCount}
                  </Typography>
                  <Typography variant="caption" className="text-amber-100 font-semibold uppercase tracking-wider">
                    Kaffees Erkannt
                  </Typography>
                  {accuracyImprovement > 0 && (
                    <Box className="flex items-center justify-center mt-2 space-x-1">
                      <TrendingUp className="text-green-200 text-sm" />
                      <Typography variant="caption" className="text-green-200 font-bold">
                        +{accuracyImprovement}% genauer
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="p-6">
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Box className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 border border-slate-600 shadow-lg">
                <Box className="flex items-center space-x-3 mb-3">
                  <Psychology className="text-blue-400 text-2xl" />
                  <Typography variant="h6" className="text-white font-bold">
                    KI-Erkennung
                  </Typography>
                </Box>
                <Typography variant="h4" className="text-blue-300 font-black mb-1">
                  {smartCoffeeCount}
                </Typography>
                <Typography variant="body2" className="text-gray-300 font-medium">
                  vs. {estimatedCoffeeCount} einfache Zählung
                </Typography>
                {accuracyImprovement > 0 && (
                  <Typography variant="caption" className="text-green-400 font-semibold">
                    +{accuracyImprovement}% Genauigkeit
                  </Typography>
                )}
              </Box>
              
              <Box className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 border border-slate-600 shadow-lg">
                <Box className="flex items-center space-x-3 mb-3">
                  <ShoppingCart className="text-purple-400 text-2xl" />
                  <Typography variant="h6" className="text-white font-bold">
                    Mehrfach-Käufe
                  </Typography>
                </Box>
                <Typography variant="h4" className="text-purple-300 font-black mb-1">
                  {multiCoffeeTransactions}
                </Typography>
                <Typography variant="body2" className="text-gray-300 font-medium">
                  Transaktionen größer {formatCurrency(coffeePrice, 'EUR')}
                </Typography>
              </Box>
              
              <Box className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 border border-slate-600 shadow-lg">
                <Box className="flex items-center space-x-3 mb-3">
                  <Coffee className="text-amber-400 text-2xl" />
                  <Typography variant="h6" className="text-white font-bold">
                    Ø Preis/Kaffee
                  </Typography>
                </Box>
                <Typography variant="h4" className="text-amber-300 font-black mb-1">
                  {formatCurrency(averagePricePerCoffee, 'EUR')}
                </Typography>
                <Typography variant="body2" className="text-gray-300 font-medium">
                  bei {smartCoffeeCount} erkannten Kaffees
                </Typography>
              </Box>
            </Box>

            <Box className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-slate-600 shadow-lg">
              <Box className="flex items-center space-x-3 mb-6">
                <Assessment className="text-white text-2xl" />
                <Typography variant="h6" className="text-white font-bold">
                  Umsatz-Analyse
                </Typography>
              </Box>
              
              <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Box className="bg-slate-600 rounded-xl p-4 text-center border border-slate-500 shadow-lg">
                  <Typography variant="caption" className="text-gray-300 uppercase tracking-wider font-semibold block mb-2">
                    Erwarteter Umsatz
                  </Typography>
                  <Typography variant="h6" className="text-white font-bold mb-1">
                    {formatCurrency(expectedRevenue, 'EUR')}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    {smartCoffeeCount} × {formatCurrency(coffeePrice, 'EUR')}
                  </Typography>
                </Box>

                <Box className="bg-slate-600 rounded-xl p-4 text-center border border-slate-500 shadow-lg">
                  <Typography variant="caption" className="text-gray-300 uppercase tracking-wider font-semibold block mb-2">
                    Kaffee-Umsatz
                  </Typography>
                  <Typography variant="h6" className="text-white font-bold mb-1">
                    {formatCurrency(actualRevenue, 'EUR')}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    Nur Eingänge
                  </Typography>
                </Box>

                <Box className="bg-slate-600 rounded-xl p-4 text-center border border-slate-500 shadow-lg">
                  <Typography variant="caption" className="text-gray-300 uppercase tracking-wider font-semibold block mb-2">
                    Differenz
                  </Typography>
                  <Box className="flex items-center justify-center space-x-1 mb-1">
                    {isDifferencePositive ? (
                      <TrendingUp className="text-green-400 text-lg" />
                    ) : (
                      <TrendingDown className="text-red-400 text-lg" />
                    )}
                    <Typography 
                      variant="h6" 
                      className={`font-bold ${isDifferencePositive ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {formatCurrency(Math.abs(revenueDifference), 'EUR')}
                    </Typography>
                  </Box>
                  <Typography variant="caption" className="text-gray-400">
                    {isDifferencePositive ? 'Über Erwartung' : 'Unter Erwartung'}
                  </Typography>
                </Box>

                <Box className="bg-slate-600 rounded-xl p-4 text-center border border-slate-500 shadow-lg">
                  <Typography variant="caption" className="text-gray-300 uppercase tracking-wider font-semibold block mb-2">
                    Aktueller Saldo
                  </Typography>
                  <Typography variant="h6" className="text-white font-bold mb-1">
                    {formatCurrency(saldoEur, 'EUR')}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    Wallet-Guthaben
                  </Typography>
                </Box>
              </Box>

              {/* Einfache Ausgaben-Info */}
              <Box className="bg-slate-600 rounded-xl p-4 border border-slate-500">
                <Typography variant="body2" className="text-white font-semibold mb-3">
                  � Ausgaben-Übersicht
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="text-center">
                    <Typography variant="caption" className="text-gray-300 block">Anzahl Ausgaben</Typography>
                    <Typography variant="h6" className="text-red-400 font-bold">
                      {sendCount}
                    </Typography>
                    <Typography variant="caption" className="text-gray-400">Transaktionen</Typography>
                  </Box>
                  <Box className="text-center">
                    <Typography variant="caption" className="text-gray-300 block">Gesamt-Ausgaben</Typography>
                    <Typography variant="h6" className="text-red-400 font-bold">
                      {formatCurrency(totalSent, 'EUR')}
                    </Typography>
                    <Typography variant="caption" className="text-gray-400">Lightning-Zahlungen</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {(accuracyImprovement > 0 || multiCoffeeTransactions > 0) && (
              <Box className="mt-6 bg-gradient-to-br from-indigo-700 to-purple-800 rounded-2xl p-6 border border-indigo-500 shadow-lg">
                <Typography variant="h6" className="text-white font-bold mb-4 flex items-center space-x-2">
                  <span>🧠</span>
                  <span>Intelligente Erkennung erklärt</span>
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-white font-medium">
                      📋 Wie es funktioniert:
                    </Typography>
                    <Typography variant="caption" className="text-gray-200 block">
                      • Transaktionen über {formatCurrency(coffeePrice, 'EUR')} = Mehrfach-Käufe
                    </Typography>
                    <Typography variant="caption" className="text-gray-200 block">
                      • Beispiel: {formatCurrency(3.05, 'EUR')} ÷ {formatCurrency(coffeePrice, 'EUR')} ≈ 10 Kaffees
                    </Typography>
                    <Typography variant="caption" className="text-gray-200 block">
                      • Intelligente Rundung bei kleinen Abweichungen
                    </Typography>
                  </Box>
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-white font-medium">
                      📊 Verbesserungen:
                    </Typography>
                    {accuracyImprovement > 0 && (
                      <Typography variant="caption" className="text-green-300 block font-bold">
                        ✨ +{accuracyImprovement}% genauer als einfache Division
                      </Typography>
                    )}
                    {multiCoffeeTransactions > 0 && (
                      <Typography variant="caption" className="text-amber-300 block font-bold">
                        🎯 {multiCoffeeTransactions} Mehrfach-Käufe automatisch erkannt
                      </Typography>
                    )}
                    <Typography variant="caption" className="text-blue-300 block font-bold">
                      🚀 Realitätsnahe Geschäftsanalytik
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </ClientOnly>
  );
};