import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

async function main() {
  console.log('Starting migration script...');

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Get spreadsheet metadata (tabs / classifications)
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheetTabs = spreadsheet.data.sheets || [];

  console.log(
    'Found sheets:',
    sheetTabs.map((s) => s.properties?.title)
  );

  for (const sheet of sheetTabs) {
    const title = sheet.properties?.title;
    if (!title) continue;

    console.log(`\nReading tab: ${title}`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: title,
    });

    const rows = response.data.values || [];

    console.log(`Rows found: ${rows.length}`);
    console.log('First 3 rows:');
    console.log(rows.slice(0, 3));
  }

  console.log('\nFinished reading spreadsheet.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
