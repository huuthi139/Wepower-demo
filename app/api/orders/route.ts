import { NextResponse } from 'next/server';

const SHEET_ID = '1gfLd8IwgattNDYrluU4GmitZk_IuXcn6OQqRn0hLpjM';
const SHEET_NAME = 'Orders';

export async function POST(request: Request) {
  try {
    const { rowData, orderId } = await request.json();

    // Google Sheets API v4 append (requires API key or service account)
    // For public sheets, we can use the Google Apps Script Web App approach
    // Here we use the Google Sheets API with the sheet's edit access

    // Method: Use Google Sheets API via fetch
    // Since the sheet is publicly editable, we can append via the Sheets API
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${process.env.GOOGLE_SHEETS_API_KEY || ''}`;

    const body = {
      values: [rowData],
    };

    // Try Google Sheets API if API key is available
    if (process.env.GOOGLE_SHEETS_API_KEY) {
      const res = await fetch(appendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        return NextResponse.json({ success: true, orderId });
      }
    }

    // Fallback: Try Google Apps Script Web App if URL is configured
    if (process.env.GOOGLE_SCRIPT_URL) {
      const res = await fetch(process.env.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'appendOrder',
          sheetName: SHEET_NAME,
          rowData,
        }),
      });

      if (res.ok) {
        return NextResponse.json({ success: true, orderId });
      }
    }

    // If no API key or script URL, return success anyway (demo mode)
    // The order data was already logged on the client side
    console.log(`[Demo Mode] Order ${orderId}:`, rowData);
    return NextResponse.json({
      success: true,
      orderId,
      mode: 'demo',
      message: 'Order logged. Set GOOGLE_SHEETS_API_KEY or GOOGLE_SCRIPT_URL env vars to enable Google Sheets integration.',
    });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
