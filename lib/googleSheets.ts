const SHEET_ID = '1gfLd8IwgattNDYrluU4GmitZk_IuXcn6OQqRn0hLpjM';

function getSheetUrl(sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

export async function fetchUsers() {
  const res = await fetch(getSheetUrl('Users'), { cache: 'no-store' });
  const csv = await res.text();
  return parseCSV(csv);
}

export async function fetchOrders() {
  const res = await fetch(getSheetUrl('Orders'), { cache: 'no-store' });
  const csv = await res.text();
  return parseCSV(csv);
}

export async function fetchCourseVideos() {
  const res = await fetch(getSheetUrl('Courses'), { cache: 'no-store' });
  const csv = await res.text();
  return parseCSV(csv);
}

interface OrderPayload {
  name: string;
  email: string;
  phone: string;
  paymentMethod: string;
  courses: { id: string; title: string; price: number }[];
  total: number;
  timestamp: string;
}

function generateOrderId(): string {
  return `WP${Date.now()}`;
}

function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    bank_transfer: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo',
    vnpay: 'VNPay',
  };
  return map[method] || method;
}

function formatTimestamp(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export async function submitOrder(order: OrderPayload): Promise<boolean> {
  const orderId = generateOrderId();
  const courseNames = order.courses.map(c => c.title).join(', ');
  const courseIds = order.courses.map(c => c.id).join(', ');

  const rowData = [
    formatTimestamp(order.timestamp),
    orderId,
    order.name,
    order.email,
    order.phone,
    courseNames,
    courseIds,
    order.total.toString(),
    formatPaymentMethod(order.paymentMethod),
    'Đang chờ xử lý',
    '',
  ];

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowData, orderId }),
    });

    if (!res.ok) {
      throw new Error(`Order API returned ${res.status}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to submit order:', error);
    throw error;
  }
}

export { generateOrderId, formatPaymentMethod, formatTimestamp };
export type { OrderPayload };
