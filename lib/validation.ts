/**
 * Server-side input validation utilities
 */

// Max string length to prevent DoS via oversized payloads
const MAX_STRING_LENGTH = 500;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;
const MIN_PASSWORD_LENGTH = 6;

export function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, MAX_STRING_LENGTH);
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) return { valid: false, error: 'Email không được để trống' };
  if (email.length > MAX_EMAIL_LENGTH) return { valid: false, error: 'Email quá dài' };

  // RFC 5322 simplified email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) return { valid: false, error: 'Email không hợp lệ' };

  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'Mật khẩu không được để trống' };
  if (password.length < MIN_PASSWORD_LENGTH) return { valid: false, error: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự` };
  if (password.length > MAX_PASSWORD_LENGTH) return { valid: false, error: 'Mật khẩu quá dài' };
  return { valid: true };
}

export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name) return { valid: false, error: 'Tên không được để trống' };
  if (name.length < 2) return { valid: false, error: 'Tên phải có ít nhất 2 ký tự' };
  if (name.length > 100) return { valid: false, error: 'Tên quá dài' };
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone) return { valid: true }; // phone is optional
  const cleaned = phone.replace(/\s/g, '');
  if (!/^\d{10,11}$/.test(cleaned)) return { valid: false, error: 'Số điện thoại không hợp lệ' };
  return { valid: true };
}

// Sanitize data that will be written to Google Sheets to prevent formula injection
export function sanitizeForSheets(value: string): string {
  if (!value) return value;
  // Prevent formula injection: strip leading = + - @ characters
  const dangerous = /^[=+\-@\t\r]/;
  if (dangerous.test(value)) {
    return "'" + value;
  }
  return value;
}

export function validateOrderData(rowData: unknown): { valid: boolean; error?: string } {
  if (!rowData || !Array.isArray(rowData)) {
    return { valid: false, error: 'Dữ liệu đơn hàng không hợp lệ' };
  }
  if (rowData.length > 20) {
    return { valid: false, error: 'Dữ liệu đơn hàng quá lớn' };
  }
  // Validate each cell is a reasonable value
  for (const cell of rowData) {
    if (typeof cell === 'string' && cell.length > 1000) {
      return { valid: false, error: 'Giá trị trong đơn hàng quá dài' };
    }
  }
  return { valid: true };
}
