import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

type JewelryRecord = {
  jo_number: string;
  item_name?: string;
  classification: string;
  jewelry_components: Record<string, string[]>;
};

type JewelryDBRow = {
  jo_number: string;
  item_name?: string;
  classification: string;
  jewelry_components: Record<string, string[]>;
};

async function main() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheetTabs = spreadsheet.data.sheets || [];

  const records: Record<string, JewelryRecord> = {};

  for (const sheet of sheetTabs) {
    const classification = sheet.properties?.title;
    if (!classification) continue;

    console.log(`\nProcessing tab: ${classification}`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: classification,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) continue;

    const headers = rows[0];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const jo_number = row[0];

      if (!jo_number) continue;

      if (!records[jo_number]) {
        records[jo_number] = {
          jo_number,
          classification,
          item_name: row[1],
          jewelry_components: {},
        };
      }

      const record = records[jo_number];

      // Fill item_name if missing
      if (!record.item_name && row[1]) {
        record.item_name = row[1];
      }

      // Process component columns
      for (let col = 2; col < headers.length; col++) {
        const columnName = headers[col];
        const value = row[col];

        if (!columnName || !value) continue;

        if (!record.jewelry_components[columnName]) {
          record.jewelry_components[columnName] = [];
        }

        record.jewelry_components[columnName].push(value);
      }
    }
  }

  /**
   * ============================
   * FULL UPSERT
   * ============================
   */

  const allRecords = Object.values(records);

  console.log(`Upserting ${allRecords.length} records...`);

  let successCount = 0;

  for (const record of allRecords) {
    const dbRow: JewelryDBRow = {
      jo_number: record.jo_number,
      item_name: record.item_name,
      classification: record.classification,
      jewelry_components: record.jewelry_components,
    };

    const { error } = await supabase
      .from('jewelry_archive')
      .upsert(dbRow, { onConflict: 'jo_number' });

    if (error) {
      console.error(`❌ Failed upserting ${record.jo_number}`, error);
    } else {
      successCount++;
    }
  }

  console.log(
    `Migration complete. ${successCount}/${allRecords.length} records upserted.`
  );
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
