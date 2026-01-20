import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = path.resolve("public/wallpapers");
const JSON_OUT = path.join(DIR, "wallpapers.json");

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

function isTmp(name) {
  return name.startsWith("__tmp__");
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true });

  const candidates = listFiles(DIR)
    .filter((f) => f !== "wallpapers.json")
    .filter((f) => !isTmp(f))
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "en"));

  if (candidates.length === 0) {
    fs.writeFileSync(JSON_OUT, JSON.stringify([], null, 2), "utf-8");
    console.log(
      "No hay imágenes en wallpapers/. wallpapers.json generado vacío.",
    );
    return;
  }

  const temps = [];
  for (const file of candidates) {
    const srcPath = path.join(DIR, file);

    const tmpName = `__tmp__${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}.webp`;
    const tmpPath = path.join(DIR, tmpName);

    await sharp(srcPath).webp({ quality: 85 }).toFile(tmpPath);

    temps.push({ tmpPath, originalPath: srcPath });
  }

  for (const t of temps) {
    try {
      fs.unlinkSync(t.originalPath);
    } catch {}
  }

  const data = [];
  for (let i = 0; i < temps.length; i++) {
    const fileName = `${pad4(i + 1)}.webp`;
    const finalPath = path.join(DIR, fileName);

    fs.renameSync(temps[i].tmpPath, finalPath);

    data.push({
      id: `w${i + 1}`,
      src: `wallpapers/${fileName}`,
    });
  }

  for (const f of listFiles(DIR)) {
    if (f === "wallpapers.json") continue;
    if (!/^\d{4}\.webp$/i.test(f)) {
      try {
        fs.unlinkSync(path.join(DIR, f));
      } catch {}
    }
  }

  fs.writeFileSync(JSON_OUT, JSON.stringify(data, null, 2), "utf-8");

  console.log(`✔ Wallpapers generados: ${data.length}`);
  console.log(`✔ JSON: ${path.relative(process.cwd(), JSON_OUT)}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
