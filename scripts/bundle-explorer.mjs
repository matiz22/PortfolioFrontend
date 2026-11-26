#!/usr/bin/env node
/**
 * Attributes every byte of an esbuild-minified bundle to its original source
 * module by decoding the source map's VLQ mappings directly.
 * Usage: node scripts/bundle-explorer.mjs <bundle.js> [<bundle.js.map>] [--top N]
 */
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const b64 = new Map([...B64].map((c, i) => [c, i]));

function decodeVlq(str) {
  const out = [];
  let value = 0, shift = 0;
  for (const c of str) {
    const digit = b64.get(c);
    if (digit === undefined) { if (c === ',') { out.push(null); value = 0; shift = 0; } continue; }
    value += (digit & 31) << shift;
    if (digit & 32) { shift += 5; }
    else {
      const negate = value & 1;
      value >>>= 1;
      out.push(negate ? (value === 0x800000000 ? NaN : -value) : value);
      value = 0; shift = 0;
    }
  }
  return out;
}

function decodeMappings(mappings) {
  // Returns [{genCol, srcIdx, srcLine, srcCol}] for genLine 0..n
  const lines = [];
  let srcIdx = 0, srcLine = 0, srcCol = 0;
  for (const genLineStr of mappings.split(';')) {
    const segments = [];
    let genCol = 0;
    for (const segStr of genLineStr.split(',')) {
      if (!segStr) continue;
      const f = decodeVlq(segStr);
      genCol += f[0];
      if (f.length >= 4) {
        srcIdx += f[1]; srcLine += f[2]; srcCol += f[3];
        segments.push({ genCol, srcIdx, srcLine, srcCol });
      } else {
        segments.push({ genCol, srcIdx: -1 });
      }
    }
    lines.push(segments);
  }
  return lines;
}

const args = process.argv.slice(2);
const topIdx = args.indexOf('--top');
const top = topIdx > 0 ? Number(args[topIdx + 1]) : 40;
const [bundleArg, mapArg] = args.filter((a, i) => !(a === '--top' || (topIdx > 0 && i === topIdx + 1)));

const bundlePath = resolve(bundleArg);
const mapPath = mapArg ? resolve(mapArg) : bundlePath.replace(/\.js$/, '.js.map');
const map = JSON.parse(readFileSync(mapPath, 'utf8'));
const bundle = readFileSync(bundlePath, 'utf8');

const bundleLines = bundle.split('\n');
const decoded = decodeMappings(map.mappings);
const sources = map.sources;
const sizes = new Map();
const lineSizes = new Map();

let unmapped = 0, mapped = 0;
for (let genLine = 0; genLine < decoded.length; genLine++) {
  const segs = decoded[genLine];
  const lineLen = bundleLines[genLine]?.length ?? 0;
  for (let i = 0; i < segs.length; i++) {
    const endCol = i + 1 < segs.length ? segs[i + 1].genCol : lineLen;
    const bytes = Math.max(0, endCol - segs[i].genCol);
    const srcIdx = segs[i].srcIdx;
    if (srcIdx < 0 || srcIdx >= sources.length) { unmapped += bytes; continue; }
    mapped += bytes;
    const src = sources[srcIdx];
    sizes.set(src, (sizes.get(src) ?? 0) + bytes);
    if ((genLine + 1) in (lineSizes ?? {})) {}
  }
}

// Sources with no mappings (fully tree-shaken files) contribute 0 bytes.
const total = mapped + unmapped;
const rows = [...sizes.entries()].sort((a, b) => b[1] - a[1]);

console.log(`Bundle: ${basename(bundlePath)}  (${total} bytes accounted)`);
console.log(`Mapped: ${mapped}  Unmapped/newline: ${unmapped}\n`);
let shown = 0, agg = new Map();
for (const [src, size] of rows) {
  // Group node_modules by package for readability
  const m = src.match(/node_modules\/(?:@[^/]+\/)?([^/]+)\/(.+)$/);
  const key = m ? `◆ ${m[1]} → ${m[2].replace(/\?.*$/, '')}` : src.replace(/^.*?(src\/|dist\/)/, '$1');
  agg.set(key, (agg.get(key) ?? 0) + size);
}
const groups = [...agg.entries()].sort((a, b) => b[1] - a[1]);
for (const [src, size] of groups.slice(0, top)) {
  console.log(`${String(size).padStart(9)}  ${((size * 100) / total).toFixed(1).padStart(5)}%  ${src}`);
}
const pkgBytes = groups.filter(([s]) => s.startsWith('◆')).reduce((a, [, s]) => a + s, 0);
const appBytes = groups.filter(([s]) => !s.startsWith('◆')).reduce((a, [, s]) => a + s, 0);
console.log(`\nSummary: node_modules ${pkgBytes} | app+other ${appBytes}`);
