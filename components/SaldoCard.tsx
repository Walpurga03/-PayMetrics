
'use client';
import React from "react";

import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { TrendingUp, AccountBalanceWallet, Refresh } from '@mui/icons-material';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import type { BlinkTransaction } from '@/lib/utils';
import { ClientOnly } from '@/components/ClientOnly';

export const SaldoCard = () => {
  const [filterStart, setFilterStart] = React.useState('2025-02-11');
  const [filterEnd, setFilterEnd] = React.useState('2025-09-13');
  const { saldoEur, saldoSats, currentPrice, isLoading, lastUpdate, fetchData, stats, dailyData, coffeeStats, fetchTransactions } = useStore();
  const [showAusgaben, setShowAusgaben] = React.useState(false);
  type OutgoingTx = { date: string; amount: number; currency: string };
  const [outgoingTxs, setOutgoingTxs] = React.useState<OutgoingTx[]>([]);

  // Hilfsfunktion: Einzelne Ausgaben-Transaktionen extrahieren
  function getOutgoingTransactions(transactions: BlinkTransaction[]): OutgoingTx[] {
  // Always enforce minimum start date of 2025-02-11
  const minStartDate = new Date('2025-02-11T00:00:00Z');
  const userStartDate = new Date(filterStart + 'T00:00:00Z');
  const startDate = userStartDate < minStartDate ? minStartDate : userStartDate;
    const endDate = new Date(filterEnd + 'T23:59:59Z');
    return transactions
  .filter((tx: BlinkTransaction) => {
        if (tx.direction !== 'SEND' || tx.status !== 'SUCCESS') return false;
        const txDate = typeof tx.createdAt === 'number'
          ? new Date(tx.createdAt * 1000)
          : new Date(tx.createdAt);
        // Only include transactions from 2025-02-10 onwards
        return txDate >= startDate && txDate <= endDate;
      })
  .map((tx: BlinkTransaction) => {
        const sats = Math.abs(tx.settlementAmount || tx.amount || 0);
        const btc = sats / 100_000_000;
        const eur = btc * (typeof currentPrice === 'number' ? currentPrice : 0);
        return {
          date: typeof tx.createdAt === 'number'
            ? new Date(tx.createdAt * 1000).toISOString().split('T')[0]
            : new Date(tx.createdAt).toISOString().split('T')[0],
          amount: eur,
          currency: 'EUR',
        };
      });
  }

  // Lade alle Transaktionen beim Anzeigen der Ausgaben
  React.useEffect(() => {
    if (showAusgaben && outgoingTxs.length === 0) {
      fetchTransactions().then(txs => {
        setOutgoingTxs(getOutgoingTransactions(txs));
      });
    }
  }, [showAusgaben, fetchTransactions, outgoingTxs.length]);

  if (isLoading) {
    return (
          <Box>
            <Box className="mb-2 flex gap-2 items-center justify-center">
              <Box>
                <label htmlFor="filterStart" className="text-xs text-gray-500">Startdatum</label>
                <input
                  id="filterStart"
                  type="date"
                  value={filterStart}
                  min="2025-02-11"
                  max={filterEnd}
                  onChange={e => setFilterStart(e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                />
              </Box>
              <Box>
                <label htmlFor="filterEnd" className="text-xs text-gray-500">Enddatum</label>
                <input
                  id="filterEnd"
                  type="date"
                  value={filterEnd}
                  min="2025-02-11"
                  max="2025-12-31"
                  onChange={e => setFilterEnd(e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                />
              </Box>
            </Box>
            <Card className="mb-4 animate-pulse">
              <CardContent>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          </Box>
    );
  }

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <ClientOnly fallback={
      <Card className="mb-4 bg-white border border-gray-200 shadow-sm">
  <CardContent className="p-4 max-w-md mx-auto">
          <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    }>
      <Card className="mb-4 bg-white border border-gray-200 shadow-lg rounded-xl max-w-5xl w-full mx-auto">
        <CardContent className="p-6 max-w-5xl w-full mx-auto">
          {/* Saldo & BTC */}
          <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <Box className="flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 border border-gray-200">
              <AccountBalanceWallet className="text-bitcoin-orange text-4xl mb-2" />
              <Typography variant="h5" className="font-bold text-gray-900 mb-1">{formatCurrency(saldoEur, 'EUR')}</Typography>
              <Typography variant="body2" className="text-gray-600 mb-2">{formatCurrency(saldoSats, 'SATS')} ⚡</Typography>
              <Chip label="Live Balance" icon={<TrendingUp className="text-green-600" />} className="bg-green-100 text-green-700 font-semibold px-2 py-0.5 border border-green-200 mt-2" size="small" />
            </Box>
            <Box className="flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 border border-gray-200">
              <Typography variant="body2" className="text-gray-500 mb-1">BTC Preis</Typography>
              <Typography variant="h6" className="text-gray-900 font-semibold mb-1">{formatCurrency(currentPrice, 'EUR')}</Typography>
              <Typography variant="body2" className="text-gray-500 mb-1">BTC Balance</Typography>
              <Typography variant="h6" className="text-gray-900 font-semibold">₿ {(saldoSats / 100_000_000).toFixed(8)}</Typography>
            </Box>
          </Box>
          {/* Gewinn/Verlust */}
          <Box className="mt-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 text-center max-w-2xl mx-auto shadow">
            <Typography variant="body2" className="text-green-700 font-semibold mb-1">Gewinn/Verlust</Typography>
            <Typography variant="h5" className={((stats?.totalCoffees ?? 0) * 0.30 - ((stats?.totalEuros ?? 0) - (coffeeStats?.totalSent ?? 0))) >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
              {formatCurrency(((stats?.totalCoffees ?? 0) * 0.30 - ((stats?.totalEuros ?? 0) - (coffeeStats?.totalSent ?? 0))), 'EUR')}
            </Typography>
            <Typography variant="caption" className="text-gray-600">
              {stats?.totalCoffees ?? 0} Kaffees x 0,30 € – Eingänge – Ausgaben
            </Typography>
          </Box>
          {/* Ausgaben Bereich */}
          <Box className="mt-4 p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 text-center max-w-2xl mx-auto shadow">
            <Typography variant="body2" className="text-red-700 font-semibold mb-1">Gesamt Ausgaben</Typography>
            <Typography variant="h5" className="text-red-600 font-bold mb-1">{formatCurrency(coffeeStats?.totalSent ?? 0, 'EUR')}</Typography>
            <Typography variant="caption" className="text-gray-600 mb-2">{coffeeStats?.sendCount ?? 0} Ausgaben-Transaktionen</Typography>
            <Box className="mt-2">
              <button
                className="text-xs text-red-700 underline cursor-pointer font-semibold"
                onClick={() => setShowAusgaben(v => !v)}
              >
                {showAusgaben ? 'Ausgaben ausblenden' : 'Alle Ausgaben anzeigen'}
              </button>
            </Box>
            {showAusgaben && (
              <Box className="mt-2 max-h-48 overflow-y-auto text-left bg-white rounded border border-red-100 p-2">
                {outgoingTxs.length === 0 ? (
                  <Typography variant="body2" className="text-gray-400">Keine Ausgaben-Transaktionen gefunden.</Typography>
                ) : (
                  outgoingTxs.map((tx, idx) => (
                    <Box key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                      <span className="text-xs text-gray-600">{(tx as OutgoingTx).date}</span>
                      <span className="text-xs text-red-700 font-semibold">{formatCurrency((tx as OutgoingTx).amount, 'EUR')}</span>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Box>
          {/* Last Update */}
          {lastUpdate && (
            <Typography variant="caption" className="text-gray-400 mt-4 block text-center" suppressHydrationWarning>
              Letzte Aktualisierung: {new Date(lastUpdate).toLocaleTimeString('de-DE')}
            </Typography>
          )}
        </CardContent>
      </Card>
    </ClientOnly>
  );
}