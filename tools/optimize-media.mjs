import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

const rootDir = process.cwd();
const cachePath = path.join(rootDir, ".media-cache.json");

const videoTranscodeTargets = [
  "video/Брендинг/брендинг главная анимация.MP4",
  "video/Брендинг/нейминг.MP4",
  "video/Брендинг/фирменный стиль.MP4",
  "video/Брендинг/брендбук.MP4",
  "video/Коммуникации/креативы.MP4",
  "video/Коммуникации/оформление соц сетей.MP4",
  "video/Коммуникации/продакшн.MP4",
  "video/Сайты/лендосы.MP4",
  "video/Сайты/многостраничник.MP4",
  "video/Сайты/UI.MP4",
  "gif/branding.MP4",
];

const videoConvertTargets = [
  ["video/Брендинг/лого.MOV", "video/Брендинг/лого.mp4"],
  [
    "video/Коммуникации/коммуникации главная анимация.MOV",
    "video/Коммуникации/коммуникации главная анимация.mp4",
  ],
  ["video/Сайты/сайты главная анимация.MOV", "video/Сайты/сайты главная анимация.mp4"],
  ["gif/кружка брендинг.gif", "gif/кружка брендинг.mp4"],
  ["gif/коммуникации гиф.gif", "gif/коммуникации гиф.mp4"],
  ["gif/сайты гиф.gif", "gif/сайты гиф.mp4"],
];

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function statOrNull(filePath) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

async function loadCache() {
  try {
    return JSON.parse(await fs.readFile(cachePath, "utf8"));
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2));
}

function runFfmpeg(args) {
  const result = spawnSync(ffmpegPath, args, {
    cwd: rootDir,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    if (result.stderr) {
      console.error(result.stderr);
    }
    throw new Error(`ffmpeg exited with code ${result.status}`);
  }
}

async function optimizeMp4InPlace(relativePath, cache) {
  const absolutePath = path.join(rootDir, relativePath);
  const sourceStat = await statOrNull(absolutePath);

  if (!sourceStat) {
    return null;
  }

  const cached = cache[relativePath];
  if (cached?.mtimeMs === sourceStat.mtimeMs && cached?.size === sourceStat.size) {
    return {
      type: "video",
      file: relativePath,
      before: sourceStat.size,
      after: sourceStat.size,
      skipped: true,
    };
  }

  const tempPath = `${absolutePath}.tmp.mp4`;
  const args = [
    "-y",
    "-i",
    absolutePath,
    "-map_metadata",
    "-1",
    "-movflags",
    "+faststart",
    "-pix_fmt",
    "yuv420p",
    "-vf",
    "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "23",
    "-an",
    tempPath,
  ];

  runFfmpeg(args);

  const tempStat = await fs.stat(tempPath);
  if (tempStat.size < sourceStat.size) {
    await fs.rename(tempPath, absolutePath);
    const finalStat = await fs.stat(absolutePath);
    cache[relativePath] = {
      mtimeMs: finalStat.mtimeMs,
      size: finalStat.size,
    };
    return {
      type: "video",
      file: relativePath,
      before: sourceStat.size,
      after: finalStat.size,
    };
  }

  await fs.unlink(tempPath);
  cache[relativePath] = {
    mtimeMs: sourceStat.mtimeMs,
    size: sourceStat.size,
  };
  return {
    type: "video",
    file: relativePath,
    before: sourceStat.size,
    after: sourceStat.size,
    skipped: true,
  };
}

async function convertToMp4(inputRelativePath, outputRelativePath) {
  const inputPath = path.join(rootDir, inputRelativePath);
  const outputPath = path.join(rootDir, outputRelativePath);
  const sourceStat = await statOrNull(inputPath);

  if (!sourceStat) {
    return null;
  }

  const outputStat = await statOrNull(outputPath);
  if (outputStat && outputStat.mtimeMs >= sourceStat.mtimeMs) {
    return {
      type: "video",
      file: outputRelativePath,
      before: sourceStat.size,
      after: outputStat.size,
      skipped: true,
    };
  }

  await ensureDir(outputPath);
  const tempPath = outputPath.replace(/\.mp4$/i, ".tmp.mp4");
  const args = [
    "-y",
    "-i",
    inputPath,
    "-map_metadata",
    "-1",
    "-movflags",
    "+faststart",
    "-pix_fmt",
    "yuv420p",
    "-vf",
    "fps=25,scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "23",
    "-an",
    tempPath,
  ];

  runFfmpeg(args);
  await fs.rename(tempPath, outputPath);
  const finalStat = await fs.stat(outputPath);
  return {
    type: "video",
    file: outputRelativePath,
    before: sourceStat.size,
    after: finalStat.size,
  };
}

async function listPngFiles(relativeDir) {
  const dirPath = path.join(rootDir, relativeDir);
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".png")
    .map((entry) => path.join(relativeDir, entry.name));
}

async function createLosslessWebp(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  const outputPath = absolutePath.replace(/\.png$/i, ".webp");
  const sourceStat = await statOrNull(absolutePath);

  if (!sourceStat) {
    return null;
  }

  const outputStat = await statOrNull(outputPath);
  if (outputStat && outputStat.mtimeMs >= sourceStat.mtimeMs) {
    return {
      type: "image",
      file: path.relative(rootDir, outputPath),
      before: sourceStat.size,
      after: outputStat.size,
      skipped: true,
    };
  }

  const tempPath = `${outputPath}.tmp`;
  await sharp(absolutePath).webp({ lossless: true, effort: 6 }).toFile(tempPath);
  const tempStat = await fs.stat(tempPath);

  if (tempStat.size < sourceStat.size) {
    await fs.rename(tempPath, outputPath);
    return {
      type: "image",
      file: path.relative(rootDir, outputPath),
      before: sourceStat.size,
      after: tempStat.size,
    };
  }

  await fs.unlink(tempPath);
  return {
    type: "image",
    file: relativePath,
    before: sourceStat.size,
    after: sourceStat.size,
    skipped: true,
  };
}

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function printSummary(results) {
  const filtered = results.filter(Boolean);
  const savedBytes = filtered.reduce((total, item) => total + Math.max(item.before - item.after, 0), 0);

  console.log("");
  console.log("Optimization summary:");
  for (const item of filtered) {
    const delta = item.before - item.after;
    const suffix = item.skipped ? " (left as-is)" : "";
    console.log(
      `- ${item.file}: ${formatSize(item.before)} -> ${formatSize(item.after)}${delta > 0 ? `, saved ${formatSize(delta)}` : ""}${suffix}`
    );
  }
  console.log(`Total saved: ${formatSize(savedBytes)}`);
}

async function main() {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static did not provide a binary for this platform.");
  }

  const cache = await loadCache();
  const pngFiles = await listPngFiles("img");
  const imageResults = [];
  for (const relativePath of pngFiles) {
    imageResults.push(await createLosslessWebp(relativePath));
  }

  const videoResults = [];
  for (const relativePath of videoTranscodeTargets) {
    videoResults.push(await optimizeMp4InPlace(relativePath, cache));
  }

  for (const [inputRelativePath, outputRelativePath] of videoConvertTargets) {
    videoResults.push(await convertToMp4(inputRelativePath, outputRelativePath));
  }

  printSummary([...imageResults, ...videoResults]);
  await saveCache(cache);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
