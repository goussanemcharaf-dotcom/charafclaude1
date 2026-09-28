// Resolves a full ffmpeg build (x264/x265/prores/loudnorm): $FFMPEG, the
// imageio-ffmpeg wheel (pip install imageio-ffmpeg), or ffmpeg on PATH.
import { execSync } from 'node:child_process';
function find() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { return execSync('python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch {}
  return 'ffmpeg';
}
export const FFMPEG = find();
