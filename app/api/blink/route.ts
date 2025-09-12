import { NextRequest, NextResponse } from 'next/server';
import { request } from 'graphql-request';

const ENDPOINT = 'https://api.blink.sv/graphql';

// GraphQL Queries für Blink API
const SALDO_QUERY = `
  query {
    me {
      defaultAccount {
        wallets {
          id
          walletCurrency
          balance
        }
      }
    }
  }
`;

const TRANSACTIONS_QUERY = `
  query($first: Int!, $after: String) {
    me {
      defaultAccount {
        transactions(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              direction
              status
              settlementAmount
              settlementCurrency
              createdAt
              memo
              initiationVia {
                ... on InitiationViaIntraLedger {
                  counterPartyUsername
                }
                ... on InitiationViaLn {
                  paymentHash
                }
                ... on InitiationViaOnChain {
                  address
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { queryType, variables } = body;

    // Prüfe ob BLINK_TOKEN gesetzt ist
    const blinkToken = process.env.BLINK_TOKEN;
    if (!blinkToken) {
      return NextResponse.json(
        { error: 'BLINK_TOKEN nicht konfiguriert' }, 
        { status: 500 }
      );
    }

    let query: string;
    let queryVariables = {};

    switch (queryType) {
      case 'balance':
        query = SALDO_QUERY;
        break;
      case 'transactions':
        query = TRANSACTIONS_QUERY;
        queryVariables = variables || { first: 100 };
        break;
      default:
        return NextResponse.json(
          { error: 'Unbekannter queryType' }, 
          { status: 400 }
        );
    }

    // GraphQL Request an Blink API
    const data = await request(
      ENDPOINT,
      query,
      queryVariables,
      {
        'X-API-KEY': blinkToken,
        'Content-Type': 'application/json',
      }
    );

    // Cache Headers für Performance
    const response = NextResponse.json(data, { status: 200 });
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    
    return response;

  } catch (error) {
    console.error('Blink API Error:', error);
    
    if (error instanceof Error) {
      // GraphQL oder Network Error
      return NextResponse.json(
        { 
          error: 'Blink API Fehler',
          details: error.message,
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Unbekannter Fehler bei Blink API' }, 
      { status: 500 }
    );
  }
}

// GET Endpoint für Health Check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'Blink API Proxy',
    timestamp: new Date().toISOString(),
    hasToken: !!process.env.BLINK_TOKEN
  });
}