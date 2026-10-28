import type { Landmark, SegmentationMask } from '../types';

/** Draws only foreground person pixels over the transparent garment canvas. */
export class OcclusionRenderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly maskCanvas = document.createElement('canvas');
  private readonly maskContext = this.maskCanvas.getContext('2d', { willReadFrequently: false })!;
  constructor(private readonly canvas: HTMLCanvasElement) { this.context = canvas.getContext('2d', { alpha: true })!; }
  clear(): void { this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); }
  update(video: HTMLVideoElement, mask: SegmentationMask | undefined, landmarks: Landmark[]): boolean {
    if (!mask || !video.videoWidth || !video.videoHeight) { this.clear(); return false; }
    const width = Math.round(this.canvas.clientWidth); const height = Math.round(this.canvas.clientHeight);
    if (!width || !height) return false;
    if (this.canvas.width !== width || this.canvas.height !== height) { this.canvas.width = width; this.canvas.height = height; }
    this.maskCanvas.width = mask.width; this.maskCanvas.height = mask.height;
    const image = this.maskContext.createImageData(mask.width, mask.height);
    for (let i = 0; i < mask.data.length; i += 1) image.data[i * 4 + 3] = Math.max(0, Math.min(255, (mask.data[i] - 96) * 1.6));
    this.maskContext.putImageData(image, 0, 0);
    const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
    const drawWidth = video.videoWidth * scale; const drawHeight = video.videoHeight * scale;
    const left = (width - drawWidth) / 2; const top = (height - drawHeight) / 2;
    const point = (item: Landmark) => ({ x: item.x * drawWidth + left, y: item.y * drawHeight + top });
    this.context.clearRect(0, 0, width, height);
    this.context.save();
    this.context.drawImage(video, left, top, drawWidth, drawHeight);
    this.context.globalCompositeOperation = 'destination-in';
    this.context.imageSmoothingEnabled = true;
    this.context.drawImage(this.maskCanvas, left, top, drawWidth, drawHeight);
    const [leftShoulder, rightShoulder, leftHip, rightHip] = [landmarks[11], landmarks[12], landmarks[23], landmarks[24]];
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const ls = point(leftShoulder); const rs = point(rightShoulder); const lh = point(leftHip); const rh = point(rightHip);
      this.context.globalCompositeOperation = 'destination-out';
      this.context.beginPath(); this.context.moveTo(ls.x, ls.y); this.context.lineTo(rs.x, rs.y); this.context.lineTo(rh.x, rh.y); this.context.lineTo(lh.x, lh.y); this.context.closePath(); this.context.fill();
    }
    this.context.restore();
    return true;
  }
}
