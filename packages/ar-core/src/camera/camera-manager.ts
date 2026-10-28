export class CameraManager {
  private stream?: MediaStream;
  get active(): boolean { return Boolean(this.stream); }
  async start(video: HTMLVideoElement): Promise<void> {
    if (this.stream) return;
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Trình duyệt không hỗ trợ webcam hoặc cần HTTPS/localhost.');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      video.srcObject = this.stream;
      await video.play();
    } catch (cause) {
      const error = cause instanceof DOMException ? cause : new Error('Không thể khởi tạo webcam.');
      if (error.name === 'NotAllowedError') throw new Error('Quyền camera đã bị từ chối.');
      if (error.name === 'NotFoundError') throw new Error('Không tìm thấy webcam.');
      if (error.name === 'NotReadableError') throw new Error('Webcam đang được ứng dụng khác sử dụng.');
      throw error;
    }
  }
  stop(video?: HTMLVideoElement): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    if (video) video.srcObject = null;
  }
}
