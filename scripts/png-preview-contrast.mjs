import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';

// Tiny PNG reader for comparing two headless-Chrome captures without extra packages.
function pixels(data) {
  const signature = '89504e470d0a1a0a';
  if (data.subarray(0, 8).toString('hex') !== signature) throw Error('Not PNG');
  let width = 0, height = 0, channels = 0, compression = [], offset = 8;
  while (offset + 12 <= data.length) {
    const size = data.readUInt32BE(offset);
    const type = data.toString('ascii', offset + 4, offset + 8);
    const chunk = data.subarray(offset + 8, offset + 8 + size);
    if (type === 'IHDR') {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      if (chunk[8] !== 8 || ![2, 6].includes(chunk[9]) || chunk[12] !== 0) {
        throw Error('Unsupported PNG pixel format');
      }
      channels = chunk[9] === 6 ? 4 : 3;
    }
    if (type === 'IDAT') compression.push(chunk);
    offset += 12 + size;
    if (type === 'IEND') break;
  }
  if (!width || !height || width * height > 2500000) throw Error('Unreasonable PNG size');
  const raw = inflateSync(Buffer.concat(compression));
  const stride = width * channels;
  const output = Buffer.allocUnsafe(stride * height);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    for (let x = 0; x < stride; x++) {
      const value = raw[src++];
      const left = x >= channels ? output[y * stride + x - channels] : 0;
      const up = y ? output[(y - 1) * stride + x] : 0;
      const upperLeft = y && x >= channels ? output[(y - 1) * stride + x - channels] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upperLeft;
        const a = Math.abs(p - left), b = Math.abs(p - up), c = Math.abs(p - upperLeft);
        predictor = a <= b && a <= c ? left : b <= c ? up : upperLeft;
      } else if (filter !== 0) throw Error('Invalid PNG scanline filter');
      output[y * stride + x] = (value + predictor) & 255;
    }
  }
  return { width, height, channels, output };
}

export async function imageDifference(fileA, fileB) {
  try {
    const [a, b] = await Promise.all([readFile(fileA).then(pixels), readFile(fileB).then(pixels)]);
    if (a.width !== b.width || a.height !== b.height) return 0;
    let difference = 0, samples = 0;
    for (let y = 24; y < a.height - 20; y += 8) {
      for (let x = 16; x < a.width - 16; x += 8) {
        const aa = (y * a.width + x) * a.channels;
        const bb = (y * b.width + x) * b.channels;
        // Ignore alpha and compare visual RGB distance, not compressed file sizes.
        difference += (Math.abs(a.output[aa] - b.output[bb]) +
          Math.abs(a.output[aa + 1] - b.output[bb + 1]) +
          Math.abs(a.output[aa + 2] - b.output[bb + 2])) / 3;
        samples++;
      }
    }
    return samples ? difference / samples : 0;
  } catch (error) {
    console.warn('Could not compare preview themes:', error.message);
    return 0;
  }
}
