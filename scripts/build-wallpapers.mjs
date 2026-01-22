import path from "path";
import fs from "fs-extra";
import { globby } from "globby";
import sharp from "sharp";

const ROOT = process.cwd();

const OUT_DIR = path.resolve(ROOT, "public/wallpapers");
const UPLOADS_DIR = path.resolve(ROOT, "public/_uploads/_wallpapers");
const JSON_OUT = path.join(OUT_DIR, "wallpapers.json");

const STAGING = path.resolve(ROOT, "public/wallpapers.__staging__");
const STAGING_JSON = path.join(STAGING, "wallpapers.json");

const IMAGE_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".tif",
  ".tiff",
  ".bmp",
  ".avif",
  ".heic",
  ".heif",
]);

const reStdOut = /^\d{4}\.webp$/i;

const pad4 = (n) => String(n).padStart(4, "0");
const toPosix = (p) => p.replace(/\\/g, "/");

async function listDirFiles(dirAbs) {
  if (!(await fs.pathExists(dirAbs))) return [];
  const entries = await fs.readdir(dirAbs);
  const out = [];
  for (const name of entries) {
    if (name.startsWith(".") || name === "Thumbs.db") continue;
    const abs = path.join(dirAbs, name);
    const st = await fs.stat(abs);
    if (st.isFile()) out.push(name);
  }
  return out;
}

async function main() {
  await fs.ensureDir(OUT_DIR);
  await fs.ensureDir(UPLOADS_DIR);

  const existingStd = (await listDirFiles(OUT_DIR))
    .filter((f) => reStdOut.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const uploadRel = await globby(["**/*"], {
    cwd: UPLOADS_DIR,
    onlyFiles: true,
    dot: false,
    followSymbolicLinks: false,
  });

  const uploads = uploadRel
    .map((rel) => path.join(UPLOADS_DIR, rel))
    .filter((abs) => {
      const base = path.basename(abs);
      if (base.startsWith(".") || base === "Thumbs.db") return false;
      return IMAGE_EXTS.has(path.extname(abs).toLowerCase());
    })
    .sort((a, b) => a.localeCompare(b));

  if (existingStd.length === 0 && uploads.length === 0) {
    await fs.outputJson(JSON_OUT, [], { spaces: 2 });
    console.log(
      "No hay wallpapers existentes ni uploads. JSON generado vacío.",
    );
    return;
  }

  console.log(
    `Existentes: ${existingStd.length} | Nuevos uploads: ${uploads.length}`,
  );

  // Staging limpio
  await fs.remove(STAGING);
  await fs.ensureDir(STAGING);

  let index = 1;

  for (const f of existingStd) {
    const srcAbs = path.join(OUT_DIR, f);
    const outName = `${pad4(index)}.webp`;
    const destAbs = path.join(STAGING, outName);
    await fs.copy(srcAbs, destAbs);
    index++;
  }

  // Uploads
  for (const abs of uploads) {
    const outName = `${pad4(index)}.webp`;
    const destAbs = path.join(STAGING, outName);
    await sharp(abs).rotate().webp({ quality: 85 }).toFile(destAbs);
    index++;
  }

  const total = index - 1;

  const data = Array.from({ length: total }, (_, i) => {
    const fileName = `${pad4(i + 1)}.webp`;
    return { id: `w${i + 1}`, src: toPosix(`wallpapers/${fileName}`) };
  });

  await fs.outputJson(STAGING_JSON, data, { spaces: 2 });

  // Borra solo salida controlada
  const outFiles = await listDirFiles(OUT_DIR);
  for (const f of outFiles) {
    if (f === "wallpapers.json" || reStdOut.test(f)) {
      await fs.remove(path.join(OUT_DIR, f));
    }
  }

  // copia staging
  const stagingFiles = await listDirFiles(STAGING);
  for (const f of stagingFiles) {
    await fs.copy(path.join(STAGING, f), path.join(OUT_DIR, f));
  }

  // limpia uploads procesados
  for (const abs of uploads) {
    await fs.remove(abs);
  }

  // limpia staging
  await fs.remove(STAGING);

  console.log(`✅ Wallpapers totales: ${total}`);
  console.log(`✅ JSON: ${toPosix(path.relative(ROOT, JSON_OUT))}`);
  console.log(`✅ Uploads procesados y limpiados: ${uploads.length}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
