/**
 * extractVideoFrames
 *
 * An async generator that takes a video File/Blob and yields one
 * 2D array per frame: rows[y][x] = [r, g, b]
 *
 * Because browsers don't let you step through a video's actual encoded
 * frames on demand, this samples the video at a fixed rate (fps) by
 * seeking to successive timestamps and reading back the canvas pixels.
 * If you want the video's *real* frame rate, pass it in via `fps`.
 *
 * @param {File|Blob} file - the video file
 * @param {Object} [options]
 * @param {number} [options.fps=10] - how many frames per second to sample
 * @param {number} [options.maxFrames=Infinity] - cap on number of frames
 * @param {number} [options.width] - optional resize width (defaults to native)
 * @param {number} [options.height] - optional resize height (defaults to native)
 * @yields {{ index: number, time: number, width: number, height: number, pixels: number[][][] }}
 */
export async function* extractVideoFrames(file, options = {}) {
  const { fps = 10, maxFrames = Infinity } = options;

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;

  const url = URL.createObjectURL(file);
  video.src = url;

  try {
    // Wait for metadata so we know duration/dimensions
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video metadata"));
    });

    const width = options.width || video.videoWidth;
    const height = options.height || video.videoHeight;
    const duration = video.duration;
    const interval = 1 / fps;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let frameIndex = 0;

    for (let t = 0; t < duration && frameIndex < maxFrames; t += interval) {
      // Seek to timestamp t and wait for the browser to actually land there
      await seekTo(video, t);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, 0, 0, width, height);

      const { data } = ctx.getImageData(0, 0, width, height); // flat RGBA Uint8ClampedArray
      const pixels = toRgbGrid(data, width, height);

      yield { index: frameIndex, time: t, width, height, pixels };

      frameIndex++;
    }
  } finally {
    URL.revokeObjectURL(url);
    video.src = "";
  }
}

/** Seeks a video element to `time` seconds and resolves once the seek completes. */
function seekTo(video, time) {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      reject(new Error("Video seek failed"));
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = Math.min(time, video.duration || time);
  });
}

/** Converts a flat RGBA Uint8ClampedArray into a [height][width][3] RGB array. */
function toRgbGrid(rgbaData, width, height) {
  const grid = new Array(height);
  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const i = rowOffset + x * 4;
      row[x] = [rgbaData[i], rgbaData[i + 1], rgbaData[i + 2]]; // drop alpha
    }
    grid[y] = row;
  }
  return grid;
}

/* ---------------- Example usage ----------------

const fileInput = document.querySelector("input[type=file]");
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];

  for await (const frame of extractVideoFrames(file, { fps: 5, maxFrames: 20 })) {
    console.log(`Frame ${frame.index} @ ${frame.time.toFixed(2)}s`, frame.pixels);
    // frame.pixels[y][x] => [r, g, b]
  }
});

-------------------------------------------------- */
