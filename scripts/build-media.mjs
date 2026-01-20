import fs from "fs";
import path from "path";
import sharp from "sharp";

const BASE = path.resolve("public/multimedia");
const PHOTOS_DIR = path.join(BASE, "photos");
const VIDEOS_DIR = path.join(BASE, "videos");
const OUT_JSON = path.join(BASE, "media.json");

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

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function isHiddenOrSystem(fileName) {
  return fileName.startsWith(".") || fileName === "Thumbs.db";
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => !isHiddenOrSystem(f))
    .filter((f) => fs.statSync(path.join(dir, f)).isFile());
}

function pad4(n) {
  return String(n).padStart(4, "0");
}

async function processPhotos() {
  ensureDir(PHOTOS_DIR);

  const files = listFiles(PHOTOS_DIR)
    .filter((f) => f !== "media.json")
    .sort((a, b) => a.localeCompare(b, "en"));

  const tempNames = [];

  for (const file of files) {
    const srcPath = path.join(PHOTOS_DIR, file);
    const ext = path.extname(file).toLowerCase();

    if (!IMAGE_EXTS.has(ext)) continue;

    const tmpName = `__tmp__${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}.webp`;
    const tmpPath = path.join(PHOTOS_DIR, tmpName);

    await sharp(srcPath).webp({ quality: 82 }).toFile(tmpPath);

    tempNames.push({ tmpPath, originalPath: srcPath });
  }

  for (const t of tempNames) {
    try {
      fs.unlinkSync(t.originalPath);
    } catch {}
  }

  const outputs = [];
  for (let i = 0; i < tempNames.length; i++) {
    const fileName = `${pad4(i + 1)}.webp`;
    const finalPath = path.join(PHOTOS_DIR, fileName);
    fs.renameSync(tempNames[i].tmpPath, finalPath);

    outputs.push({
      id: `p${i + 1}`,
      src: `photos/${fileName}`,
    });
  }

  const after = listFiles(PHOTOS_DIR);
  for (const f of after) {
    if (f === "media.json") continue;
    if (!/^\d{4}\.webp$/i.test(f)) {
      try {
        fs.unlinkSync(path.join(PHOTOS_DIR, f));
      } catch {}
    }
  }

  return outputs;
}

function processVideos() {
  ensureDir(VIDEOS_DIR);

  const files = listFiles(VIDEOS_DIR)
    .filter((f) => f !== "media.json")
    .sort((a, b) => a.localeCompare(b, "en"));

  const tempNames = [];
  for (const file of files) {
    const srcPath = path.join(VIDEOS_DIR, file);
    const ext = path.extname(file).toLowerCase();
    const tmpName = `__tmp__${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}${ext || ""}`;
    const tmpPath = path.join(VIDEOS_DIR, tmpName);

    fs.renameSync(srcPath, tmpPath);
    tempNames.push({ tmpPath, ext });
  }

  const outputs = [];
  for (let i = 0; i < tempNames.length; i++) {
    const ext = tempNames[i].ext || "";
    const fileName = `${pad4(i + 1)}${ext}`;
    const finalPath = path.join(VIDEOS_DIR, fileName);
    fs.renameSync(tempNames[i].tmpPath, finalPath);

    outputs.push({
      id: `v${i + 1}`,
      src: `videos/${fileName}`,
    });
  }

  const after = listFiles(VIDEOS_DIR);
  for (const f of after) {
    if (f === "media.json") continue;
    if (f.startsWith("__tmp__")) {
      try {
        fs.unlinkSync(path.join(VIDEOS_DIR, f));
      } catch {}
    }
  }

  return outputs;
}

async function main() {
  ensureDir(BASE);

  const photos = await processPhotos();
  const videos = processVideos();

  const data = { photos, videos };

  fs.writeFileSync(OUT_JSON, JSON.stringify(data, null, 2), "utf-8");
  console.log(`media.json generado: ${path.relative(process.cwd(), OUT_JSON)}`);
  console.log(`Fotos: ${photos.length} | 🎬 videos: ${videos.length}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
