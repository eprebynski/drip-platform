#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  TEXT_SNIFF_EXTENSIONS,
  isIgnoredEvidenceName,
  parseArgs
} from './private-evidence-kit-common.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const originalGeneratorPath = path.join(__dirname, 'generate-sanitized-migration-review-packets.js');
const originalResult = spawnSync(process.execPath, [originalGeneratorPath, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

if (originalResult.error) {
  console.error(`Error: ${originalResult.error.message}`);
  process.exit(1);
}

if (originalResult.status !== 0 || parseArgs().help) {
  process.exit(originalResult.status || 0);
}

const options = parseArgs();
const ACTIVE_ROUTES_PACKET = path.join(options.root, 'review-packets', 'active-routes-review-packet.md');
const ROUTE_TABLE_HEADING = '## Retain / Rebuild / Redirect / Retire / Unknown Table';
const PRODUCTION_DEPENDENCIES_HEADING = '## Production Dependencies';
const STATIC_ASSET_EXTENSIONS = new Set([
  '.avif',
  '.css',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.js',
  '.json',
  '.map',
  '.pdf',
  '.png',
  '.svg',
  '.ttf',
  '.webmanifest',
  '.webp',
  '.woff',
  '.woff2',
  '.zip'
]);
const EXPLICIT_REBUILD_ROUTES = new Set([
  '/ad-campaigns',
  '/conference-campaign-preview',
  '/conference-campaign-submit',
  '/conference-showcase',
  '/conferences'
]);
const PREVIEW_LIMIT = 160 * 1024;
const SAFE_ROUTE_SOURCE_PATHS = [
  path.join(options.root, 'sanitized-summaries', 'active-routes-summary.md'),
  path.join(options.root, 'sanitized-summaries', 'squarespace-redirects-summary.md'),
  path.join(options.root, 'sanitized-summaries', 'google-analytics-summary.md'),
  path.join(options.root, 'sanitized-summaries', 'google-search-console-summary.md'),
  path.join(options.root, 'redaction-reports', 'redacted-copies', 'active-routes'),
  path.join(options.root, 'redaction-reports', 'redacted-copies', 'squarespace'),
  path.join(options.root, 'redaction-reports', 'redacted-copies', 'analytics-search-console')
];

function isTextFile(filePath) {
  return TEXT_SNIFF_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

function walkFiles(inputPath, files = []) {
  if (!fs.existsSync(inputPath)) {
    return files;
  }

  const stat = fs.statSync(inputPath);
  if (stat.isFile()) {
    if (isTextFile(inputPath) && !isIgnoredEvidenceName(path.basename(inputPath))) {
      files.push(inputPath);
    }
    return files;
  }

  if (!stat.isDirectory()) {
    return files;
  }

  for (const entry of fs.readdirSync(inputPath, { withFileTypes: true })) {
    if (isIgnoredEvidenceName(entry.name)) {
      continue;
    }
    const fullPath = path.join(inputPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.isFile() && isTextFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function readPreview(filePath) {
  const fileHandle = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(PREVIEW_LIMIT);
    const bytesRead = fs.readSync(fileHandle, buffer, 0, PREVIEW_LIMIT, 0);
    return buffer.subarray(0, bytesRead).toString('utf8');
  } finally {
    fs.closeSync(fileHandle);
  }
}

function normalizeRouteCandidate(candidate) {
  let route = String(candidate || '')
    .trim()
    .replace(/^[("'`]+/, '')
    .replace(/[)"'`]+$/, '')
    .split(/[?#]/)[0]
    .replace(/[.;:)]+$/, '');

  if (!route.startsWith('/')) {
    return '';
  }

  const parts = route.split(',');
  if (parts.length > 1 && parts.slice(1).every((part) => /^-?\d+(?:\.\d+)?%?$/.test(part.trim()))) {
    route = parts[0];
  }

  route = route.replace(/\/+$/, '') || '/';
  return route.includes('[REDACTED') ? '' : route;
}

function isStaticAssetRoute(route) {
  const lower = route.toLowerCase();
  if (lower.startsWith('/content/v1/')) {
    return true;
  }
  if (/\/(?:assets?|static|images?|files?|downloads?)\//.test(lower)) {
    return true;
  }
  return STATIC_ASSET_EXTENSIONS.has(path.extname(lower));
}

function shouldKeepRouteCandidate(route) {
  return route
    && route !== 'UNKNOWN'
    && !route.startsWith('/Users')
    && !route.startsWith('/Documents')
    && !route.startsWith('/private')
    && !route.includes('/private-evidence/')
    && !route.toLowerCase().endsWith('.md');
}

function addRouteCandidate(candidate, routes, assets) {
  const route = normalizeRouteCandidate(candidate);
  if (!shouldKeepRouteCandidate(route)) {
    return;
  }
  if (isStaticAssetRoute(route)) {
    assets.add(route);
  } else {
    routes.add(route);
  }
}

function mergeInventory(target, source) {
  for (const route of source.routes) {
    target.routes.add(route);
  }
  for (const asset of source.assets) {
    target.assets.add(asset);
  }
}

function classifyRoute(route) {
  const lower = route.toLowerCase();
  if (route === '/' || lower === '/home') {
    return 'RETAIN';
  }
  if (lower.includes('old') || lower.includes('legacy')) {
    return 'REDIRECT';
  }
  if (EXPLICIT_REBUILD_ROUTES.has(lower)) {
    return 'REBUILD';
  }
  if (lower === '/cart') {
    return 'RETIRE_CANDIDATE';
  }
  if (lower === '/contact') {
    return 'REBUILD';
  }
  if (/(provider|vendor|advertiser|campaign|qr|showcase|conference|media|upload|form|intake)/.test(lower)) {
    return 'REBUILD';
  }
  return 'UNKNOWN';
}

function extractRoutesFromText(text) {
  const routes = new Set();
  const assets = new Set();
  const urlRegex = /https?:\/\/[A-Za-z0-9.-]+(:\d+)?(\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]*)/g;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    addRouteCandidate(urlMatch[2] || '/', routes, assets);
  }

  const pathRegex = /(^|[\s("'`])\/[A-Za-z0-9][A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]{0,120}/g;
  let pathMatch;
  while ((pathMatch = pathRegex.exec(text)) !== null) {
    addRouteCandidate(pathMatch[0], routes, assets);
  }

  const csvRouteRegex = /(^|[\s("'`|])\/[A-Za-z0-9][A-Za-z0-9._~:/?#\[\]@!$&'()*+;=%-]{0,120},(?:-?\d+(?:\.\d+)?%?)(?:,-?\d+(?:\.\d+)?%?)*/g;
  let csvRouteMatch;
  while ((csvRouteMatch = csvRouteRegex.exec(text)) !== null) {
    addRouteCandidate(csvRouteMatch[0], routes, assets);
  }

  const csvRootRegex = /(^|[\s("'`|])\/,(?:-?\d+(?:\.\d+)?%?)(?:,-?\d+(?:\.\d+)?%?)*/g;
  let csvRootMatch;
  while ((csvRootMatch = csvRootRegex.exec(text)) !== null) {
    addRouteCandidate(csvRootMatch[0], routes, assets);
  }

  const bareRootRegex = /(^|\n)\s*\/\s*($|\n)/g;
  if (bareRootRegex.test(text)) {
    addRouteCandidate('/', routes, assets);
  }

  return { routes, assets };
}

function collectSafeRouteSources() {
  const inventory = { routes: new Set(), assets: new Set() };
  const sourceFiles = SAFE_ROUTE_SOURCE_PATHS.flatMap((sourcePath) => walkFiles(sourcePath));
  for (const sourceFile of sourceFiles) {
    mergeInventory(inventory, extractRoutesFromText(readPreview(sourceFile)));
  }
  return inventory;
}

function routeRationale(classification) {
  if (classification === 'RETAIN') {
    return 'Core public route should be retained unless manual review says otherwise.';
  }
  if (classification === 'REBUILD') {
    return 'Route appears tied to public site, campaign, conference, provider, advertiser, media, upload, form, or intake workflows that should move into the Drip stack.';
  }
  if (classification === 'REDIRECT') {
    return 'Legacy or old path should be mapped to a verified replacement before cutover.';
  }
  if (classification === 'RETIRE_CANDIDATE') {
    return 'Cart route needs commerce review before retain, rebuild, redirect, or retire decision.';
  }
  return 'Route candidate found, but migration intent is not verified.';
}

function escapeMarkdown(value) {
  return String(value || 'UNKNOWN').replace(/\|/g, '\\|');
}

function splitMarkdownRow(row) {
  const cells = [];
  let current = '';
  let escaped = false;
  for (const char of row.trim()) {
    if (char === '|' && !escaped) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
    escaped = char === '\\' && !escaped;
    if (char !== '\\') {
      escaped = false;
    }
  }
  cells.push(current.trim());
  return cells.filter((cell, index, all) => !(cell === '' && (index === 0 || index === all.length - 1)));
}

function sortRoutes(routes) {
  return [...routes].sort((left, right) => {
    if (left === '/') {
      return -1;
    }
    if (right === '/') {
      return 1;
    }
    return left.localeCompare(right);
  });
}

function routeRows(routes) {
  if (routes.size === 0) {
    return '| UNKNOWN | UNKNOWN | Specific route/path could not be safely extracted. | Active-routes export, redirect map, GA/GSC route report, or QR/campaign route inventory. |';
  }

  return sortRoutes(routes).map((route) => {
    const classification = classifyRoute(route);
    return `| ${escapeMarkdown(route)} | ${classification} | ${escapeMarkdown(routeRationale(classification))} | Manual route inventory and traffic review. |`;
  }).join('\n');
}

function assetDependencySection(assets) {
  if (assets.size === 0) {
    return '';
  }

  const rows = sortRoutes(assets).slice(0, 10).map((assetPath) => (
    `| ${escapeMarkdown(assetPath)} | ASSET_DEPENDENCY | Excluded from the primary route table; verify asset migration separately. |`
  )).join('\n');

  return `\n## Asset Dependencies Found\n\n- Static asset path count: ${assets.size}\n- Primary route classification table excludes these assets.\n\n| Asset path example | Classification | Notes |\n| --- | --- | --- |\n${rows}\n`;
}

function extractRoutesFromTable(section) {
  const routes = new Set();
  const assets = new Set();

  for (const line of section.split(/\r?\n/)) {
    if (!line.trim().startsWith('|') || /^\|\s*-+/.test(line) || line.includes('Route/path candidate')) {
      continue;
    }

    const [candidate] = splitMarkdownRow(line);
    const route = normalizeRouteCandidate(candidate);
    if (!route || route === 'UNKNOWN') {
      continue;
    }

    if (isStaticAssetRoute(route)) {
      assets.add(route);
    } else {
      routes.add(route);
    }
  }

  return { routes, assets };
}

function updateSafeFindings(packet, routeCount, assetCount) {
  const routeFinding = routeCount > 0
    ? `| ${routeCount} sanitized route/path candidate(s) were found. | REDACTED_COPY | LOW | Route candidates are review aids only and may be incomplete. |`
    : '| No specific route/path candidate was safely extracted. | UNKNOWN | UNKNOWN | Route candidates are review aids only and may be incomplete. |';
  const assetFinding = assetCount > 0
    ? `\n| ${assetCount} static asset path candidate(s) were separated from active routes. | REDACTED_COPY | LOW | Asset dependencies are not classified as rebuild routes. |`
    : '';

  return packet.replace(
    /\| (?:\d+ sanitized route\/path candidate\(s\) were found\.|No specific route\/path candidate was safely extracted\.) \| (?:REDACTED_COPY|UNKNOWN) \| (?:LOW|UNKNOWN) \| Route candidates are review aids only and may be incomplete\. \|/,
    `${routeFinding}${assetFinding}`
  );
}

function cleanActiveRoutesPacket(packetPath) {
  if (!fs.existsSync(packetPath)) {
    throw new Error(`Active routes review packet was not generated: ${packetPath}`);
  }

  const packet = fs.readFileSync(packetPath, 'utf8');
  const tableStart = packet.indexOf(ROUTE_TABLE_HEADING);
  const nextSectionStart = packet.indexOf(PRODUCTION_DEPENDENCIES_HEADING, tableStart);
  if (tableStart === -1 || nextSectionStart === -1) {
    throw new Error('Active routes review packet is missing the expected route table markers.');
  }

  const beforeTable = packet.slice(0, tableStart);
  const tableSection = packet.slice(tableStart, nextSectionStart).trimEnd();
  const afterTable = packet.slice(nextSectionStart);
  const { routes, assets } = extractRoutesFromTable(tableSection);
  mergeInventory({ routes, assets }, collectSafeRouteSources());
  const updatedTable = `${ROUTE_TABLE_HEADING}\n\n| Route/path candidate | Classification | Rationale | Evidence source that should verify it |\n| --- | --- | --- | --- |\n${routeRows(routes)}\n${assetDependencySection(assets)}\n`;
  const updatedPacket = updateSafeFindings(`${beforeTable}${updatedTable}${afterTable}`, routes.size, assets.size);

  fs.writeFileSync(packetPath, updatedPacket, 'utf8');
  console.log('Active routes review packet cleanup applied: normalized routes, deduplicated rows, and separated static assets.');
}

try {
  cleanActiveRoutesPacket(ACTIVE_ROUTES_PACKET);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
