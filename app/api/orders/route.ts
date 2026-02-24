import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

const SHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';
const SHEET_NAME = 'Orders';

export async function POST(request: Request) {
  try {
    const { rowData, orderId } = await request.json();

    // Method 1: Google Apps Script via GET (tránh POST redirect issues)
    if (process.env.GOOGLE_SCRIPT_URL) {
      try {
        const params = new URLSearchParams({
          action: 'appendOrder',
          rowData: JSON.stringify(rowData),
        });
        const scriptUrl = `${process.env.GOOGLE_SCRIPT_URL}?${params.toString()}`;
        const resText = execSync(`curl -sL "${scriptUrl}"`, { timeout: 15000, encoding: 'utf-8' });
        const data = JSON.parse(resText);

        if (data.success) {
          return NextResponse.json({ success: true, orderId });
        }
      } catch (err) {
        console.error('Apps Script order error:', err);
        // Fall through to other methods
      }
    }

    // Method 2: Google Sheets API
    if (process.env.GOOGLE_SHEETS_API_KEY) {
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${process.env.GOOGLE_SHEETS_API_KEY}`;

      const res = await fetch(appendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [rowData] }),
      });

      if (res.ok) {
        return NextResponse.json({ success: true, orderId });
      }
    }

    // Demo mode fallback
    console.log(`[Demo Mode] Order ${orderId}:`, rowData);
    return NextResponse.json({
      success: true,
      orderId,
      mode: 'demo',
      message: 'Order logged. Set GOOGLE_SCRIPT_URL env var to enable Google Sheets integration.',
    });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
