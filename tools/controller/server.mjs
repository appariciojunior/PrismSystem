#!/usr/bin/env node
// Prism Controller — local server. Zero dependencies (Node 18+).
// Run: npm run controller   (then open http://localhost:4400)

import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import {
  ROOT, loadBrand, saveBrand, computeSystem, applySystem, DEFAULT_BRAND
} from './lib/engine.mjs';
import { extractFigmaTokens } from './lib/figma-tokens.mjs';

const PORT = process.env.PORT || 4400;
const BUILD = 17;
const PUB = path.join(path.dirname(new URL(import.meta.url).pathname), 'public');
const CORPUS_INBOX = path.join(ROOT, 'design-corpus/raw/inbox');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2'
};

const json = (res, code, data) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let b = '';
    req.on('data', (c) => { b += c; if (b.length > 40e6) req.destroy(); });
    req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}); } catch (e) { reject(e); } });
  });

let building = false;
let lastBuild = { ok: null, log: '', at: null };

// ---- Versioning: factory snapshot + save history ----
const TOKENS_F = path.join(ROOT, 'packages/tokens/src/tokens.json');
const HEXES_F = path.join(ROOT, 'packages/tokens/data/resolved-hexes.json');
const BRAND_F = path.join(ROOT, 'tools/controller/brand.json');
const FACTORY = path.join(ROOT, 'tools/controller/factory');
const BACKUPS = path.join(ROOT, 'tools/controller/backups');

// On first boot, freeze the current clean state as the factory baseline
if (!fs.existsSync(path.join(FACTORY, 'tokens.json'))) {
  try {
    fs.mkdirSync(FACTORY, { recursive: true });
    fs.copyFileSync(TOKENS_F, path.join(FACTORY, 'tokens.json'));
    fs.copyFileSync(HEXES_F, path.join(FACTORY, 'resolved-hexes.json'));
    fs.writeFileSync(path.join(FACTORY, 'meta.json'),
      JSON.stringify({ at: new Date().toISOString(), label: 'Factory baseline' }));
    console.log('  ◆ Factory baseline captured');
  } catch (e) { console.log('  ! could not capture factory baseline:', e.message); }
}

function listVersions() {
  const out = [{ id: 'factory', label: 'Factory baseline', at: null }];
  try {
    for (const d of fs.readdirSync(BACKUPS).sort()) {
      const meta = path.join(BACKUPS, d, 'meta.json');
      let m = {};
      try { m = JSON.parse(fs.readFileSync(meta, 'utf8')); } catch {}
      out.push({ id: d, label: m.label || 'save', at: m.at || d, primary: m.primary });
    }
  } catch {}
  return out.map((v, i) => ({ ...v, name: i === 0 ? 'v0' : 'v' + i }));
}

function restoreVersion(id) {
  const dir = id === 'factory' ? FACTORY : path.join(BACKUPS, id);
  const tok = path.join(dir, 'tokens.json');
  const hex = path.join(dir, 'resolved-hexes.json');
  if (!fs.existsSync(tok) || !fs.existsSync(hex)) throw new Error('version not found: ' + id);
  fs.copyFileSync(tok, TOKENS_F);
  fs.copyFileSync(hex, HEXES_F);
  const b = path.join(dir, 'brand.json');
  if (fs.existsSync(b)) fs.copyFileSync(b, BRAND_F);
  else if (id === 'factory') {
    try { fs.writeFileSync(BRAND_F, JSON.stringify(DEFAULT_BRAND, null, 2)); } catch {}
  }
}

// The Figma desktop app exposes a local MCP server over HTTP. The controller
// calls it directly, no token, no cloud. Only requires Figma desktop running.
// Try IPv4, IPv6 and localhost forms — Figma may bind to any one of them.
const FIGMA_MCP_URLS = (process.env.FIGMA_MCP_URL ? [process.env.FIGMA_MCP_URL] : [])
  .concat(['http://127.0.0.1:3845/mcp', 'http://localhost:3845/mcp', 'http://[::1]:3845/mcp']);
const FIGMA_MCP_URL = FIGMA_MCP_URLS[0];

function parseMcpBody(text) {
  // Streamable-HTTP responses may be SSE ("data: {json}") or plain JSON.
  const chunks = [];
  for (const line of String(text).split('\n')) {
    const t = line.trim();
    if (t.startsWith('data:')) { try { chunks.push(JSON.parse(t.slice(5).trim())); } catch {} }
  }
  if (chunks.length) return chunks.find((c) => c.result || c.error) || chunks[chunks.length - 1];
  try { return JSON.parse(text); } catch { return null; }
}

// Read ONE Streamable-HTTP MCP response. Figma answers with
// Content-Type: text/event-stream and keeps the socket OPEN for later server
// messages, so `res.text()` would block forever (that is the "Failed to fetch"
// the browser eventually reports). We stream instead and return the moment the
// first JSON-RPC message carrying result/error arrives.
async function readMcpMessage(res) {
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('text/event-stream') || !res.body) return parseMcpBody(await res.text());
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (value) buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (line.startsWith('data:')) {
          try { const m = JSON.parse(line.slice(5).trim()); if (m && (m.result || m.error)) return m; } catch {}
        }
      }
      if (done) break;
    }
  } finally { try { await reader.cancel(); } catch {} }
  return parseMcpBody(buf);
}

// One JSON-RPC call with a hard timeout, so the controller can never hang on an
// event-stream that stays open. Notifications (no id) don't wait for a body.
async function mcpRpc(url, body, session, timeoutMs = 15000) {
  const H = { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' };
  if (session) H['Mcp-Session-Id'] = session;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'POST', headers: H, body: JSON.stringify(body), signal: ac.signal });
    const sid = res.headers.get('mcp-session-id') || res.headers.get('Mcp-Session-Id') || '';
    const msg = body.id === undefined ? null : await readMcpMessage(res);
    return { session: sid, msg };
  } finally { clearTimeout(timer); try { ac.abort(); } catch {} }
}

// Initialize against the first endpoint that answers (IPv4 / localhost / IPv6).
async function figmaMcpConnect() {
  const initBody = { jsonrpc: '2.0', id: 1, method: 'initialize',
    params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'prism-controller', version: '1' } } };
  let lastErr;
  for (const u of FIGMA_MCP_URLS) {
    try {
      const { session, msg } = await mcpRpc(u, initBody, '', 6000);
      if (msg && msg.error) { lastErr = new Error(msg.error.message); continue; }
      return { url: u, session };
    } catch (e) { lastErr = e; }
  }
  throw new Error('none of [' + FIGMA_MCP_URLS.join(', ') + '] answered an MCP initialize (' + (lastErr && lastErr.message) + ')');
}

async function figmaMcpRead(fileKey, nodeId) {
  // 1) connect + initialize (tries 127.0.0.1, localhost, [::1])
  const { url: baseUrl, session } = await figmaMcpConnect();
  // 2) initialized notification (fire-and-forget)
  try { await mcpRpc(baseUrl, { jsonrpc: '2.0', method: 'notifications/initialized' }, session, 3000); } catch {}
  // 3) tools/call helper
  let idc = 10;
  const call = async (name, cargs) => {
    const { msg } = await mcpRpc(baseUrl, { jsonrpc: '2.0', id: idc++, method: 'tools/call', params: { name, arguments: cargs } }, session, 20000);
    if (!msg || msg.error) throw new Error(msg?.error?.message || ('MCP call failed: ' + name));
    const content = msg.result?.content || [];
    const textPart = content.find((c) => c.type === 'text');
    return textPart ? textPart.text : JSON.stringify(msg.result);
  };
  const args = { fileKey, clientLanguages: 'typescript,html,css', clientFrameworks: 'react' };
  if (nodeId) args.nodeId = nodeId;
  const metadata = await call('get_metadata', args);
  let variables = {};
  if (nodeId) {
    try { variables = JSON.parse(await call('get_variable_defs', { fileKey, nodeId })); } catch {}
  }
  const nameMatch = String(metadata).match(/name="([^"]+)"/);
  return { name: nameMatch ? nameMatch[1] : 'Figma design', metadata, variables };
}

// Deterministic design language from Figma MCP data — the real specifics: colours,
// spacing, radius, typography, shadows, blur, layout and component recipes.
function buildFigmaProfile(name, metadata, vars) {
  const colours = [], spacing = [], radius = [], fontFamilies = new Set(), fontSizes = new Set(), weights = new Set(), shadows = [], blur = [];
  for (const [k, v] of Object.entries(vars || {})) {
    const val = String(v);
    if (/^#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(val)) colours.push({ k, v: val });
    else if (/radius/i.test(k)) radius.push(`${k.split('/').pop()}=${val}`);
    else if (/spacing/i.test(k)) spacing.push(`${k.split('/').pop()}=${val}`);
    else if (/font.?famil/i.test(k)) fontFamilies.add(val);
    else if (/font.?size|(^|\/)size\//i.test(k) && /^\d+$/.test(val)) fontSizes.add(val);
    else if (/font.?weight|weight/i.test(k) && /^(regular|medium|semibold|bold|black|light|\d+)/i.test(val)) weights.add(val);
    else if (/shadow/i.test(k) && /Effect|DROP_SHADOW|offset/i.test(val)) shadows.push(k.split('/').pop());
    else if (/blur/i.test(k)) blur.push(`${k.split('/').pop()}=${val}`);
  }
  // layout: top-level frame names from the metadata XML
  const topFrames = [...String(metadata).matchAll(/<(?:frame|instance)[^>]*name="([^"]+)"/g)].map((m) => m[1]);
  const layout = topFrames.slice(0, 12).join(' · ') || 'see Figma structure';
  // component recipes: repeated instance names (course_card, Stat card, Badge...)
  const nameCounts = {};
  for (const n of topFrames) nameCounts[n] = (nameCounts[n] || 0) + 1;
  const recipes = Object.entries(nameCounts).filter(([, c]) => c >= 1)
    .filter(([n]) => /card|badge|button|item|input|avatar|icon|nav|chip|tab|list|field/i.test(n))
    .slice(0, 10).map(([n, c]) => ({ name: n, desc: c > 1 ? `repeated ${c}×` : 'component instance' }));
  const radiusVals = radius.map((r) => parseInt(r.split('=')[1])).filter((x) => !isNaN(x));
  const hasPill = radiusVals.some((x) => x >= 999);
  const spacingVals = [...new Set(spacing.map((s) => parseInt(s.split('=')[1])).filter((x) => !isNaN(x)))].sort((a, b) => a - b);
  const tokens = extractFigmaTokens(colours, spacingVals, radiusVals, hasPill, fontFamilies, weights);
  return {
    tokens,
    voice: [],
    layout,
    density: spacingVals.length ? `spacing scale ${spacingVals.join(', ')}px` : 'unknown',
    cornerPersonality: radiusVals.length ? `radius ${Math.min(...radiusVals)}–${Math.max(...radiusVals.filter((x) => x < 999))}px${hasPill ? ', pills via radius-full' : ''}` : 'unknown',
    colourUsage: colours.slice(0, 16).map((c) => `${c.k.split('/').pop()} ${c.v}`).join(', '),
    componentRecipes: recipes,
    illustration: '',
    typography: `${[...fontFamilies].join(', ') || 'unknown'}; sizes ${[...fontSizes].sort((a, b) => a - b).join('/')}px; weights ${[...weights].join('/')}`,
    signatureMoves: [hasPill ? 'pill radius' : null, shadows.length ? 'subtle shadows' : null, blur.length ? 'backdrop blur' : null].filter(Boolean),
    blocksToUse: /dashboard/i.test(name + layout) ? ['dashboard-01'] : (/sidebar|nav/i.test(layout) ? ['sidebar-01'] : []),
    notes: `Read live from Figma via the local MCP. Colours: ${colours.length}, spacing steps: ${spacingVals.length}, radius steps: ${radiusVals.length}. Map these onto the system tokens; keep the spacing and radius scale as the rhythm.`
  };
}

function figmaToken() {
  if (process.env.FIGMA_ACCESS_TOKEN) return process.env.FIGMA_ACCESS_TOKEN.trim();
  for (const p of [path.join(process.env.HOME || '', '.figma-console-mcp.env'), path.join(ROOT, '.figma.env')]) {
    try {
      const m = fs.readFileSync(p, 'utf8').match(/FIGMA_ACCESS_TOKEN\s*=\s*(\S+)/);
      if (m) return m[1].trim();
    } catch {}
  }
  return null;
}

// Deep design-language analysis via the local `claude` CLI. Returns a profile object or null.
function claudeDesignProfile({ imagePath, figmaSummary }) {
  const schema = `{"voice":["3-6 adjectives for the overall aesthetic"],` +
    `"layout":"the layout/nav pattern in one line (e.g. left icon-rail + filter sidebar + card grid)",` +
    `"density":"compact|comfortable|spacious","cornerPersonality":"how rounded, and where pills/sharp are used",` +
    `"colourUsage":"how colour is used compositionally (e.g. pastel category tints per card, high-contrast CTAs)",` +
    `"componentRecipes":[{"name":"short name","desc":"what it is composed of"}],` +
    `"illustration":"illustration/imagery style, or none","typography":"heading/body feel and case",` +
    `"signatureMoves":["the 3-6 decisions that make it look designed, not default"],` +
    `"blocksToUse":["which of these shadcn blocks fit: dashboard-01, sidebar-01..16, login-01..05, signup-01..05"],` +
    `"notes":"2-3 sentences of guidance for reproducing this look with shadcn components"}`;
  const base = imagePath
    ? `Read the reference UI image at ${imagePath}. `
    : `Here is the structure of a Figma design file: ${figmaSummary}. `;
  const prompt = base +
    `You are a senior product designer reverse-engineering its DESIGN LANGUAGE so an AI can reproduce the look with shadcn/ui components. ` +
    `Do not describe the content; describe the design decisions. Respond with ONLY a JSON object matching: ${schema}`;
  return runClaude(prompt).then((txt) => {
    if (!txt) return null;
    try { const jm = String(txt).match(/\{[\s\S]*\}/); return JSON.parse(jm[0]); }
    catch { return null; }
  });
}

// Bare, portable claude call: `claude -p "<prompt>"`, no shell, no unsupported flags.
// Returns the model's text output, or null if claude is missing/disabled/errored.
function runClaude(prompt) {
  return new Promise((resolve) => {
    let child;
    try { child = spawn('claude', ['-p', prompt], { cwd: ROOT, timeout: 150000 }); }
    catch { return resolve(null); }
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.on('error', () => resolve(null));
    child.on('close', (code) => {
      if (code !== 0) return resolve(null);
      if (/not enabled in this environment|only `claude -p|command not found/i.test(out)) return resolve(null);
      resolve(out.trim() ? out : null);
    });
  });
}

function runBuild() {
  return new Promise((resolve) => {
    building = true;
    const child = spawn('npm', ['run', 'build:output'], { cwd: ROOT, shell: true });
    let log = '';
    child.stdout.on('data', (d) => (log += d));
    child.stderr.on('data', (d) => (log += d));
    child.on('close', (code) => {
      building = false;
      lastBuild = { ok: code === 0, log: log.slice(-8000), at: new Date().toISOString() };
      resolve(lastBuild);
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    // ---------- API ----------
    if (url.pathname === '/api/state') {
      const brand = loadBrand();
      const system = computeSystem(brand);
      return json(res, 200, { brand, theme: system.theme, ramps: system.ramps, audits: system.audits, building, lastBuild });
    }
    if (url.pathname === '/api/preview' && req.method === 'POST') {
      const brand = { ...DEFAULT_BRAND, ...(await readBody(req)) };
      const system = computeSystem(brand);
      return json(res, 200, { theme: system.theme, ramps: system.ramps, audits: system.audits });
    }
    if (url.pathname === '/api/save' && req.method === 'POST') {
      if (building) return json(res, 409, { error: 'build already running' });
      const brand = { ...DEFAULT_BRAND, ...(await readBody(req)) };
      const system = computeSystem(brand);
      const { backupDir } = applySystem(brand, system);
      // Persist identity + guidelines where generation agents will find them
      const id = brand.identity || {};
      const gl = [
        `# ${id.name || 'Brand'} — Brand Guidelines`, '',
        id.tagline ? `> ${id.tagline}` : '',
        id.industry ? `Industry: ${id.industry}` : '',
        id.description ? `\n${id.description}` : '',
        id.audience ? `\n## Audience\n${id.audience}` : '',
        id.voice ? `\n## Voice and tone\n${id.voice}` : '',
        (id.values || []).length ? `\n## Values\n${id.values.map((v) => `- ${v}`).join('\n')}` : '',
        id.directives ? `\n## AI directives\n${id.directives}` : '',
        (function () {
          const m = brand.material || {};
          const desc = { flat: 'flat, no elevation', elevated: 'elevated with soft shadows', glass: 'iOS-style glass: translucent, backdrop blur, needs a textured or gradient page background', soft: 'soft neumorphic', outline: 'outlined, hard edges' }[m.preset] || m.preset;
          return `\n## Material\nSurface style: ${m.preset} (${desc}). Surface opacity ${m.opacity ?? 100}%, backdrop blur ${m.blur || 0}px.` +
            (m.preset === 'glass' ? ' When composing pages, give the page a gradient or image background so the blur reads, and check text contrast against the composited surface.' : '');
        })(),
        brand.guidelines ? `\n## Rules\n${brand.guidelines}` : ''
      ].filter(Boolean).join('\n');
      const gdir = path.join(ROOT, 'design-corpus/brand');
      fs.mkdirSync(gdir, { recursive: true });
      fs.writeFileSync(path.join(gdir, 'GUIDELINES.md'), gl + '\n');
      const build = await runBuild();
      return json(res, build.ok ? 200 : 500, { saved: true, backupDir, build });
    }
    // ---- AI image digestion: uses the local `claude` CLI when available ----
    if (url.pathname === '/api/analyze-image' && req.method === 'POST') {
      const { name, dataUrl } = await readBody(req);
      const m = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl || '');
      if (!m) return json(res, 400, { error: 'expected image dataUrl' });
      const ext = m[1].split('/')[1].replace('jpeg', 'jpg');
      const tmp = path.join(ROOT, 'tools/controller/.tmp');
      fs.mkdirSync(tmp, { recursive: true });
      const img = path.join(tmp, `analyze-${Date.now()}.${ext}`);
      fs.writeFileSync(img, Buffer.from(m[2], 'base64'));
      const prompt =
        `Read the image at ${img}. It is reference UI or brand material for a design system. ` +
        `Analyse it and respond with ONLY a JSON object, no prose, matching: ` +
        `{"palette":{"primary":"#hex","neutralTint":"#hex","tertiary":"#hex","charts":["#hex","#hex","#hex","#hex","#hex"]},` +
        `"typography":{"style":"serif|sans|mono|mixed","headingFont":"one of Inter, DM Sans, Geist, IBM Plex Sans, Source Sans 3, Space Grotesk, Playfair Display, Lora","bodyFont":"same options","reason":"short"},` +
        `"radius":0.0,` + // 0 sharp .. 2 round, judge from the UI
        `"mood":["3-5 adjectives"],"notes":"2 sentences on how to apply this to the system"}`;
      const out = await runClaude(prompt);
      try { fs.unlinkSync(img); } catch {}
      if (!out) return json(res, 200, { fallback: true, reason: 'claude CLI unavailable; use client-side extraction' });
      try {
        const jm = String(out).match(/\{[\s\S]*\}/);
        return json(res, 200, { analysis: JSON.parse(jm[0]), name });
      } catch {
        return json(res, 200, { fallback: true, reason: 'could not parse analysis' });
      }
    }
    // ---- Website digestion: fetch + parse the brand's real site ----
    if (url.pathname === '/api/analyze-site' && req.method === 'POST') {
      const { url: site } = await readBody(req);
      if (!/^https?:\/\//.test(site || '')) return json(res, 400, { error: 'valid http(s) url required' });
      const get = async (u) => {
        const r = await fetch(u, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (DS-Controller)' } });
        return r.ok ? r.text() : '';
      };
      const html = await get(site);
      if (!html) return json(res, 502, { error: 'could not fetch site' });
      const pick = (re) => (html.match(re) || [])[1] || '';
      const title = pick(/<title[^>]*>([^<]{1,120})/i);
      const desc = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})/i) ||
                   pick(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+name=["']description/i) ||
                   pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,300})/i);
      const siteName = pick(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']{1,80})/i) || title;
      // collect CSS: inline styles + up to 6 linked stylesheets
      let css = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).join('\n');
      const links = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)]
        .map((x) => x[1]).slice(0, 6);
      for (const href of links) {
        try { css += '\n' + (await get(new URL(href, site).href)); } catch {}
      }
      // colour histogram
      const counts = {};
      for (const c of css.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([\d ,.%]+\)/g) || []) {
        let hex = c;
        if (c.startsWith('rgb')) {
          const n = c.match(/[\d.]+/g).map(Number);
          if (n.length >= 3) hex = '#' + n.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
          else continue;
        }
        if (hex.length === 4) hex = '#' + [...hex.slice(1)].map((x) => x + x).join('');
        hex = hex.toLowerCase();
        counts[hex] = (counts[hex] || 0) + 1;
      }
      const sat = (h) => { const [r,g,b]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255); const mx=Math.max(r,g,b),mn=Math.min(r,g,b); return mx===0?0:(mx-mn)/mx; };
      const lum = (h) => { const [r,g,b]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255); return 0.2126*r+0.7152*g+0.0722*b; };
      const all = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([h, n]) => ({ hex: h, n, sat: sat(h), lum: lum(h) }));
      const vivid = all.filter((c) => c.sat > 0.35 && c.lum > 0.08 && c.lum < 0.92);
      const neutrals = all.filter((c) => c.sat <= 0.12);
      // fonts
      const fams = [...css.matchAll(/font-family\s*:\s*([^;}{]+)/gi)].map((x) => x[1].split(',')[0].trim().replace(/["']/g, ''));
      const famCount = {};
      for (const f of fams) if (f && !/inherit|var\(/i.test(f)) famCount[f] = (famCount[f] || 0) + 1;
      const gfonts = [...html.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^&"']+)/gi)]
        .map((x) => decodeURIComponent(x[1]).split(':')[0].replace(/\+/g, ' '));
      return json(res, 200, {
        site: { name: siteName, title, description: desc },
        colours: {
          suggestedPrimary: vivid[0]?.hex || null,
          suggestedTertiary: vivid.find((c) => c.hex !== vivid[0]?.hex && Math.abs(c.lum - (vivid[0]?.lum ?? 0)) > 0.08)?.hex || vivid[1]?.hex || null,
          suggestedNeutralTint: neutrals.find((c) => c.lum > 0.2 && c.lum < 0.8)?.hex || null,
          vivid: vivid.slice(0, 10).map((c) => c.hex),
          neutrals: neutrals.slice(0, 6).map((c) => c.hex)
        },
        fonts: {
          used: Object.entries(famCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([f]) => f),
          googleFonts: [...new Set(gfonts)].slice(0, 5)
        }
      });
    }
    // ---- Design language: deep analysis of a reference (image or Figma) ----
    if (url.pathname === '/api/analyze-design' && req.method === 'POST') {
      const body = await readBody(req);
      if (body.source === 'figma') {
        const figKey = (String(body.url || '').match(/figma\.com\/(?:design|file)\/([A-Za-z0-9]+)/) || [])[1];
        const nodeId = ((String(body.url || '').match(/node-id=([0-9]+[-:][0-9]+)/) || [])[1] || '').replace('-', ':') || undefined;
        if (!figKey) return json(res, 400, { error: 'Could not read a Figma file key from that URL.' });
        // Read straight from the local Figma desktop MCP (no token). Requires Figma desktop open.
        let mcp;
        try { mcp = await figmaMcpRead(figKey, nodeId); }
        catch (e) {
          const refused = /ECONNREFUSED|fetch failed|connect/i.test(e.message);
          return json(res, 200, { fallback: true, reason: refused
            ? ('Nothing is listening on ' + FIGMA_MCP_URL + '. For the controller to read Figma, BOTH must be true: (1) enable Figma’s Dev Mode MCP server (Figma menu → Preferences → Enable Dev Mode MCP server; needs a Dev or Full seat and Figma running), and (2) run this controller on the SAME machine as the Figma desktop app, since 127.0.0.1 is per-machine. Verify on that machine with: curl http://127.0.0.1:3845/mcp')
            : ('Reached the Figma MCP but the call failed: ' + e.message) });
        }
        const profile = buildFigmaProfile(mcp.name, mcp.metadata, mcp.variables);
        return json(res, 200, { profile, tokens: profile.tokens, source: 'figma (mcp)', name: mcp.name });
      }
      // image path
      const m = /^data:(image\/\w+);base64,(.+)$/.exec(body.dataUrl || '');
      if (!m) return json(res, 400, { error: 'expected an image dataUrl or a Figma url' });
      const ext = m[1].split('/')[1].replace('jpeg', 'jpg');
      const tmp = path.join(ROOT, 'tools/controller/.tmp');
      fs.mkdirSync(tmp, { recursive: true });
      const img = path.join(tmp, `design-${Date.now()}.${ext}`);
      fs.writeFileSync(img, Buffer.from(m[2], 'base64'));
      const profile = await claudeDesignProfile({ imagePath: img });
      try { fs.unlinkSync(img); } catch {}
      return json(res, 200, profile ? { profile, source: 'image', name: body.name || 'reference' } : { fallback: true, reason: 'The local AI (claude CLI) was unavailable. Describe the design language by hand below, or install the claude CLI for automatic analysis.' });
    }
    if (url.pathname === '/api/design-language') {
      if (req.method === 'POST') {
        const { md } = await readBody(req);
        const dir = path.join(ROOT, 'design-corpus/brand');
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'DESIGN-LANGUAGE.md'), String(md || ''));
        return json(res, 200, { saved: true });
      }
      let md = '';
      try { md = fs.readFileSync(path.join(ROOT, 'design-corpus/brand/DESIGN-LANGUAGE.md'), 'utf8'); } catch {}
      return json(res, 200, { md });
    }
    if (url.pathname === '/api/ping') {
      return json(res, 200, { build: BUILD });
    }
    if (url.pathname === '/api/versions') {
      return json(res, 200, { versions: listVersions() });
    }
    if (url.pathname === '/api/restore' && req.method === 'POST') {
      if (building) return json(res, 409, { error: 'build already running' });
      const { id } = await readBody(req);
      restoreVersion(id);
      const build = await runBuild();
      const brand = loadBrand();
      const system = computeSystem(brand);
      return json(res, 200, { restored: id, build, brand, theme: system.theme, ramps: system.ramps, audits: system.audits });
    }
    if (url.pathname === '/api/upload' && req.method === 'POST') {
      const { name, dataUrl, note } = await readBody(req);
      const m = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl || '');
      if (!m) return json(res, 400, { error: 'expected image dataUrl' });
      fs.mkdirSync(CORPUS_INBOX, { recursive: true });
      const safe = (name || 'reference').replace(/[^a-z0-9._-]/gi, '_');
      const file = path.join(CORPUS_INBOX, `${Date.now()}-${safe}`);
      fs.writeFileSync(file, Buffer.from(m[2], 'base64'));
      if (note) fs.writeFileSync(file + '.note.txt', note);
      return json(res, 200, { filed: path.relative(ROOT, file) });
    }
    if (url.pathname === '/api/tokens.css') {
      const css = fs.readFileSync(
        path.join(ROOT, 'packages/theme-css/src/variables.css'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/css' });
      return res.end(css);
    }
    // ---------- static ----------
    let p = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = path.join(PUB, path.normalize(p));
    if (file.startsWith(PUB) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store' // always serve the latest controller build
      });
      return res.end(fs.readFileSync(file));
    }
    res.writeHead(404); res.end('not found');
  } catch (e) {
    json(res, 500, { error: String(e.message || e) });
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n  ✗ Port ${PORT} is already in use — an older controller is still running.`);
    console.error(`    Kill it and retry:\n      lsof -ti :${PORT} | xargs kill -9\n      npm run controller\n`);
    process.exit(1);
  }
  throw e;
});
server.listen(PORT, () => {
  console.log(`\n  ▲ Prism Controller (build ${BUILD})\n  → http://localhost:${PORT}\n`);
});
