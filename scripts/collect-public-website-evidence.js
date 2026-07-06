#!/usr/bin/env node
import dns from 'node:dns/promises';
import fs from 'node:fs';
import path from 'node:path';
import {
  ensurePrivateEvidenceFolders,
  parseArgs,
  printHelp,
  writeTextFile
} from './private-evidence-kit-common.js';

const DEFAULT_DOMAIN = 'driphealthcare.com';
const DEFAULT_BASE_URL = `https://${DEFAULT_DOMAIN}`;
const DEFAULT_MAX_PAGES = 250;
const DEFAULT_REQUEST_DELAY_MS = 500;
const APPS_SCRIPT_HOST = 'script.' + 'google.com';
const APPS_SCRIPT_TOKEN_PREFIX = 'AK' + 'fy';

const KNOWN_HOSTS = [
  'driphealthcare.com',
  'www.driphealthcare.com',
  'upload.driphealthcare.com',
  'go.driphealthcare.com',
  'showcase.driphealthcare.com',
  'app.driphealthcare.com',
  'admin.driphealthcare.com',
  'api.driphealthcare.com'
];

const KNOWN_ROUTE_PATTERNS = [
  '/providers',
  '/vendors',
  '/business-directory',
  '/providers/media-center',
  '/vendors/conferences',
  '/redirect/conference-campaign',
  '/conference-campaign-submit',
  '/conference-campaign-preview',
  '/conference-showcase',
  '/redirect/patient-campaign',
  '/store',
  '/cart'
];

const ACTIVE_ROUTE_TERMS = [
  'provider',
  'vendor',
  'advertiser',
  'campaign',
  'conference',
  'showcase',
  'media-center',
  'redirect',
  'qr',
  'upload',
  'scheduling',
  'directory'
];

const ACTION_ROUTE_TERMS = [
  'delete',
  'deactivate',
  'activate',
  'archive',
  'expire',
  'pause',
  'resume',
  'submit',
  'checkout',
  'purchase'
];

function parseCollectorArgs(argv = process.argv.slice(2)) {
  const options = {
    ...parseArgs(argv),
    baseUrl: process.env.DRIP_PUBLIC_EVIDENCE_BASE_URL || DEFAULT_BASE_URL,
    domain: process.env.DRIP_PUBLIC_EVIDENCE_DOMAIN || DEFAULT_DOMAIN,
    maxPages: DEFAULT_MAX_PAGES,
    requestDelayMs: DEFAULT_REQUEST_DELAY_MS,
    dryRun: false,
    skipDns: false,
    skipRdap: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1];
      index += 1;
    } else if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.slice('--base-url='.length);
    } else if (arg === '--domain') {
      options.domain = argv[index + 1];
      index += 1;
    } else if (arg.startsWith('--domain=')) {
      options.domain = arg.slice('--domain='.length);
    } else if (arg === '--max-pages') {
      options.maxPages = Number(argv[index + 1]);
      index += 1;
    } else if (arg.startsWith('--max-pages=')) {
      options.maxPages = Number(arg.slice('--max-pages='.length));
    } else if (arg === '--request-delay-ms') {
      options.requestDelayMs = Number(argv[index + 1]);
      index += 1;
    } else if (arg.startsWith('--request-delay-ms=')) {
      options.requestDelayMs = Number(arg.slice('--request-delay-ms='.length));
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--skip-dns') {
      options.skipDns = true;
    } else if (arg === '--skip-rdap') {
      options.skipRdap = true;
    }
  }

  options.baseUrl = normalizeBaseUrl(options.baseUrl);
  options.maxPages = Number.isFinite(options.maxPages) && options.maxPages > 0 ? options.maxPages : DEFAULT_MAX_PAGES;
  options.requestDelayMs = Number.isFinite(options.requestDelayMs) && options.requestDelayMs >= 0 ? options.requestDelayMs : DEFAULT_REQUEST_DELAY_MS;
  return options;
}

function normalizeBaseUrl(input) {
  const url = new URL(input);
  url.hash = '';
  url.search = '';
  return url.origin;
}

function timestampForFile(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\..+$/, 'Z');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeCsv(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function csv(headers, rows) {
  return [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))
  ].join('\n');
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function safeFilePart(value) {
  return String(value || 'root')
    .replace(/^https?:\/\//i, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 140) || 'root';
}

function inboxPath(privateRoot, fileName) {
  const inbox = path.join(privateRoot, 'inbox');
  const target = path.resolve(inbox, fileName);
  const relative = path.relative(inbox, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside private inbox: ${target}`);
  }
  return target;
}

function writeInboxFile(privateRoot, fileName, content, filesWritten) {
  const filePath = inboxPath(privateRoot, fileName);
  writeTextFile(filePath, content, { force: true });
  filesWritten.push(filePath);
  return filePath;
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function attrValue(attrs, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i');
  const match = attrs.match(pattern);
  if (match) {
    return match[1];
  }
  const barePattern = new RegExp(`${name}\\s*=\\s*([^\\s>]+)`, 'i');
  const bare = attrs.match(barePattern);
  return bare ? bare[1] : '';
}

function tagRows(html, tagName) {
  const rows = [];
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, 'gi');
  let match;
  while ((match = pattern.exec(html)) !== null) {
    rows.push(match[1] || '');
  }
  return rows;
}

function resolveUrl(value, pageUrl) {
  if (!value || value.startsWith('data:') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('javascript:')) {
    return value || '';
  }
  try {
    return new URL(value, pageUrl).href;
  } catch {
    return value;
  }
}

function pathFromUrl(url) {
  try {
    return new URL(url).pathname || '/';
  } catch {
    return url;
  }
}

function sameOrigin(url, baseUrl) {
  try {
    return new URL(url).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

function isActionLikeUrl(url) {
  const pathName = pathFromUrl(url).toLowerCase();
  return ACTION_ROUTE_TERMS.some((term) => pathName.includes(term));
}

function shouldFetchPage(url, baseUrl) {
  if (!sameOrigin(url, baseUrl)) {
    return false;
  }
  const lower = url.toLowerCase();
  if (lower.includes('#') || lower.startsWith('mailto:') || lower.startsWith('tel:')) {
    return false;
  }
  return !isActionLikeUrl(url);
}

function extractSitemapUrls(xml) {
  return uniqueStrings([...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim()));
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return cleanText(match ? match[1] : '');
}

function metaContent(html, selectorName) {
  const patterns = [
    new RegExp(`<meta\\b[^>]*(?:name|property)=["']${selectorName}["'][^>]*>`, 'i'),
    new RegExp(`<meta\\b[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${selectorName}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) {
      continue;
    }
    if (match[1]) {
      return cleanText(match[1]);
    }
    return cleanText(attrValue(match[0], 'content'));
  }
  return '';
}

function canonicalUrl(html, pageUrl) {
  for (const attrs of tagRows(html, 'link')) {
    if ((attrValue(attrs, 'rel') || '').toLowerCase() === 'canonical') {
      return resolveUrl(attrValue(attrs, 'href'), pageUrl);
    }
  }
  return '';
}

function findReferenceSnippets(html, terms) {
  const snippets = [];
  for (const term of terms) {
    const index = html.toLowerCase().indexOf(term.toLowerCase());
    if (index !== -1) {
      snippets.push(cleanText(html.slice(Math.max(0, index - 80), Math.min(html.length, index + 180))));
    }
  }
  return snippets;
}

function collectPageEvidence(pageUrl, html, baseUrl) {
  const route = pathFromUrl(pageUrl);
  const forms = tagRows(html, 'form').map((attrs, index) => ({
    pageUrl,
    formIndex: index + 1,
    method: (attrValue(attrs, 'method') || 'GET').toUpperCase(),
    action: resolveUrl(attrValue(attrs, 'action'), pageUrl),
    id: attrValue(attrs, 'id'),
    name: attrValue(attrs, 'name'),
    productionNote: 'Public source only; form was not submitted.'
  }));

  const scripts = tagRows(html, 'script').map((attrs, index) => ({
    pageUrl,
    scriptIndex: index + 1,
    src: resolveUrl(attrValue(attrs, 'src'), pageUrl),
    type: attrValue(attrs, 'type'),
    async: attrs.includes('async') ? 'YES' : 'NO',
    defer: attrs.includes('defer') ? 'YES' : 'NO'
  }));

  const links = tagRows(html, 'a').map((attrs) => {
    const href = resolveUrl(attrValue(attrs, 'href'), pageUrl);
    return {
      pageUrl,
      href,
      route: pathFromUrl(href),
      sameOrigin: sameOrigin(href, baseUrl) ? 'YES' : 'NO',
      actionLike: isActionLikeUrl(href) ? 'YES' : 'NO'
    };
  });

  const assetRows = [];
  for (const tagName of ['img', 'source', 'video', 'audio', 'iframe']) {
    for (const attrs of tagRows(html, tagName)) {
      assetRows.push({
        pageUrl,
        tag: tagName,
        src: resolveUrl(attrValue(attrs, 'src'), pageUrl),
        alt: attrValue(attrs, 'alt')
      });
    }
  }
  for (const attrs of tagRows(html, 'link')) {
    const href = attrValue(attrs, 'href');
    const rel = attrValue(attrs, 'rel');
    if (href && rel && rel.toLowerCase() !== 'canonical') {
      assetRows.push({
        pageUrl,
        tag: 'link',
        src: resolveUrl(href, pageUrl),
        alt: rel
      });
    }
  }

  const seoRows = [{
    pageUrl,
    route,
    title: extractTitle(html),
    description: metaContent(html, 'description'),
    ogTitle: metaContent(html, 'og:title'),
    ogDescription: metaContent(html, 'og:description'),
    canonical: canonicalUrl(html, pageUrl)
  }];

  const appsScriptRefs = findReferenceSnippets(html, [APPS_SCRIPT_HOST, APPS_SCRIPT_TOKEN_PREFIX, 'mode=']).map((snippet) => ({
    pageUrl,
    reference: snippet,
    productionNote: 'Public source reference only; Apps Script mode was not called.'
  }));
  const uploadRefs = findReferenceSnippets(html, ['upload.driphealthcare.com']).map((snippet) => ({ pageUrl, reference: snippet }));
  const screenCloudRefs = findReferenceSnippets(html, ['screencloud', 'screen cloud']).map((snippet) => ({ pageUrl, reference: snippet }));
  const analyticsRefs = findReferenceSnippets(html, ['googletagmanager', 'gtag(', 'google-analytics', 'measurement id', 'GTM-', 'G-']).map((snippet) => ({ pageUrl, reference: snippet }));

  const activeRouteRows = [];
  const routeSource = [route, ...links.map((link) => link.route)].filter(Boolean);
  for (const candidate of uniqueStrings(routeSource)) {
    const lower = candidate.toLowerCase();
    if (KNOWN_ROUTE_PATTERNS.includes(candidate) || ACTIVE_ROUTE_TERMS.some((term) => lower.includes(term))) {
      activeRouteRows.push({
        pageUrl,
        candidateRoute: candidate,
        reason: 'Matched known public route pattern or preservation keyword.'
      });
    }
  }

  return { forms, scripts, links, assets: assetRows, seo: seoRows, appsScriptRefs, uploadRefs, screenCloudRefs, analyticsRefs, activeRouteRows };
}

async function fetchText(url, manifest, options) {
  if (options.dryRun) {
    manifest.skippedResources.push({ resource: url, reason: 'Dry run: not fetched.' });
    return { ok: false, status: 'DRY_RUN', text: '' };
  }
  await sleep(options.requestDelayMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.5',
        'user-agent': 'DripPublicEvidenceCollector/1.0 public-read-only no-cookies'
      }
    });
    const text = await response.text();
    manifest.urlsFetched.push({ url, status: response.status, ok: response.ok });
    return { ok: response.ok, status: response.status, text };
  } catch (error) {
    manifest.errors.push({ scope: 'fetch', resource: url, error: error.message });
    return { ok: false, status: 'ERROR', text: '' };
  }
}

async function resolveRecord(host, type, manifest) {
  manifest.dnsLookupsPerformed.push(`${type} ${host}`);
  try {
    const values = await dns.resolve(host, type);
    return { host, type, values, error: '' };
  } catch (error) {
    return { host, type, values: [], error: error.code || error.message };
  }
}

async function collectDns(domain, manifest, options) {
  if (options.dryRun || options.skipDns) {
    manifest.skippedResources.push({ resource: 'DNS lookups', reason: options.dryRun ? 'Dry run.' : 'Skipped by --skip-dns.' });
    return [];
  }
  const rows = [];
  const hostRecordTypes = ['A', 'AAAA', 'CNAME'];
  const apexRecordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'CAA'];
  for (const type of apexRecordTypes) {
    rows.push(await resolveRecord(domain, type, manifest));
  }
  rows.push(await resolveRecord(`_dmarc.${domain}`, 'TXT', manifest));
  for (const host of KNOWN_HOSTS) {
    if (host === domain) {
      continue;
    }
    for (const type of hostRecordTypes) {
      rows.push(await resolveRecord(host, type, manifest));
    }
  }
  return rows;
}

function dnsRowsToCsvRows(rows) {
  return rows.map((row) => ({
    host: row.host,
    type: row.type,
    values: JSON.stringify(row.values),
    error: row.error,
    isSpf: row.type === 'TXT' && JSON.stringify(row.values).toLowerCase().includes('v=spf1') ? 'YES' : 'NO',
    isDmarc: row.host.startsWith('_dmarc.') ? 'YES' : 'NO'
  }));
}

function dnsSummaryMarkdown(rows) {
  return `# Public DNS Summary\n\n- Production impact: NONE\n- Credentials used: NO\n- DNS changed: NO\n\n| Host | Type | Values | Error |\n| --- | --- | --- | --- |\n${rows.map((row) => `| ${row.host} | ${row.type} | ${JSON.stringify(row.values).replace(/\|/g, '\\|')} | ${row.error} |`).join('\n') || '| NONE |  |  |  |'}\n`;
}

async function collectRdap(domain, manifest, options) {
  if (options.dryRun || options.skipRdap) {
    manifest.skippedResources.push({ resource: 'RDAP lookup', reason: options.dryRun ? 'Dry run.' : 'Skipped by --skip-rdap.' });
    return null;
  }
  const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
  const response = await fetchText(rdapUrl, manifest, options);
  if (!response.ok) {
    return null;
  }
  try {
    return JSON.parse(response.text);
  } catch (error) {
    manifest.errors.push({ scope: 'rdap', resource: rdapUrl, error: error.message });
    return null;
  }
}

function manifestMarkdown(manifest) {
  const files = manifest.filesWritten.map((filePath) => `- ${filePath}`).join('\n') || '- NONE';
  const urls = manifest.urlsFetched.map((entry) => `- ${entry.url} (${entry.status})`).join('\n') || '- NONE';
  const lookups = manifest.dnsLookupsPerformed.map((entry) => `- ${entry}`).join('\n') || '- NONE';
  const errors = manifest.errors.map((entry) => `- ${entry.scope}: ${entry.resource}: ${entry.error}`).join('\n') || '- NONE';
  const skipped = manifest.skippedResources.map((entry) => `- ${entry.resource}: ${entry.reason}`).join('\n') || '- NONE';
  return `# Public Evidence Collection Manifest\n\n- Collection date: ${manifest.collectionDate}\n- Base URL: ${manifest.baseUrl}\n- Domain: ${manifest.domain}\n- Dry run: ${manifest.dryRun ? 'YES' : 'NO'}\n- Production impact: NONE\n- Credentials used: NO\n- Browser cookies used: NO\n- Private APIs called: NO\n- Forms submitted: NO\n- Phase 3 started: NO\n\n## URLs Fetched\n\n${urls}\n\n## DNS Lookups Performed\n\n${lookups}\n\n## Files Written\n\n${files}\n\n## Errors\n\n${errors}\n\n## Skipped Resources\n\n${skipped}\n\n## Next Commands\n\n1. npm run evidence:import\n2. npm run evidence:scan\n3. npm run evidence:status\n`;
}

async function main() {
  const options = parseCollectorArgs();
  if (options.help) {
    printHelp('collect-public-website-evidence');
    process.exit(0);
  }

  try {
    ensurePrivateEvidenceFolders(options.root);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  const prefix = timestampForFile();
  const filesWritten = [];
  const manifest = {
    collectionDate: new Date().toISOString(),
    baseUrl: options.baseUrl,
    domain: options.domain,
    dryRun: options.dryRun,
    urlsFetched: [],
    dnsLookupsPerformed: [],
    filesWritten,
    errors: [],
    skippedResources: []
  };

  const homepageUrl = `${options.baseUrl}/`;
  const robotsUrl = `${options.baseUrl}/robots.txt`;
  const sitemapUrl = `${options.baseUrl}/sitemap.xml`;
  const homepage = await fetchText(homepageUrl, manifest, options);
  const robots = await fetchText(robotsUrl, manifest, options);
  const sitemap = await fetchText(sitemapUrl, manifest, options);

  if (homepage.text) {
    writeInboxFile(options.root, `${prefix}-public-homepage.html`, homepage.text, filesWritten);
  }
  if (robots.text) {
    writeInboxFile(options.root, `${prefix}-public-robots.txt`, robots.text, filesWritten);
  }
  if (sitemap.text) {
    writeInboxFile(options.root, `${prefix}-public-sitemap.xml`, sitemap.text, filesWritten);
  }

  const sitemapUrls = sitemap.text ? extractSitemapUrls(sitemap.text) : [];
  const pageUrls = uniqueStrings([homepageUrl, ...sitemapUrls])
    .filter((url) => shouldFetchPage(url, options.baseUrl))
    .slice(0, options.maxPages);

  const pageRows = [];
  const routeRows = [];
  const formRows = [];
  const scriptRows = [];
  const externalLinkRows = [];
  const assetRows = [];
  const seoRows = [];
  const appsScriptRows = [];
  const uploadRows = [];
  const screenCloudRows = [];
  const analyticsRows = [];
  const activeRouteRows = [];

  for (const pageUrl of pageUrls) {
    const response = pageUrl === homepageUrl && homepage.text ? homepage : await fetchText(pageUrl, manifest, options);
    pageRows.push({
      url: pageUrl,
      route: pathFromUrl(pageUrl),
      fetched: response.text ? 'YES' : 'NO',
      status: response.status
    });
    routeRows.push({
      route: pathFromUrl(pageUrl),
      url: pageUrl,
      source: pageUrl === homepageUrl ? 'homepage' : 'sitemap'
    });
    if (!response.text) {
      continue;
    }
    writeInboxFile(options.root, `${prefix}-public-page-${safeFilePart(pageUrl)}.html`, response.text, filesWritten);
    const evidence = collectPageEvidence(pageUrl, response.text, options.baseUrl);
    formRows.push(...evidence.forms);
    scriptRows.push(...evidence.scripts);
    externalLinkRows.push(...evidence.links.filter((row) => row.sameOrigin === 'NO'));
    assetRows.push(...evidence.assets);
    seoRows.push(...evidence.seo);
    appsScriptRows.push(...evidence.appsScriptRefs);
    uploadRows.push(...evidence.uploadRefs);
    screenCloudRows.push(...evidence.screenCloudRefs);
    analyticsRows.push(...evidence.analyticsRefs);
    activeRouteRows.push(...evidence.activeRouteRows);
  }

  for (const knownRoute of KNOWN_ROUTE_PATTERNS) {
    const knownUrl = new URL(knownRoute, options.baseUrl).href;
    if (!routeRows.some((row) => row.route === knownRoute)) {
      routeRows.push({ route: knownRoute, url: knownUrl, source: 'known-route-pattern-not-fetched' });
    }
  }

  writeInboxFile(options.root, `${prefix}-public-page-list.csv`, csv(['url', 'route', 'fetched', 'status'], pageRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-route-inventory.csv`, csv(['route', 'url', 'source'], routeRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-form-inventory.csv`, csv(['pageUrl', 'formIndex', 'method', 'action', 'id', 'name', 'productionNote'], formRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-script-inventory.csv`, csv(['pageUrl', 'scriptIndex', 'src', 'type', 'async', 'defer'], scriptRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-external-link-inventory.csv`, csv(['pageUrl', 'href', 'route', 'sameOrigin', 'actionLike'], externalLinkRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-asset-media-inventory.csv`, csv(['pageUrl', 'tag', 'src', 'alt'], assetRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-seo-meta-canonical-inventory.csv`, csv(['pageUrl', 'route', 'title', 'description', 'ogTitle', 'ogDescription', 'canonical'], seoRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-apps-script-reference-inventory.csv`, csv(['pageUrl', 'reference', 'productionNote'], appsScriptRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-upload-reference-inventory.csv`, csv(['pageUrl', 'reference'], uploadRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-screencloud-reference-inventory.csv`, csv(['pageUrl', 'reference'], screenCloudRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-google-analytics-reference-inventory.csv`, csv(['pageUrl', 'reference'], analyticsRows), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-active-route-candidates.csv`, csv(['pageUrl', 'candidateRoute', 'reason'], activeRouteRows), filesWritten);

  const dnsRows = await collectDns(options.domain, manifest, options);
  writeInboxFile(options.root, `${prefix}-public-dns-records.csv`, csv(['host', 'type', 'values', 'error', 'isSpf', 'isDmarc'], dnsRowsToCsvRows(dnsRows)), filesWritten);
  writeInboxFile(options.root, `${prefix}-public-dns-summary.md`, dnsSummaryMarkdown(dnsRows), filesWritten);

  const rdap = await collectRdap(options.domain, manifest, options);
  if (rdap) {
    writeInboxFile(options.root, `${prefix}-public-rdap-domain-summary.json`, `${JSON.stringify(rdap, null, 2)}\n`, filesWritten);
  } else {
    manifest.skippedResources.push({ resource: 'RDAP summary JSON', reason: 'Unavailable or skipped without credentials.' });
  }

  const manifestFileName = `${prefix}-public-evidence-collection-manifest.md`;
  const manifestFilePath = inboxPath(options.root, manifestFileName);
  filesWritten.push(manifestFilePath);
  writeTextFile(manifestFilePath, manifestMarkdown(manifest), { force: true });

  console.log(`Public evidence collection complete: ${path.join(options.root, 'inbox')}`);
  console.log(`Files written: ${filesWritten.length}`);
  console.log(`URLs fetched: ${manifest.urlsFetched.length}`);
  console.log(`DNS lookups: ${manifest.dnsLookupsPerformed.length}`);
  console.log(`Errors: ${manifest.errors.length}`);
  console.log('');
  console.log('Next commands:');
  console.log('1. npm run evidence:import');
  console.log('2. npm run evidence:scan');
  console.log('3. npm run evidence:status');
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
