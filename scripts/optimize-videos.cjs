/* One-off: re-encode the demo videos web-optimized (≤1080p, H.264, +faststart,
   no audio). Originals are backed up to public/videos/_originals/ (gitignored).
   Run: node scripts/optimize-videos.cjs */
const { execFileSync } = require("child_process")
const ffmpeg = require("ffmpeg-static")
const fs = require("fs")
const path = require("path")

const dir = path.join(process.cwd(), "public", "videos")
const backupDir = path.join(dir, "_originals")
fs.mkdirSync(backupDir, { recursive: true })

const files = ["behavioural.mp4", "coffee-chats.mp4", "technical.mp4"]

for (const f of files) {
  const src = path.join(dir, f)
  if (!fs.existsSync(src)) { console.log("skip (missing):", f); continue }

  const backup = path.join(backupDir, f)
  if (!fs.existsSync(backup)) fs.copyFileSync(src, backup)

  const tmp = path.join(dir, `tmp-${f}`)
  const before = fs.statSync(backup).size
  console.log(`encoding ${f} (${(before / 1e6).toFixed(1)}MB)…`)

  execFileSync(ffmpeg, [
    "-y", "-i", backup,
    "-vf", "scale='min(1920,iw)':'-2'",
    "-c:v", "libx264", "-crf", "30", "-preset", "medium",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    tmp,
  ], { stdio: ["ignore", "ignore", "inherit"] })

  fs.renameSync(tmp, src)
  const after = fs.statSync(src).size
  console.log(`  done ${f}: ${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB`)
}
console.log("ALL DONE")
