/**
 * Centralized configuration - All secrets from environment variables.
 * NEVER hardcode secrets in source code.
 */

// Google Sheet ID - MUST be set in environment variables
export function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    console.error('[Config] GOOGLE_SHEET_ID not set in environment variables');
    throw new Error('Server configuration error');
  }
  return id;
}

// Google Apps Script URL - MUST be set in environment variables
export function getScriptUrl(): string {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    console.error('[Config] GOOGLE_SCRIPT_URL not set in environment variables');
    throw new Error('Server configuration error');
  }
  return url;
}

// Google Sheets CSV export URL helper
export function getSheetCsvUrl(sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${getSheetId()}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

// Validate required env vars on startup
export function validateEnv(): void {
  const required = ['GOOGLE_SCRIPT_URL', 'GOOGLE_SHEET_ID'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[Config] Missing required environment variables: ${missing.join(', ')}`);
  }
}
