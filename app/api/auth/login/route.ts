import { NextResponse } from 'next/server';
import { getScriptUrl, getSheetCsvUrl } from '@/lib/config';
import { verifyPassword, isBcryptHash, hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

const SHEET_NAME = 'Users';
const FETCH_TIMEOUT_MS = 15_000; // 15 seconds (Google Apps Script can be slow on cold start)

// Demo credentials fallback when all Google services are unreachable
const DEMO_HASH = '$2a$10$placeholder'; // Will be computed at runtime
const DEMO_USERS = [
  {
    email: 'admin@wepower.vn',
    plainPassword: '123456', // only used for runtime hash comparison
    name: 'Admin WePower',
    role: 'admin',
    memberLevel: 'VIP',
    phone: '',
  },
];

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
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
    return values;
  };

  const headers = parseRow(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

function getCol(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key];
  }
  return '';
}

function isAdminRole(roleValue: string): boolean {
  const normalized = roleValue.toLowerCase().trim();
  const adminValues = ['admin', 'administrator', 'quản trị', 'quản trị viên', 'qtv'];
  return adminValues.some(v => normalized.includes(v));
}

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
}

async function migratePasswordIfNeeded(email: string, storedPassword: string, plaintext: string) {
  if (!isBcryptHash(storedPassword)) {
    try {
      const gsScriptUrl = getScriptUrl();
      const newHash = await hashPassword(plaintext);
      const params = new URLSearchParams({
        action: 'updatePassword',
        email,
        passwordHash: newHash,
      });
      await fetchWithTimeout(`${gsScriptUrl}?${params.toString()}`, { redirect: 'follow', cache: 'no-store' });
    } catch (e) {
      console.error('[Migration] Failed to update password hash:', e);
      // Non-blocking — don't fail login
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : '';
    const password = typeof body.password === 'string' ? body.password.slice(0, 128) : '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email và mật khẩu không được để trống' },
        { status: 400 }
      );
    }

    // Method 1: Google Apps Script via GET — only send email, verify password locally
    try {
      const gsScriptUrl = getScriptUrl();
      const params = new URLSearchParams({ action: 'login', email });
      const scriptUrl = `${gsScriptUrl}?${params.toString()}`;
      const res = await fetchWithTimeout(scriptUrl, {
        redirect: 'follow',
        cache: 'no-store',
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('[Login] Apps Script returned non-JSON:', text.slice(0, 200));
        throw new Error('Invalid response from Apps Script');
      }

      if (data.success && data.user) {
        const user = data.user;
        const storedPassword = user.passwordHash || '';

        // Verify password locally using bcrypt (or plaintext migration)
        const isValid = await verifyPassword(password, storedPassword);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: 'Email hoặc mật khẩu không đúng' },
            { status: 401 }
          );
        }

        // Migrate plaintext password to bcrypt on-the-fly
        await migratePasswordIfNeeded(email, storedPassword, password);

        const role = isAdminRole(user.role || '') ? 'admin' : 'user';
        const memberLevel = user.memberLevel || user.level || 'Free';

        // Set JWT session
        await createSession({ email: user.email, role, name: user.name || '', level: memberLevel });

        return NextResponse.json({
          success: true,
          user: {
            name: user.name || '',
            email: user.email,
            phone: user.phone || '',
            role,
            memberLevel: (['Free', 'Premium', 'VIP'].includes(memberLevel) ? memberLevel : 'Free'),
          },
        });
      }

      if (data.error) {
        return NextResponse.json(
          { success: false, error: data.error },
          { status: 401 }
        );
      }

      throw new Error('Apps Script returned unsuccessful without error');
    } catch (err) {
      console.error('[Login] Apps Script error:', err instanceof Error ? err.message : err);
    }

    // Method 2: Read CSV from Google Sheets
    try {
      const csvUrl = getSheetCsvUrl(SHEET_NAME);
      const csvRes = await fetchWithTimeout(csvUrl, { cache: 'no-store' });
      if (!csvRes.ok) {
        throw new Error(`CSV fetch failed with status ${csvRes.status}`);
      }
      const csv = await csvRes.text();
      const users = parseCSV(csv);

      const user = users.find(
        u => getCol(u, 'Email', 'email').toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Email hoặc mật khẩu không đúng' },
          { status: 401 }
        );
      }

      const storedPassword = getCol(user, 'Password', 'Mật khẩu');
      const isValid = await verifyPassword(password, storedPassword);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Email hoặc mật khẩu không đúng' },
          { status: 401 }
        );
      }

      // Migrate plaintext password to bcrypt on-the-fly
      await migratePasswordIfNeeded(email, storedPassword, password);

      const roleValue = getCol(user, 'Role', 'Vai trò');
      const memberLevel = getCol(user, 'Level', 'Hạng thành viên', 'MemberLevel');
      const role = isAdminRole(roleValue) ? 'admin' : 'user';
      const userName = getCol(user, 'Tên', 'Họ và tên', 'Họ tên', 'Name');

      // Set JWT session
      await createSession({ email, role, name: userName, level: (['Free', 'Premium', 'VIP'].includes(memberLevel) ? memberLevel : 'Free') });

      return NextResponse.json({
        success: true,
        user: {
          name: userName,
          email: getCol(user, 'Email'),
          phone: getCol(user, 'Phone', 'Số điện thoại', 'SĐT'),
          role,
          memberLevel: (['Free', 'Premium', 'VIP'].includes(memberLevel) ? memberLevel : 'Free'),
        },
      });
    } catch (csvError) {
      console.error('[Login] CSV failed:', csvError instanceof Error ? csvError.message : csvError);
    }

    // Method 3: Local demo fallback when all Google services are unreachable
    console.log('[Login] All Google services failed, trying local demo fallback');
    const demoUser = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
    if (demoUser) {
      const demoHash = await hashPassword(demoUser.plainPassword);
      const isValid = await verifyPassword(password, demoHash);
      if (isValid) {
        await createSession({ email: demoUser.email, role: demoUser.role, name: demoUser.name, level: demoUser.memberLevel });
        return NextResponse.json({
          success: true,
          user: {
            name: demoUser.name,
            email: demoUser.email,
            phone: demoUser.phone,
            role: demoUser.role,
            memberLevel: demoUser.memberLevel,
          },
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Email hoặc mật khẩu không đúng' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
