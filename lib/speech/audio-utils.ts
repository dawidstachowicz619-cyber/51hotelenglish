/** 将录音 Blob 转为 16kHz 单声道 Float32Array（Whisper 要求） */
export async function blobTo16kMono(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const decodeContext = new AudioContext();
  const audioBuffer = await decodeContext.decodeAudioData(arrayBuffer.slice(0));
  await decodeContext.close();

  const targetRate = 16000;
  const duration = audioBuffer.duration;
  const offline = new OfflineAudioContext(1, Math.ceil(duration * targetRate), targetRate);

  const source = offline.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offline.destination);
  source.start(0);

  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}
