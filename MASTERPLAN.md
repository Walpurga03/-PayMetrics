
# ☕️ Masterplan: Professionelles Kaffee-Bezahlungs-Dashboard mit Lightning & Blink

> **Stand:** September 2025

Vielen Dank für deine Anfrage! Hier findest du einen strukturierten Fahrplan für dein Lightning-basiertes Kaffee-Zahlungssystem mit modernem Web-Dashboard. Der Plan berücksichtigt aktuelle Technologien, Trends und Best Practices für 2025.

---

## 1. Überblick & Ziele

#### Projektbeschreibung

- Erweiterung des Lightning-Zahlungssystems um ein professionelles Web-Dashboard
- Visualisierung von Wallet-Daten: Saldo (Sats/BTC/EUR), Transaktionshistorie
- Interaktive Grafiken: Balances, tägliche Eingänge, Profit/Verlust in Euro
- Automatische BTC/EUR-Konvertierung via CoinGecko
- Multi-User-Management (optional erweiterbar)

#### Kernziele

- **Funktionalität:** Echtzeit-Visualisierungen, Exportoptionen (CSV, PDF), Automatisierungen
- **Sicherheit & Performance:** Server-side API-Calls, API-Keys schützen, Edge-Cache für schnelle Ladezeiten (<50ms global)
- **Skalierbarkeit:** Erweiterbar für Mobile-Apps, Wallet-Management
- **UX/UI:** Responsiv, Dark-Mode, interaktive Tooltips, mobilfreundlich

#### Erwartete Outcomes

- Deploybares, responsives Dashboard
- Transaktionsaggregierung (z.B. 50+ Käufe täglich)
- Profitberechnung in Euro
- Nutzungsstatistiken & Alerts (z.B. bei niedrigem Saldo)

#### KPIs

| KPI                        | Zielwert           |
|----------------------------|--------------------|
| Ladezeit                   | < 2s               |
| API-Call-Effizienz         | > 95%              |
| Genauigkeit Profit-Berechnung | ±0.01€           |

---

## 2. Voraussetzungen

#### Technisches Setup

- Node.js 20+ (Next.js 15)
- GitHub & Vercel-Account (kostenfrei für Prototyp)
- Blink-Entwickler-Account (authentifiziert, Read-Only aktiv)
- Kenntnisse in React & TypeScript (2-3h Tutorials)

**Datenquellen:**

- **Blink API** (GraphQL, Auth via Bearer-Token)
- **CoinGecko API** (Preise, <50 Calls/Min)
- **Mempool.space** (optional für Validierung)

#### Tools & Bibliotheken (npm Free-Tier)

| Zweck        | Tool/Bibliothek         |
|--------------|------------------------|
| Framework    | Next.js (App Router)   |
| State        | Zustand                |
| Charts       | Recharts               |
| HTTP         | Axios                  |
| UI           | Tailwind CSS, Material-UI |

#### Kosten

- Initial: 0€
- Skalierung: Vercel Pro (~20€/Monat)

---

## 3. Architektur

### Gesamtüberblick
- Full-Stack: Next.js für Frontend + Serverless Backend (Vercel Functions)
- Daten:
  - Proxy-API für Blink & CoinGecko, geschützte Keys
  - Caching via Vercel (z.B. 5 Minuten für Preise/Transaktionen)
- Datenfluss:
  1. Nutzer lädt Dashboard → Next.js Server-Side
  2. Proxy fasst API-Calls zusammen, berechnet Euro-Werte
  3. Client rendert mit Recharts, Polling alle 30s (oder Webhooks)
- Sicherheit:
  - API-Keys in Environment Variablen
  - HTTPS & Rate-Limiting (Vercel)
- Performance:
  - Edge Runtime
  - Incremental Static Regeneration (ISR) für UI-Teile

---

## 4. Schritt-für-Schritt-Umsetzungsplan

### Phase 1: Setup & Grundlage (2-3 Std)

- Repo initieren: `git init kaffee-dashboard`
- Next.js Projekt aufsetzen:

npx create-next-app@15 . --typescript --tailwind --app

- Dependencies installieren:
npm i recharts axios zustand @mui/material @emotion/react @emotion/styled

- Tailwind konfigurieren (`tailwind.config.js`) mit Dark-Mode
- Basis-Dashboard-Seite (`app/dashboard/page.tsx`):

```tsx
'use server'; // Serverseitige Komponente
import { SaldoCard } from '@/components/SaldoCard';
import { DailyChart } from '@/components/DailyChart';

export default async function Dashboard() {
// Daten vom Proxy holen
const data = await fetch('http://localhost:3000/api/blink', {
  method: 'POST',
  body: JSON.stringify({ queryType: 'saldo' }),
}).then(r => r.json());

return (
  <div className="dark:bg-gray-900 min-h-screen p-4">
    <h1 className="text-2xl font-bold mb-4">Kaffee Dashboard</h1>
    <SaldoCard saldo={data.balance} />
    <DailyChart data={data.transactions} />
  </div>
);
}

Test: npm run dev → localhost:3000/dashboard öffnen.


Phase 2: API-Proxies & Datenintegration (4-6 Std)
API-Proxy in app/api/blink/route.ts:

import { NextRequest, NextResponse } from 'next/server';
import { request } from 'graphql-request';

const ENDPOINT = 'https://api.blink.sv/graphql';

const SALDO_QUERY = `
  query { me { defaultAccount { wallets { balance } } } }
`;
const TX_QUERY = `
  query { me { defaultAccount { wallets { transactions(first: 100) { edges { node { amount, direction, createdAt } } } } } } }
`;

export async function POST(req: NextRequest) {
  const { queryType } = await req.json();
  const query = queryType === 'saldo' ? SALDO_QUERY : TX_QUERY;
  try {
    const data = await request(ENDPOINT, query, {}, {
      Authorization: `Bearer ${process.env.BLINK_TOKEN}`,
    });
    return NextResponse.json(data, { headers: { 'Cache-Control': 's-maxage=300' } });
  } catch (err) {
    return NextResponse.json({ error: 'API Fehler' }, { status: 500 });
  }
}

.env.local:

BLINK_TOKEN=dein_token

Preis-API ähnlich in app/api/price/route.ts:

// Holt BTC/EUR Preise von CoinGecko

Datenaggregation in lib/utils.ts:


import { groupBy } from 'lodash';

export function aggregateDaily(transactions, eurPrice) {
  const grouped = groupBy(transactions.filter(tx => tx.direction === 'RECEIVE'), tx => new Date(tx.createdAt).toDateString());
  return Object.entries(grouped).map(([date, txs]) => ({
    date,
    euros: txs.reduce((sum, tx) => sum + (tx.amount / 1e8) * eurPrice, 0),
    profit: txs.length > 0 ? 'positive' : 'neutral'
  }));
}

Funktionstest: API-Calls per Postman oder curl.


Phase 3: UI & Visualisierung (4-6 Std)
Komponenten components/SaldoCard.tsx:

import { Card, CardContent, Typography } from '@mui/material';
import { useStore } from '@/store/useStore';

export const SaldoCard = () => {
  const { saldoEur } = useStore();
  return (
    <Card className="mb-4">
      <CardContent>
        <Typography variant="h4">Saldo: {saldoEur?.toFixed(2)} €</Typography>
      </CardContent>
    </Card>
  );
};

Chart-Komponente components/DailyChart.tsx:

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const DailyChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip formatter={(value) => [`${value.toFixed(2)} €`, 'Eingänge']} />
      <Bar dataKey="euros" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
);

Zustand store/useStore.ts:

import { create } from 'zustand';

export const useStore = create((set) => ({
  saldoEur: 0,
  dailyData: [],
  fetchData: async () => {
    const [blinkRes, priceRes] = await Promise.all([fetch('/api/blink'), fetch('/api/price')]);
    const { data: blink } = await blinkRes.json();
    const { bitcoin: { eur } } = await priceRes.json();
    set({ saldoEur: (blink.balance / 1e8) * eur, dailyData: aggregateDaily(blink.transactions, eur) });
  },
}));

In app/dashboard/page.tsx:

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function Dashboard() {
  const { fetchData } = useStore();

  useEffect(() => {
    fetchData();
  }, []);

  // Return UI mit Komponenten
}

Phase 4: Deployment & Monitoring (2-3 Std)
GitHub-Repo mit Vercel verbinden.
Env-Variablen setzen.
Tests:
Unit-Tests (Jest) für Aggregation & API
E2E-Tests mit Playwright
Vercel Analytics aktivieren.
Live testen; Feedback sammeln.

5. Erweiterungen & fortgeschrittene Features (optional, 5+ Std)
Auth & Multi-User: NextAuth.js, personalisierte Tokens.
Reaktivität & WebSockets: Pusher, Server-Sent Events oder Vercel Webhooks.
Automatische Alerts: Per E-Mail (Resend) bei Saldo-Engpässen.
Export: PDFs (jsPDF), CSVs (PapaParse).
L2-Analytics: Lightning Channel-Kapazitäten via Mempool API.


6. Herausforderungen & Tipps
Potenzielle Probleme
API-Limits & Rate-Limiting → Cache aggressiv einsetzen.
Keys & Secrets: Rotation & Proxying.
Fehlerhandling: Try-Catch, Fallback-Daten.
Lightning-Skalierung: Monitoring, Sharding.
Tipps
Use Vercel Logs & Browser DevTools.
Next.js Server Actions für manuelle Refresh.
Dokumentation: Next.js Guides, Blink API Docs, Lightning Entwicklung.

7. Ressourcen & Nächste Schritte
Dokumentation: Blink Developer Guide, Next.js App Router.
Tutorials: Vercel API & Caching, Lightning Dashboards.
Nächster Schritt: Implementiere Phase 1 heute, teile Code für Feedback.
Dieses Blaupause leitet dich zu einem state-of-the-art Dashboard. Bei Fragen oder Iterationen stehe ich gern zur Verfügung!

