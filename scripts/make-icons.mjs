// Gera ícones PNG simples (botão de costura laranja sobre fundo marrom).
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

function crc32(buf) {
  let c, crc = 0xffffffff
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function png(size) {
  const raw = Buffer.alloc((size * 3 + 1) * size)
  const c = size / 2, r = size * 0.34, hole = size * 0.045, off = size * 0.09
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0
    for (let x = 0; x < size; x++) {
      let col = [0x4a, 0x35, 0x26]
      const d = Math.hypot(x - c, y - c)
      if (d < r) col = [0xe0, 0x8a, 0x4e]
      if (d < r * 0.82 && d > r * 0.72) col = [0xf3, 0xb3, 0x85]
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        if (Math.hypot(x - (c + dx * off), y - (c + dy * off)) < hole) col = [0x4a, 0x35, 0x26]
      }
      const i = y * (size * 3 + 1) + 1 + x * 3
      raw[i] = col[0]; raw[i + 1] = col[1]; raw[i + 2] = col[2]
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ])
}
for (const s of [192, 512]) writeFileSync(`public/icon-${s}.png`, png(s))
