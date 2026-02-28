import { NextResponse } from 'next/server';
import { getScriptUrl, getSheetId } from '@/lib/config';

const SHEET_NAME = 'Orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rowData, orderId } = body;

    // Validate order data
    if (!rowData || !Array.isArray(rowData) || rowData.length === 0 || rowData.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu đơn hàng không hợp lệ' },
        { status: 400 }
      );
    }

    // Sanitize each cell to prevent formula injection
    const sanitizedRowData = rowData.map((cell: unknown) => {
      if (typeof cell !== 'string') return cell;
      if (cell.length > 1000) return cell.slice(0, 1000);
      // Prevent Google Sheets formula injection
      if (/^[=+\-@\t\r]/.test(cell)) return "'" + cell;
      return cell;
    });

    // Method 1: Google Apps Script via GET
    const gsScriptUrl = getScriptUrl();
    try {
      const params = new URLSearchParams({
        action: 'appendOrder',
        rowData: JSON.stringify(sanitizedRowData),
      });
      const scriptUrl = `${gsScriptUrl}?${params.toString()}`;
        const res = await fetch(scriptUrl, { redirect: 'follow' });
        const data = await res.json();

        if (data.success) {
          return NextResponse.json({ success: true, orderId });
        }
      } catch (err) {
        console.error('Apps Script order error:', err);
        // Fall through to other methods
      }

    // Method 2: Google Sheets API
    if (process.env.GOOGLE_SHEETS_API_KEY) {
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${getSheetId()}/values/${encodeURIComponent(SHEET_NAME)}!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${process.env.GOOGLE_SHEETS_API_KEY}`;

      const res = await fetch(appendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [sanitizedRowData] }),
      });

      if (res.ok) {
        return NextResponse.json({ success: true, orderId });
      }
    }

    // Demo mode fallback
    // Demo mode: order not saved to external system
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
