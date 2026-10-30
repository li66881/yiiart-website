import { createHash } from "node:crypto"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import sharp from "sharp"

const directory = "public/images/product-finishes"
await mkdir(`${directory}/thumbnails`, { recursive: true })
const manifest = {}
let originalBytes = 0
let thumbnailBytes = 0
for (const name of (await readdir(directory)).filter((name) => name.endsWith(".webp")).sort()) {
  const input = await readFile(`${directory}/${name}`)
  const output = await sharp(input).rotate().resize({ width: 176, height: 176, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
  const hash = createHash("sha256").update(output).digest("hex").slice(0, 16)
  const thumbnail = `${name.slice(0, -5)}-${hash}.webp`
  await writeFile(`${directory}/thumbnails/${thumbnail}`, output)
  manifest[`/images/product-finishes/${name}`] = `/images/product-finishes/thumbnails/${thumbnail}`
  originalBytes += input.length
  thumbnailBytes += output.length
}
await writeFile("src/lib/storefront/finish-thumbnails.json", `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({ images: Object.keys(manifest).length, originalBytes, thumbnailBytes }))
