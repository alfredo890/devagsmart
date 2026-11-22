#!/usr/bin/env node
// MCP server (stdio) for NVIDIA NIM image generation.
// No external dependencies. Node 18+.
// Reads API key from nim.key (beside this file) or env vars.

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MODEL_MAP = {
  'klein': 'black-forest-labs/flux.2-klein-4b',
  'flux.2-klein-4b': 'black-forest-labs/flux.2-klein-4b',
  'flux-2-klein': 'black-forest-labs/flux.2-klein-4b',
  'klein4b': 'black-forest-labs/flux.2-klein-4b',
  'flux.1-dev': 'black-forest-labs/flux.1-dev',
  'flux-1-dev': 'black-forest-labs/flux.1-dev',
  'flux.1-schnell': 'black-forest-labs/flux.1-schnell',
  'flux-1-schnell': 'black-forest-labs/flux.1-schnell',
  'flux-3-image-klein': 'black-forest-labs/flux-3-image-klein',
};

const ASPECT_DIMS = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
  '4:3': { width: 1152, height: 896 },
  '3:4': { width: 896, height: 1152 },
  '21:9': { width: 1536, height: 640 },
};

function readKey() {
  if (process.env.NVIDIA_API_KEY) return process.env.NVIDIA_API_KEY.trim();
  if (process.env.NGC_API_KEY) return process.env.NGC_API_KEY.trim();
  if (process.env.NVIDIA_KEY) return process.env.NVIDIA_KEY.trim();
  const candidates = [
    path.join(__dirname, 'nim.key'),
    path.join(process.cwd(), 'nim.key'),
  ];
  for (const p of candidates) {
    try {
      const v = fs.readFileSync(p, 'utf8').trim();
      if (v) return v;
    } catch {}
  }
  throw new Error('API key not found. Create nim.key next to server.mjs or set NVIDIA_API_KEY.');
}

function resolveModel(alias) {
  const a = String(alias || 'klein').trim();
  if (MODEL_MAP[a]) return MODEL_MAP[a];
  if (a.includes('/')) return a;
  return 'black-forest-labs/' + a;
}

let outputFraming = 'ndjson';

function writeFrame(obj) {
  const json = JSON.stringify(obj);
  if (outputFraming === 'content-length') {
    const header = `Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n`;
    process.stdout.write(header + json);
  } else {
    process.stdout.write(json + '\n');
  }
}

function respond(id, result) {
  writeFrame({ jsonrpc: '2.0', id, result });
}

function respondError(id, code, message) {
  writeFrame({ jsonrpc: '2.0', id, error: { code, message } });
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  processBuffer();
});

function processBuffer() {
  while (true) {
    const m = buffer.match(/^Content-Length: (\d+)\r?\n\r?\n/i);
    if (m) {
      outputFraming = 'content-length';
      const len = parseInt(m[1], 10);
      const headerLen = m[0].length;
      if (buffer.length >= headerLen + len) {
        const json = buffer.slice(headerLen, headerLen + len);
        buffer = buffer.slice(headerLen + len);
        handleMessage(json);
        continue;
      }
      break;
    }
    const idx = buffer.indexOf('\n');
    if (idx !== -1) {
      outputFraming = 'ndjson';
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (line) handleMessage(line);
      continue;
    }
    break;
  }
}

async function handleMessage(text) {
  let msg;
  try { msg = JSON.parse(text); } catch { return; }
  if (!msg || msg.jsonrpc !== '2.0') return;
  const { id, method, params } = msg;

  if (method === 'initialize') {
    respond(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'nim-image', version: '1.0.0' },
    });
    return;
  }
  if (method === 'notifications/initialized') return;
  if (method === 'ping') { respond(id, {}); return; }
  if (method === 'tools/list') {
    respond(id, {
      tools: [
        {
          name: 'generate_image',
          description: 'Generate an image from a text prompt using NVIDIA NIM (FLUX models). Saves the image to disk and returns it.',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: { type: 'string', description: 'Text description of the image' },
              model: { type: 'string', description: 'Model alias: klein (default), flux.1-dev, flux.1-schnell, etc.' },
              aspect_ratio: { type: 'string', description: 'Aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4, 21:9' },
              width: { type: 'number', description: 'Width in pixels' },
              height: { type: 'number', description: 'Height in pixels' },
              steps: { type: 'number', description: 'Diffusion steps' },
              cfg_scale: { type: 'number', description: 'Guidance scale' },
              seed: { type: 'number', description: 'Seed (0 = random)' },
              output_dir: { type: 'string', description: 'Directory to save image (default ./imagenes)' },
              filename: { type: 'string', description: 'Output filename (without path)' },
            },
            required: ['prompt'],
          },
        },
      ],
    });
    return;
  }
  if (method === 'tools/call') {
    const name = params && params.name;
    const args = (params && params.arguments) || {};
    try {
      if (name !== 'generate_image') throw new Error('Unknown tool: ' + name);
      const result = await generateImage(args);
      respond(id, {
        content: [
          { type: 'text', text: result.text },
          { type: 'image', data: result.base64, mimeType: 'image/png' },
        ],
      });
    } catch (e) {
      respond(id, { content: [{ type: 'text', text: 'Error: ' + (e && e.message ? e.message : String(e)) }], isError: true });
    }
    return;
  }
  if (id !== undefined) respondError(id, -32601, 'Method not found: ' + method);
}

async function generateImage(args) {
  const key = readKey();
  const prompt = String(args.prompt || '').trim();
  if (!prompt) throw new Error('prompt is required');

  const modelId = resolveModel(args.model);
  let width = args.width;
  let height = args.height;
  if (!width || !height) {
    const ratio = args.aspect_ratio || args.aspectRatio || '1:1';
    const dims = ASPECT_DIMS[ratio] || ASPECT_DIMS['1:1'];
    width = dims.width;
    height = dims.height;
  }

  const base = (process.env.NIM_BASE_URL || 'https://ai.api.nvidia.com/v1/genai').replace(/\/$/, '');
  const url = base + '/' + modelId;

  const body = { prompt, width, height };
  if (args.steps) body.steps = args.steps;
  if (args.seed !== undefined) body.seed = args.seed;
  if (args.cfg_scale !== undefined) body.cfg_scale = args.cfg_scale;

  const isSchnell = modelId.includes('schnell');
  let payload = isSchnell ? { prompt, width, height, seed: body.seed || 0 } : { ...body };

  async function doPost(p) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(p),
    });
    const text = await res.text();
    return { res, text };
  }

  let { res, text } = await doPost(payload);
  if (!res.ok && res.status === 422) {
    // retry minimal
    const minimal = { prompt, width, height };
    if (body.seed !== undefined) minimal.seed = body.seed;
    ({ res, text } = await doPost(minimal));
  }
  if (!res.ok) {
    throw new Error('NVIDIA API ' + res.status + ': ' + text.slice(0, 800));
  }

  let json;
  try { json = JSON.parse(text); } catch { throw new Error('Invalid JSON response: ' + text.slice(0, 300)); }

  let b64 = null;
  if (json && json.data && json.data[0] && json.data[0].b64_json) b64 = json.data[0].b64_json;
  else if (json && json.artifacts && json.artifacts[0] && json.artifacts[0].base64) b64 = json.artifacts[0].base64;
  else if (json && json.images && json.images[0]) {
    const im = json.images[0];
    b64 = (typeof im === 'string') ? im : (im.base64 || im.b64_json || im.image);
  }
  if (!b64) throw new Error('No image data in response: ' + JSON.stringify(json).slice(0, 500));

  const outDir = args.output_dir || process.env.NIM_OUTPUT_DIR || path.join(process.cwd(), 'imagenes');
  await fsp.mkdir(outDir, { recursive: true });
  const filename = args.filename || ('image-' + Date.now() + '.png');
  const filePath = path.isAbsolute(filename) ? filename : path.join(outDir, filename);
  await fsp.writeFile(filePath, Buffer.from(b64, 'base64'));

  return { text: 'Image saved to ' + filePath, base64: b64 };
}

process.on('uncaughtException', (e) => {
  process.stderr.write('uncaughtException: ' + (e && e.stack ? e.stack : String(e)) + '\n');
});
process.on('unhandledRejection', (e) => {
  process.stderr.write('unhandledRejection: ' + (e && e.stack ? e.stack : String(e)) + '\n');
});
