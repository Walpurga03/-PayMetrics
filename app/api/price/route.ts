import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

interface CoinGeckoPrice {
  bitcoin: {
    eur: number;
    usd: number;
    last_updated_at: number;
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get('currency') || 'eur';
    
    // CoinGecko API Call
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=${currency}&include_last_updated_at=true`,
      {
        headers: {
          'Accept': 'application/json',
          // Optional: CoinGecko API Key für höhere Rate Limits
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        },
        // Cache für 5 Minuten
        next: { revalidate: 300 }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API Error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoPrice = await response.json();

    // Validiere Response
    if (!data.bitcoin || !data.bitcoin[currency as keyof typeof data.bitcoin]) {
      throw new Error(`Preis für ${currency} nicht verfügbar`);
    }

    // Strukturierte Response
    const result = {
      currency: currency.toUpperCase(),
      price: data.bitcoin[currency as keyof typeof data.bitcoin],
      lastUpdated: new Date(data.bitcoin.last_updated_at * 1000).toISOString(),
      timestamp: new Date().toISOString(),
      source: 'CoinGecko'
    };

    // Cache Headers
    const nextResponse = NextResponse.json(result);
    nextResponse.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    
    return nextResponse;

  } catch (error) {
    console.error('CoinGecko API Error:', error);
    
    // Fallback Preis für Entwicklung (ungefähr aktueller BTC/EUR Kurs)
    const fallbackPrice = {
      currency: 'EUR',
      price: 52000, // Ungefährer Fallback-Wert
      lastUpdated: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      source: 'Fallback',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    };

    return NextResponse.json(fallbackPrice, { 
      status: error instanceof Error ? 500 : 503,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  }
}

// POST Endpoint für mehrere Währungen
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currencies = ['eur', 'usd'] } = body;

    const currencyString = currencies.join(',');
    
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=${currencyString}&include_last_updated_at=true`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API Error: ${response.status}`);
    }

    const data: CoinGeckoPrice = await response.json();

    const result = {
      prices: data.bitcoin,
      lastUpdated: new Date(data.bitcoin.last_updated_at * 1000).toISOString(),
      timestamp: new Date().toISOString(),
      source: 'CoinGecko'
    };

    const nextResponse = NextResponse.json(result);
    nextResponse.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    
    return nextResponse;

  } catch (error) {
    console.error('CoinGecko Multi-Currency Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der Preise',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      }, 
      { status: 500 }
    );
  }
}