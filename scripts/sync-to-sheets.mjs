/**
 * ============================================================
 *  Das Rose Garden — Supabase → Google Sheets Daily Sync
 * ============================================================
 *
 *  Fetches all rows from every public table in Supabase and
 *  writes them to matching tabs inside a Google Sheet.
 *
 *  Environment variables required:
 *    SUPABASE_URL
 *    SUPABASE_SERVICE_ROLE_KEY
 *    GOOGLE_SHEETS_ID
 *    GOOGLE_SERVICE_ACCOUNT_JSON   (stringified JSON key)
 */

import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

// ── Config ──────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const SA_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!SUPABASE_URL || !SUPABASE_KEY || !SHEETS_ID || !SA_JSON) {
    console.error(
        "❌  Missing one or more required env vars:\n" +
        "   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_JSON"
    );
    process.exit(1);
}

// Tables to export — one tab per table
const TABLES = [
    "products",
    "profiles",
    "orders",
    "cart_items",
    "hero_banners",
    "home_sections",
];

// ── Supabase client (service-role bypasses RLS) ─────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Google Sheets client ────────────────────────────────────
const credentials = JSON.parse(SA_JSON);
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

// ── Helpers ─────────────────────────────────────────────────

/**
 * Serialise a value for the spreadsheet.
 * Objects / arrays become JSON strings; everything else stays as-is.
 */
function serialise(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return value;
}

/**
 * Make sure a tab (sheet) with the given title exists.
 * If it doesn't, create it.
 */
async function ensureTab(spreadsheetId, title) {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const existing = meta.data.sheets.map((s) => s.properties.title);

    if (!existing.includes(title)) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{ addSheet: { properties: { title } } }],
            },
        });
        console.log(`   📄  Created new tab: "${title}"`);
    }
}

/**
 * Clear a tab and write fresh data.
 */
async function writeTab(spreadsheetId, title, headers, rows) {
    // Clear everything in the tab first
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${title}!A:ZZ`,
    });

    const values = [headers, ...rows.map((row) => headers.map((h) => serialise(row[h])))];

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${title}!A1`,
        valueInputOption: "RAW",
        requestBody: { values },
    });
}

// ── Main ────────────────────────────────────────────────────
async function main() {
    console.log("🌹  Das Rose Garden — Supabase → Google Sheets Sync");
    console.log(`   Sheet ID: ${SHEETS_ID}\n`);

    for (const table of TABLES) {
        process.stdout.write(`   ⏳  ${table} ... `);

        // 1. Fetch all rows from Supabase
        const { data, error } = await supabase.from(table).select("*");

        if (error) {
            console.log(`❌  Error: ${error.message}`);
            continue;
        }

        if (!data || data.length === 0) {
            // Still create the tab with headers from the schema
            await ensureTab(SHEETS_ID, table);
            await sheets.spreadsheets.values.clear({
                spreadsheetId: SHEETS_ID,
                range: `${table}!A:ZZ`,
            });
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEETS_ID,
                range: `${table}!A1`,
                valueInputOption: "RAW",
                requestBody: { values: [["(no data)"]] },
            });
            console.log(`⚠️  0 rows (tab created with placeholder)`);
            continue;
        }

        // 2. Build headers from the first row's keys
        const headers = Object.keys(data[0]);

        // 3. Ensure the tab exists & write data
        await ensureTab(SHEETS_ID, table);
        await writeTab(SHEETS_ID, table, headers, data);

        console.log(`✅  ${data.length} rows synced`);
    }

    console.log("\n🎉  Sync complete!");
}

main().catch((err) => {
    console.error("💥  Fatal error:", err);
    process.exit(1);
});
