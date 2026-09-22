#!/usr/bin/env node
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const PHOTOS_DIR = 'photos';
const OUTPUT_FILE = 'photos.json';
const BATCH_SIZE = 300;

const IMAGE_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.avif', '.heic', '.heif', '.tif', '.tiff',
]);

function collectImages(dir) {
  const found = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
        found.push(full);
      }
    }
  }
  return found.sort();
}

function parseFilenameDate(filename) {
  const m = filename.match(
    /(?:^|\D)(20\d{2})(\d{2})(\d{2})(?:\D?(\d{2})(\d{2})(\d{2})?)?/
  );
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00', s = '00'] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

function readExif(files) {
  const baseArgs = [
    '-j',
    '-d', '%Y-%m-%dT%H:%M:%S',
    '-DateTimeOriginal',
    '-CreateDate',
    '-ModifyDate',
    '-Make',
    '-Model',
    '-ImageWidth',
    '-ImageHeight',
    '-Orientation#',
  ];

  const results = [];
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const chunk = files.slice(i, i + BATCH_SIZE);
    const raw = execFileSync('exiftool', [...baseArgs, ...chunk], {
      maxBuffer: 256 * 1024 * 1024,
    });
    results.push(...JSON.parse(raw.toString('utf8')));
  }
  return results;
}

const clean = (v) => (v == null ? '' : String(v).trim());

function main() {
  const files = collectImages(PHOTOS_DIR);

  if (files.length === 0) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ photos: [] }, null, 2));
    console.log('photos/ 为空，已写入空清单。');
    return;
  }

  const manifest = readExif(files).map((item) => {
    const src = item.SourceFile.split(path.sep).join('/');
    const filename = path.basename(src);

    const orientation = Number(item.Orientation) || 1;
    let width = item.ImageWidth || null;
    let height = item.ImageHeight || null;
    if (orientation >= 5 && orientation <= 8 && width && height) {
      [width, height] = [height, width];
    }

    const date =
      item.DateTimeOriginal ||
      item.CreateDate ||
      item.ModifyDate ||
      parseFilenameDate(filename) ||
      null;

    // 相机：Make + Model，避免重复（部分机型 Model 已含 Make）
    const make = clean(item.Make);
    const model = clean(item.Model);
    let camera = '';
    if (make && model) {
      camera = model.toLowerCase().startsWith(make.toLowerCase())
        ? model
        : `${make} ${model}`;
    } else {
      camera = make || model;
    }

    return { src, date, camera, width, height };
  });

  manifest.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date) || a.src.localeCompare(b.src);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.src.localeCompare(b.src);
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ photos: manifest }, null, 2));
  console.log(`已生成 ${OUTPUT_FILE}，共 ${manifest.length} 张。`);
}

main();