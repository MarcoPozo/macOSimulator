import path from "path";
import fs from "fs-extra";
import { globby } from "globby";
import sharp from "sharp";

const ROOT = process.cwd();

const OUT_BASE = path.resolve(ROOT, "public/multimedia");
const OUT_PHOTOS = path.join(OUT_BASE, "photos");
const OUT_VIDEOS = path.join(OUT_BASE, "videos");
const OUT_JSON = path.join(OUT_BASE, "media.json");

const UPLOADS_DIR = path.resolve(ROOT, "public/_uploads/_multimedia");

const STAGING = path.resolve(ROOT, "public/multimedia.__staging__");
const STAGING_PHOTOS = path.join(STAGING, "photos");
const STAGING_VIDEOS = path.join(STAGING, "videos");
const STAGING_JSON = path.join(STAGING, "media.json");

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

const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"]);

const reStdPhoto = /^\d{4}\.webp$/i;
const reStdVideo = /^\d{4}\.[a-z0-9]+$/i;

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
  await fs.ensureDir(OUT_BASE);
  await fs.ensureDir(OUT_PHOTOS);
  await fs.ensureDir(OUT_VIDEOS);
  await fs.ensureDir(UPLOADS_DIR);

  // EXISTENTES (solo los estandarizados)
  const existingPhotos = (await listDirFiles(OUT_PHOTOS))
    .filter((f) => reStdPhoto.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const existingVideos = (await listDirFiles(OUT_VIDEOS))
    .filter((f) => reStdVideo.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // UPLOADS (mezclados)
  const uploadAbs = await globby(["**/*"], {
    cwd: UPLOADS_DIR,
    onlyFiles: true,
    dot: false,
    expandDirectories: false,
    followSymbolicLinks: false,
  });

  const uploads = uploadAbs
    .map((rel) => path.join(UPLOADS_DIR, rel))
    .filter((abs) => {
      const base = path.basename(abs);
      return !(base.startsWith(".") || base === "Thumbs.db");
    });

  const uploadImages = [];
  const uploadVideos = [];

  for (const abs of uploads) {
    const ext = path.extname(abs).toLowerCase();
    if (IMAGE_EXTS.has(ext)) uploadImages.push(abs);
    else if (VIDEO_EXTS.has(ext)) uploadVideos.push(abs);
  }

  console.log(
    `Existentes → Fotos: ${existingPhotos.length} | Videos: ${existingVideos.length}`,
  );
  console.log(
    `Uploads → Fotos: ${uploadImages.length} | Videos: ${uploadVideos.length}`,
  );

  // Si no hay nada, igual genera JSON vacío
  if (
    existingPhotos.length === 0 &&
    existingVideos.length === 0 &&
    uploadImages.length === 0 &&
    uploadVideos.length === 0
  ) {
    await fs.outputJson(OUT_JSON, { photos: [], videos: [] }, { spaces: 2 });
    console.log("No hay multimedia existente ni uploads. JSON generado vacío.");
    return;
  }

  // STAGING limpio
  await fs.remove(STAGING);
  await fs.ensureDir(STAGING_PHOTOS);
  await fs.ensureDir(STAGING_VIDEOS);

  let pIndex = 1;

  for (const file of existingPhotos) {
    const srcAbs = path.join(OUT_PHOTOS, file);
    const outName = `${pad4(pIndex)}.webp`;
    const destAbs = path.join(STAGING_PHOTOS, outName);
    await fs.copy(srcAbs, destAbs);
    pIndex++;
  }

  for (const abs of uploadImages.sort((a, b) => a.localeCompare(b))) {
    const outName = `${pad4(pIndex)}.webp`;
    const destAbs = path.join(STAGING_PHOTOS, outName);

    await sharp(abs).rotate().webp({ quality: 82 }).toFile(destAbs);
    pIndex++;
  }

  const photosTotal = pIndex - 1;

  let vIndex = 1;

  for (const file of existingVideos) {
    const srcAbs = path.join(OUT_VIDEOS, file);
    const ext = path.extname(file).toLowerCase();
    const outName = `${pad4(vIndex)}${ext}`;
    const destAbs = path.join(STAGING_VIDEOS, outName);
    await fs.copy(srcAbs, destAbs);
    vIndex++;
  }

  for (const abs of uploadVideos.sort((a, b) => a.localeCompare(b))) {
    const ext = path.extname(abs).toLowerCase();
    const safeExt = ext && ext.length <= 6 ? ext : ".mp4";
    const outName = `${pad4(vIndex)}${safeExt}`;
    const destAbs = path.join(STAGING_VIDEOS, outName);
    await fs.copy(abs, destAbs);
    vIndex++;
  }

  const videosTotal = vIndex - 1;

  // JSON
  const photos = Array.from({ length: photosTotal }, (_, i) => {
    const file = `${pad4(i + 1)}.webp`;
    return { id: `p${i + 1}`, src: toPosix(`photos/${file}`) };
  });

  // Para videos, mantenemos la extensión real que quedó en staging
  const stagedVideoFiles = (await listDirFiles(STAGING_VIDEOS))
    .filter((f) => reStdVideo.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const videos = stagedVideoFiles.map((f, i) => ({
    id: `v${i + 1}`,
    src: toPosix(`videos/${f}`),
  }));

  await fs.outputJson(STAGING_JSON, { photos, videos }, { spaces: 2 });

  // Limpia salida controlada y copia staging
  const outPhotosFiles = await listDirFiles(OUT_PHOTOS);
  for (const f of outPhotosFiles) {
    if (reStdPhoto.test(f)) await fs.remove(path.join(OUT_PHOTOS, f));
  }

  // Videos: solo borra los estandarizados
  const outVideoFiles = await listDirFiles(OUT_VIDEOS);
  for (const f of outVideoFiles) {
    if (reStdVideo.test(f)) await fs.remove(path.join(OUT_VIDEOS, f));
  }

  // JSON
  await fs.remove(OUT_JSON);

  // Copia staging
  await fs.copy(STAGING_PHOTOS, OUT_PHOTOS);
  await fs.copy(STAGING_VIDEOS, OUT_VIDEOS);
  await fs.copy(STAGING_JSON, OUT_JSON);

  // Limpiar Uploads
  const processed = [...uploadImages, ...uploadVideos];
  for (const abs of processed) {
    await fs.remove(abs);
  }

  // Limpiar Staging
  await fs.remove(STAGING);

  console.log(`✅ Fotos totales: ${photos.length}`);
  console.log(`✅ Videos totales: ${videos.length}`);
  console.log(`✅ JSON: ${toPosix(path.relative(ROOT, OUT_JSON))}`);
  console.log(`✅ Uploads limpiados: ${processed.length}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
