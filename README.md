# PayMetrics – Lightning-powered Coffee Dashboard ☕⚡

Ein modernes Dashboard für Kaffeeverkäufe und Lightning-Zahlungen, optimiert für Cafés, Händler und Bitcoin-Enthusiasten.

---

## Features

- **Live Saldo & BTC-Preis**: Zeigt den aktuellen Euro-Saldo, Satoshi-Bestand und den aktuellen Bitcoin-Kurs.
- **Kaffee-Analyse**: Intelligente Zählung verkaufter Kaffees, Durchschnittspreis pro Kaffee, Umsatz- und Ausgabenstatistiken.
- **Tägliche Kaffee-Eingänge**: Übersichtliche Charts und Statistiken zu Einnahmen, Kaffees und Sats pro Tag.
- **Ausgaben-Tracking**: Detaillierte Liste aller Ausgaben-Transaktionen, filterbar nach Zeitraum.
- **Dynamische Zeiträume**: Flexible Auswahl von Zeiträumen (aktueller Monat, benutzerdefiniert, all-time).
- **Responsive & Modern UI**: Optimiert für große Bildschirme, mit professionellem, kontrastreichem Design.
- **Lightning-Integration**: Direkte Anbindung an die Blink API für Transaktionen und Preisabfrage.

---

## Tech Stack

- **Next.js (App Router)**
- **React (mit Zustand für State Management)**
- **Material-UI (MUI) & Tailwind CSS**
- **TypeScript**
- **Recharts (Charts & Visualisierung)**
- **Blink API (Lightning Payments)**

---

## Getting Started

1. **Repository klonen**

   ```bash
   git clone <repo-url>
   cd paymetrics
   ```

2. **Abhängigkeiten installieren**

   ```bash
   npm install
   # oder
   yarn
   ```

3. **Entwicklungsserver starten**

   ```bash
   npm run dev
   # oder
   yarn dev
   ```

4. **Dashboard öffnen**

   [http://localhost:3000](http://localhost:3000)

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Projektstruktur

- `app/` – Next.js App Router, Seiten & Layouts
- `components/` – UI-Komponenten (SaldoCard, CoffeeAnalysisCard, DailyChart, ...)
- `store/` – Zustand Store (State Management)
- `lib/` – Hilfsfunktionen & Utilities
- `public/` – Statische Assets (SVGs, Icons)

---

## Konfiguration & Anpassung

- **Lightning API**: Die Anbindung erfolgt über die Blink API (`/api/blink`). Für produktive Nutzung ggf. API-Keys und Endpunkte anpassen.
- **Kaffee-Preis**: Standardwert ist 0,30 €. Anpassbar in der State-Logik (`store/useStore.ts`).
- **Design**: Farben, Schriftgrößen und Layouts sind mit Tailwind und MUI einfach anpassbar.

---

## Deployment

Empfohlen wird das Hosting auf [Vercel](https://vercel.com/) oder jedem Node.js-fähigen Server.

```bash
npm run build
npm start
```

---

## Weiterentwicklung & Support

- **Issues & Feature Requests**: Bitte im GitHub-Repo melden.
- **Mitmachen**: Pull Requests sind willkommen!
- **Kontakt**: Für Support oder Fragen: [GitHub Issues](https://github.com/DEIN-REPO)

---

## Lizenz

MIT License – free for personal & commercial use.

---

## Go-Live / Deployment

### Produktiv-Deployment (z.B. Vercel, eigener Server)

1. **Build für Produktion erstellen**
   ```bash
   npm run build
   npm start
   ```
   (oder auf Vercel: einfaches Pushen auf das GitHub-Repo genügt)

2. **Domain verbinden**
   - Bei Vercel: Im Vercel Dashboard unter "Domains" die eigene Domain hinzufügen und auf das Projekt routen.
   - Eigener Server: Domain beim Hoster auf die Server-IP zeigen lassen.

3. **SSL aktivieren**
   - Vercel: SSL wird automatisch per Let's Encrypt eingerichtet.
   - Eigener Server: SSL-Zertifikat z.B. mit [Let's Encrypt](https://letsencrypt.org/) einrichten (z.B. via [Certbot](https://certbot.eff.org/)).

**Hinweis:** Für produktive Lightning-Integration ggf. API-Keys und Endpunkte anpassen (siehe Abschnitt "Konfiguration & Anpassung").
