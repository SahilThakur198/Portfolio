#!/usr/bin/env node
/**
 * fetch-sheet.js
 * 
 * Fetches project data from a published Google Sheet (CSV format)
 * and writes it to data/projects.json.
 * 
 * SETUP:
 * 1. Create a Google Sheet with these columns (in order):
 *    Name | Category | Description | Technologies | LiveURL | RepoURL | ImageURL | Features
 * 
 * 2. Publish it: File → Share → Publish to web → Select "Sheet1" → Format: CSV → Publish
 * 
 * 3. Copy the published URL and set it below or as environment variable:
 *    GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/XXXXX/pub?output=csv
 * 
 * USAGE:
 *   node build/fetch-sheet.js
 *   
 *   Or with a custom URL:
 *   GOOGLE_SHEET_CSV_URL="https://..." node build/fetch-sheet.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ─── Configuration ───────────────────────────────────────────────────────────
// Replace this with your actual published Google Sheet CSV URL
const SHEET_URL = process.env.GOOGLE_SHEET_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHWnB_BdHmaVRJFF4AVnEVhn5UW_SWRZH_g60vZAr7mlPi9EvfKwfQO1QtRXX6UOoKMNwcz6uh1gYx/pub?gid=0&single=true&output=csv';

const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'projects.json');

// ─── CSV Parser (lightweight, no dependencies) ───────────────────────────────
function parseCSV(text) {
  const lines = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      if (!lines.length || lines[lines.length - 1] === null) {
        lines.push([current]);
      } else {
        lines[lines.length - 1].push(current);
      }
      current = '';
    } else if ((char === '\n' || (char === '\r' && next === '\n')) && !inQuotes) {
      if (lines.length && lines[lines.length - 1] !== null) {
        lines[lines.length - 1].push(current);
      } else {
        lines.push([current]);
      }
      current = '';
      lines.push(null); // marker for new row
      if (char === '\r') i++; // skip \n in \r\n
    } else {
      current += char;
    }
  }

  // Handle last field
  if (current || (lines.length && lines[lines.length - 1] !== null)) {
    if (lines.length && lines[lines.length - 1] !== null) {
      lines[lines.length - 1].push(current);
    } else {
      lines.push([current]);
    }
  }

  return lines.filter(l => l !== null && l.some(cell => cell.trim()));
}

// ─── HTTP Fetch with redirect support ─────────────────────────────────────────
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, { headers: { 'User-Agent': 'PortfolioBuildScript/1.0' } }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchURL(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: Failed to fetch sheet`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!SHEET_URL) {
    console.log('⚠️  No GOOGLE_SHEET_CSV_URL set.');
    console.log('   Set the URL in this script or as an environment variable.');
    console.log('   Keeping existing data/projects.json unchanged.');
    process.exit(0);
  }

  console.log('📥 Fetching Google Sheet CSV...');

  try {
    const csvText = await fetchURL(SHEET_URL);
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      console.log('⚠️  Sheet appears empty (no data rows). Keeping existing file.');
      process.exit(0);
    }

    // First row is headers
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const dataRows = rows.slice(1);

    console.log(`📊 Found ${dataRows.length} project(s) in sheet.`);

    // Extract valid Resume URL from first non-empty row if present
    const cleanResumeUrl = (url) => {
      if (!url) return '';
      // Simple validation or cleanup if needed
      return url.trim();
    };

    let resumeUrl = '';
    // Look for resumeUrl in any row, take first one found
    for (const row of dataRows) {
      const urlidx = headers.indexOf('resumeurl');
      if (urlidx >= 0 && row[urlidx] && row[urlidx].trim()) {
        resumeUrl = cleanResumeUrl(row[urlidx]);
        break;
      }
    }

    const projects = dataRows.map((row, index) => {
      const get = (colName) => {
        const idx = headers.indexOf(colName.toLowerCase());
        return idx >= 0 && idx < row.length ? row[idx].trim() : '';
      };

      const name = get('name');
      if (!name) return null; // Skip empty rows

      return {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        name: name,
        category: get('category') || 'Other',
        description: get('description') || '',
        technologies: (get('technologies') || '').split(',').map(t => t.trim()).filter(Boolean),
        liveUrl: get('liveurl') || '',
        repoUrl: get('repourl') || '',
        imageUrl: get('imageurl') || '',
        features: (get('features') || '').split(',').map(f => f.trim()).filter(Boolean)
      };
    }).filter(Boolean);

    // Resume URL is global
    const output = {
      resumeUrl: resumeUrl,
      projects
    };


    // Ensure output directory exists
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`✅ Written ${projects.length} project(s) to ${OUTPUT_PATH}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
