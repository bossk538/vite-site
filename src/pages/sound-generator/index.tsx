import { useEffect, useState } from "react";

const SAMPLE_RATE = 44100; // samples per second
const DURATION_SECONDS = 3;
const NUM_CHANNELS = 2; // stereo
const BITS_PER_SAMPLE = 16; // 16-bit signed PCM
const NYQUIST = SAMPLE_RATE / 2;

/**
 * Fill a 3-second buffer with a sine wave at the given frequency,
 * normalized so its peak sample hits full scale (1.0).
 */
function generateSineBuffer(frequency) {
  const length = SAMPLE_RATE * DURATION_SECONDS;
  const samples = new Float32Array(length);
  const angularStep = (2 * Math.PI * frequency) / SAMPLE_RATE;

  let peak = 0;
  for (let i = 0; i < length; i++) {
    const value = Math.sin(angularStep * i);
    samples[i] = value;
    const abs = Math.abs(value);
    if (abs > peak) peak = abs;
  }

  // Normalize to maximum amplitude. Depending on the frequency, the sampled
  // sine may never land exactly on ±1, so scale by the actual peak.
  if (peak > 0) {
    const gain = 1 / peak;
    for (let i = 0; i < length; i++) samples[i] *= gain;
  }

  return samples;
}

/**
 * Encode floating-point samples (-1..1) as a 16-bit PCM WAV file.
 */
function encodeWav(samples) {
  const bytesPerSample = BITS_PER_SAMPLE / 8;
  const blockAlign = NUM_CHANNELS * bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = samples.length * bytesPerSample * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // fmt chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // chunk size for PCM
  view.setUint16(20, 1, true); // audio format 1 = PCM
  view.setUint16(22, NUM_CHANNELS, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);

  // data chunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    for (let ch = 0; ch < NUM_CHANNELS; ch++) {
      view.setInt16(offset, int16, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export default function SoundGenerator() {
  const [frequency, setFrequency] = useState("440");
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState("");

  // Release the previous object URL whenever a new one replaces it,
  // and when the component unmounts.
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleGenerate = () => {
    const hz = Number(frequency);

    if (!Number.isFinite(hz) || hz <= 0) {
      setError("Enter a frequency greater than 0 Hz.");
      return;
    }
    if (hz > NYQUIST) {
      setError(`Frequency must be at most ${NYQUIST} Hz (half the sample rate).`);
      return;
    }

    setError("");
    const samples = generateSineBuffer(hz);
    const wavBlob = encodeWav(samples);
    setAudioUrl(URL.createObjectURL(wavBlob));
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 360 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label htmlFor="frequency">Frequency (Hz)</label>
        <input
          id="frequency"
          type="number"
          min="1"
          max={NYQUIST}
          step="any"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          style={{ width: 100 }}
        />
        <button type="button" onClick={handleGenerate}>
          Generate
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: "crimson", marginTop: 8 }}>
          {error}
        </p>
      )}

      <audio
        controls
        src={audioUrl ?? undefined}
        style={{ display: "block", width: "100%", marginTop: 12 }}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

