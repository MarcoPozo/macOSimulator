import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT_DIR = path.resolve("public/wallpapers");
const UPLOADS_DIR = path.resolve("public/_uploads/_wallpapers");
const JSON_OUT = path.join(OUT_DIR, "wallpapers.json");

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
]);

function isHiddenOrSystem(name) {
  return name.startsWith(".") || name === "Thumbs.db";
}

function pad4(n) {
  return String(n).padStart(4, "0");
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => !isHiddenOrSystem(f))
    .filter((f) => fs.statSync(path.join(dir, f)).isFile());
}

function isStandardOut(name) {
  return /^\d{4}\.webp$/i.test(name);
}

function ensureDirs() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
}

function safeCopy(src, dest) {
  fs.copyFileSync(src, dest);
}

async function toWebp(srcAbs, destAbs, quality = 85) {
  await sharp(srcAbs).rotate().webp({ quality }).toFile(destAbs);
}

async function main() {
  ensureDirs();

  // 1) Detecta wallpapers existentes ya estandarizados
  const existingStd = listFiles(OUT_DIR)
    .filter(isStandardOut)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // 2) Detecta nuevos uploads (cualquier imagen)
  const uploads = listFiles(UPLOADS_DIR)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (existingStd.length === 0 && uploads.length === 0) {
    fs.writeFileSync(JSON_OUT, JSON.stringify([], null, 2), "utf-8");
    console.log(
      "No hay wallpapers existentes ni uploads. JSON generado vacío.",
    );
    return;
  }

  if (uploads.length === 0) {
    const data = existingStd.map((f, i) => ({
      id: `w${i + 1}`,
      src: `wallpapers/${f}`,
    }));
    fs.writeFileSync(JSON_OUT, JSON.stringify(data, null, 2), "utf-8");
    console.log(
      `Sin uploads. JSON actualizado con ${existingStd.length} items.`,
    );
    return;
  }

  console.log(
    `Existentes: ${existingStd.length} | Nuevos uploads: ${uploads.length}`,
  );

  // 3) Construye un STAGING con TODO
  const STAGING = path.resolve("public/wallpapers.__staging__");
  fs.rmSync(STAGING, { recursive: true, force: true });
  fs.mkdirSync(STAGING, { recursive: true });

  let index = 1;

  // 3a) Copia existentes al staging, renumerando
  for (const fileName of existingStd) {
    const srcAbs = path.join(OUT_DIR, fileName);
    const outName = `${pad4(index)}.webp`;
    const destAbs = path.join(STAGING, outName);

    safeCopy(srcAbs, destAbs);
    index++;
  }

  // 3b) Convierte uploads a webp y los agrega al staging al final
  for (const upName of uploads) {
    const srcAbs = path.join(UPLOADS_DIR, upName);
    const outName = `${pad4(index)}.webp`;
    const destAbs = path.join(STAGING, outName);

    await toWebp(srcAbs, destAbs, 85);

    index++;
  }

  const total = index - 1;

  // 4) Genera wallpapers.json en staging
  const data = Array.from({ length: total }, (_, i) => {
    const fileName = `${pad4(i + 1)}.webp`;
    return { id: `w${i + 1}`, src: `wallpapers/${fileName}` };
  });

  fs.writeFileSync(
    path.join(STAGING, "wallpapers.json"),
    JSON.stringify(data, null, 2),
    "utf-8",
  );

  // 5) Publica: borra salida controlada y copia staging
  const outControlled = listFiles(OUT_DIR).filter(
    (f) => f === "wallpapers.json" || isStandardOut(f),
  );

  for (const f of outControlled) {
    safeUnlink(path.join(OUT_DIR, f));
  }

  for (const f of listFiles(STAGING)) {
    safeCopy(path.join(STAGING, f), path.join(OUT_DIR, f));
  }

  // 6) Limpia uploads
  for (const f of uploads) {
    safeUnlink(path.join(UPLOADS_DIR, f));
  }

  // 7) Limpia staging
  fs.rmSync(STAGING, { recursive: true, force: true });

  console.log(`✅ Wallpapers totales: ${total}`);
  console.log(`✅ JSON: ${path.relative(process.cwd(), JSON_OUT)}`);
  console.log(`✅ Uploads procesados y limpiados: ${uploads.length}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
