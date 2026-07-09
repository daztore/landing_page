import { promises as fs } from "node:fs"
import path from "node:path"

import sharp from "sharp"

const publicDir = path.join(process.cwd(), "public")
const brandDir = path.join(publicDir, "brand")

const colors = {
  ivory: "#fff8f3",
  ivorySoft: "#f8ede3",
  sand: "#ead4c3",
  taupe: "#d9b8a0",
  bronze: "#c49476",
  brown: "#8e6249",
  rose: "#b8896b",
}

function monogramBody() {
  return `
    <rect width="512" height="512" rx="136" fill="${colors.ivory}" />
    <rect x="24" y="24" width="464" height="464" rx="122" fill="none" stroke="${colors.sand}" stroke-width="6" />
    <circle cx="256" cy="250" r="154" fill="#fffdfa" stroke="${colors.ivorySoft}" stroke-width="14" />
    <circle cx="256" cy="250" r="158" fill="none" stroke="${colors.taupe}" stroke-width="4" stroke-dasharray="2 16" opacity="0.9" />

    <g fill="${colors.bronze}" opacity="0.96">
      <ellipse cx="334" cy="158" rx="26" ry="44" transform="rotate(-24 334 158)" />
      <ellipse cx="378" cy="174" rx="24" ry="40" transform="rotate(14 378 174)" />
      <ellipse cx="354" cy="210" rx="22" ry="36" transform="rotate(48 354 210)" />
      <circle cx="356" cy="178" r="18" fill="${colors.rose}" />
      <circle cx="336" cy="190" r="10" fill="${colors.ivory}" opacity="0.95" />
    </g>

    <g fill="none" stroke="${colors.rose}" stroke-width="4" stroke-linecap="round" opacity="0.72">
      <path d="M313 205c18-28 28-54 26-82" />
      <path d="M341 218c22-20 42-34 65-44" />
    </g>

    <text
      x="252"
      y="338"
      text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif"
      font-size="220"
      font-weight="700"
      fill="${colors.brown}"
    >D</text>
  `
}

function monogramSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Daztore.id monogram">
      ${monogramBody()}
    </svg>
  `
}

function logoSourceSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="Daztore.id brand logo">
      <rect width="1024" height="1024" rx="220" fill="${colors.ivory}" />
      <g transform="translate(256 126)">
        ${monogramBody()}
      </g>
      <text
        x="512"
        y="808"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="108"
        letter-spacing="6"
        fill="${colors.brown}"
      >DAZTORE.ID</text>
      <text
        x="512"
        y="874"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="34"
        letter-spacing="4"
        fill="${colors.rose}"
      >MAHAR, SESERAHAN, BOUQUET &amp; GIFT CUSTOM</text>
    </svg>
  `
}

function ogImageSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Daztore.id social preview image">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${colors.ivory}" />
          <stop offset="100%" stop-color="${colors.ivorySoft}" />
        </linearGradient>
      </defs>

      <rect width="1200" height="630" fill="url(#bg)" />
      <circle cx="1074" cy="96" r="92" fill="${colors.sand}" opacity="0.35" />
      <circle cx="104" cy="546" r="120" fill="${colors.sand}" opacity="0.22" />
      <rect x="82" y="68" width="1036" height="494" rx="42" fill="none" stroke="${colors.sand}" stroke-width="2" opacity="0.8" />

      <g transform="translate(118 130) scale(0.86)">
        ${monogramBody()}
      </g>

      <g transform="translate(478 154)">
        <text
          x="0"
          y="0"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="82"
          font-weight="700"
          fill="${colors.brown}"
        >Daztore.id</text>

        <text
          x="0"
          y="86"
          font-family="Arial, Helvetica, sans-serif"
          font-size="34"
          fill="${colors.rose}"
        >Mahar, Seserahan,</text>

        <text
          x="0"
          y="136"
          font-family="Arial, Helvetica, sans-serif"
          font-size="34"
          fill="${colors.rose}"
        >Bouquet &amp; Gift Custom</text>

        <line x1="0" y1="186" x2="398" y2="186" stroke="${colors.taupe}" stroke-width="4" />
      </g>
    </svg>
  `
}

function wrapPngAsIco(pngBuffer) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)

  const directory = Buffer.alloc(16)
  directory.writeUInt8(32, 0)
  directory.writeUInt8(32, 1)
  directory.writeUInt8(0, 2)
  directory.writeUInt8(0, 3)
  directory.writeUInt16LE(1, 4)
  directory.writeUInt16LE(32, 6)
  directory.writeUInt32LE(pngBuffer.length, 8)
  directory.writeUInt32LE(header.length + directory.length, 12)

  return Buffer.concat([header, directory, pngBuffer])
}

async function ensureDirs() {
  await fs.mkdir(brandDir, { recursive: true })
}

async function writeMonogramPng(filename, size) {
  const target = path.join(brandDir, filename)
  const buffer = await sharp(Buffer.from(monogramSvg()))
    .resize(size, size)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer()

  await fs.writeFile(target, buffer)
  return buffer
}

async function main() {
  await ensureDirs()

  await fs.writeFile(path.join(brandDir, "daztore-logo-original.svg"), logoSourceSvg())

  const icon32 = await writeMonogramPng("icon-32.png", 32)
  await writeMonogramPng("icon-192.png", 192)
  await writeMonogramPng("icon-512.png", 512)
  await fs.writeFile(
    path.join(brandDir, "apple-touch-icon.png"),
    await sharp(Buffer.from(monogramSvg())).resize(180, 180).png({ compressionLevel: 9 }).toBuffer(),
  )

  const favicon = wrapPngAsIco(icon32)
  await fs.writeFile(path.join(brandDir, "favicon.ico"), favicon)
  await fs.copyFile(path.join(brandDir, "favicon.ico"), path.join(publicDir, "favicon.ico"))
  await fs.copyFile(
    path.join(brandDir, "apple-touch-icon.png"),
    path.join(publicDir, "apple-touch-icon.png"),
  )

  await fs.writeFile(
    path.join(brandDir, "og-image.jpg"),
    await sharp(Buffer.from(ogImageSvg())).jpeg({ quality: 84, mozjpeg: true }).toBuffer(),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
