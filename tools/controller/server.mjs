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

const PORT = process.env.PORT || 4400;
const BUILD = 12;
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
      return json(res, 200, { brand, theme: system.theme, audits: system.audits, building, lastBuild });
    }
    if (url.pathname === '/api/preview' && req.method === 'POST') {
      const brand = { ...DEFAULT_BRAND, ...(await readBody(req)) };
      const system = computeSystem(brand);
      return json(res, 200, { theme: system.theme, audits: system.audits });
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
      const out = await new Promise((resolve) => {
        const child = spawn('claude', ['-p', prompt, '--output-format', 'json', '--allowedTools', 'Read', '--max-turns', '3'],
          { cwd: ROOT, shell: true, timeout: 120000 });
        let so = '', se = '';
        child.stdout.on('data', (d) => (so += d));
        child.stderr.on('data', (d) => (se += d));
        child.on('error', () => resolve(null));
        child.on('close', (code) => resolve(code === 0 ? so : null));
      });
      try { fs.unlinkSync(img); } catch {}
      if (!out) return json(res, 200, { fallback: true, reason: 'claude CLI unavailable; use client-side extraction' });
      try {
        const env = JSON.parse(out);
        const txt = typeof env === 'object' && env.result ? env.result : out;
        const jm = String(txt).match(/\{[\s\S]*\}/);
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
      return json(res, 200, { restored: id, build, brand, theme: system.theme, audits: system.audits });
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
