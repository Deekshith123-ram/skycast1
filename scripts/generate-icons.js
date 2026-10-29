import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a192f" />
      <stop offset="50%" stop-color="#0f2b48" />
      <stop offset="100%" stop-color="#051026" />
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
    <linearGradient id="cloud" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#00f2fe" flood-opacity="0.35"/>
    </filter>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  
  <!-- Outer Radar Sweeps / Rings -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="#1e3a5f" stroke-width="2" stroke-dasharray="6 6" opacity="0.6"/>
  <circle cx="256" cy="256" r="130" fill="none" stroke="#38bdf8" stroke-width="2.5" opacity="0.4"/>
  <circle cx="256" cy="256" r="80" fill="none" stroke="#60a5fa" stroke-width="2" stroke-dasharray="4 4" opacity="0.5"/>
  <line x1="76" y1="256" x2="436" y2="256" stroke="#1e3a5f" stroke-width="1.5" opacity="0.4"/>
  <line x1="256" y1="76" x2="256" y2="436" stroke="#1e3a5f" stroke-width="1.5" opacity="0.4"/>
  
  <!-- Satellite Orbit Ring -->
  <ellipse cx="256" cy="256" rx="200" ry="90" fill="none" stroke="url(#glow)" stroke-width="3" transform="rotate(-30 256 256)" opacity="0.75"/>
  
  <!-- Satellite Symbol -->
  <g transform="translate(380, 150) rotate(15)">
    <rect x="-18" y="-10" width="36" height="20" rx="4" fill="#38bdf8"/>
    <rect x="-36" y="-7" width="14" height="14" rx="2" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
    <rect x="22" y="-7" width="14" height="14" rx="2" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="4" fill="#ffffff"/>
  </g>
  
  <!-- Cloud & Lightning Weather Icon -->
  <g filter="url(#shadow)">
    <!-- Main Cloud Body -->
    <path d="M190 320 L330 320 A 45 45 0 0 0 330 230 A 25 25 0 0 0 320 232 A 65 65 0 0 0 200 232 A 40 40 0 0 0 170 270 A 50 50 0 0 0 190 320 Z" 
          fill="url(#cloud)" />
    <!-- Weather Radar Sweep beam -->
    <path d="M256 256 L380 180 A 150 150 0 0 1 350 330 Z" fill="url(#glow)" opacity="0.25"/>
    <!-- Indian Saffron & Green Accent Flares -->
    <circle cx="160" cy="180" r="10" fill="#f97316" opacity="0.8"/>
    <circle cx="360" cy="340" r="10" fill="#22c55e" opacity="0.8"/>
  </g>

  <!-- SkyCast Monogram / Radar Dot -->
  <circle cx="256" cy="256" r="12" fill="#38bdf8" />
  <circle cx="256" cy="256" r="6" fill="#ffffff" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

// Helper to write a valid PNG file using pure Node.js
function createPNG(width, height, getPixel) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with filter byte per row
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // Compress IDAT
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = calcCrc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function calcCrc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate styled weather satellite icon pixels
function renderSkyCastIcon(isMaskable) {
  return (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = w / 2;

    // Background gradient: Midnight navy #0a192f to #051026
    const t = y / h;
    let r = Math.round(10 * (1 - t) + 5 * t);
    let g = Math.round(25 * (1 - t) + 16 * t);
    let b = Math.round(47 * (1 - t) + 38 * t);
    let a = 255;

    if (!isMaskable) {
      // Rounded corner for regular icon
      const cornerRadius = w * 0.22;
      const rx = Math.abs(x - cx);
      const ry = Math.abs(y - cy);
      const limit = w / 2;
      if (rx > limit - cornerRadius && ry > limit - cornerRadius) {
        const cdx = rx - (limit - cornerRadius);
        const cdy = ry - (limit - cornerRadius);
        if (cdx * cdx + cdy * cdy > cornerRadius * cornerRadius) {
          return [0, 0, 0, 0];
        }
      }
    }

    // Radar circles
    const r1 = w * 0.35;
    const r2 = w * 0.25;
    const r3 = w * 0.15;
    if (Math.abs(dist - r1) < 1.5 || Math.abs(dist - r2) < 1.5 || Math.abs(dist - r3) < 1.5) {
      // Glowing cyan radar sweep ring
      return [56, 189, 248, 220];
    }

    // Satellite orbit ring (ellipse tilted)
    // equation: ((x'*cos + y'*sin)/a)^2 + ((-x'*sin + y'*cos)/b)^2 ~ 1
    const angle = -0.5236; // -30 deg
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const ex = dx * cosA + dy * sinA;
    const ey = -dx * sinA + dy * cosA;
    const ellipseDist = Math.abs((ex * ex) / ((w * 0.4) ** 2) + (ey * ey) / ((h * 0.18) ** 2) - 1.0);
    if (ellipseDist < 0.08) {
      return [99, 102, 241, 230];
    }

    // Cloud shape in center
    // Approximate cloud with 3 overlapping circles and base
    const c1 = Math.hypot(x - (cx - w * 0.1), y - (cy + h * 0.02));
    const c2 = Math.hypot(x - cx, y - (cy - h * 0.06));
    const c3 = Math.hypot(x - (cx + w * 0.12), y - (cy + h * 0.02));
    const isCloud = c1 < w * 0.12 || c2 < w * 0.15 || c3 < w * 0.11 || (y > cy && y < cy + h * 0.12 && Math.abs(dx) < w * 0.18);
    if (isCloud) {
      return [240, 246, 255, 255];
    }

    // Center pulse dot
    if (dist < w * 0.04) {
      return [56, 189, 248, 255];
    }
    if (dist < w * 0.02) {
      return [255, 255, 255, 255];
    }

    return [r, g, b, a];
  };
}

// Generate the required icons
console.log('Generating PWA icons...');
const png192 = createPNG(192, 192, renderSkyCastIcon(false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

const png512 = createPNG(512, 512, renderSkyCastIcon(false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

const pngMaskable = createPNG(512, 512, renderSkyCastIcon(true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

const appleTouch = createPNG(180, 180, renderSkyCastIcon(false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

console.log('PWA icons successfully generated in /public!');
