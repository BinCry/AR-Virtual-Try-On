import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FilesetResolver, PoseLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import './styles.css';

type SessionStatus = 'idle' | 'starting' | 'running' | 'error';
type Point = Pick<NormalizedLandmark, 'x' | 'y' | 'visibility'>;
const modelPath = new URL('models/pose_landmarker_lite.task', document.baseURI).toString();
const wasmPath = new URL('models/wasm', document.baseURI).toString();
const garments = [
  { id: 'bomber', label: 'Bomber xanh', image: '/garments/blue-bomber.png' },
  { id: 'trench', label: 'Trench coat', image: '/garments/camel-trench.png' },
  { id: 'knit', label: 'Áo len xanh rêu', image: '/garments/green-knit.png' },
] as const;

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);
  const garmentImageRef = useRef<HTMLImageElement | null>(null);
  const smoothedPoseRef = useRef<Point[] | null>(null);
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [selectedGarment, setSelectedGarment] = useState<(typeof garments)[number]['id']>('bomber');
  const [tracked, setTracked] = useState(false);
  const [message, setMessage] = useState('Tải ảnh PNG/WebP nền trong suốt, sau đó bật camera.');

  function disposeTracking() {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    trackerRef.current?.close();
    trackerRef.current = null;
    smoothedPoseRef.current = null;
  }

  function stopCamera() {
    disposeTracking();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setTracked(false);
    setStatus('idle');
    setMessage('Camera đã tắt. Không có ảnh hoặc video nào rời khỏi thiết bị.');
  }

  useEffect(() => () => {
    disposeTracking();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function selectGarment(garment: (typeof garments)[number]) {
    const image = new Image();
    image.onload = () => {
      garmentImageRef.current = image;
      setSelectedGarment(garment.id);
      setMessage(`Đã chọn ${garment.label}. Bật camera để thử đồ.`);
    };
    image.onerror = () => { setStatus('error'); setMessage('Không thể tải mẫu trang phục này.'); };
    image.src = garment.image;
  }

  useEffect(() => { selectGarment(garments[0]); }, []);

  function drawFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const tracker = trackerRef.current;
    if (!video || !canvas || !tracker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      animationRef.current = requestAnimationFrame(drawFrame);
      return;
    }
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    const context = canvas.getContext('2d');
    if (!context) return;
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const result = tracker.detectForVideo(video, performance.now());
    const landmarks = result.landmarks[0] as Point[] | undefined;
    const keypoints = landmarks ? [landmarks[11], landmarks[12], landmarks[23], landmarks[24]] : [];
    const isTracked = keypoints.length === 4 && keypoints.every((point) => (point.visibility ?? 0) > .45);
    setTracked((previous) => previous === isTracked ? previous : isTracked);
    if (isTracked && landmarks && garmentImageRef.current) {
      const prior = smoothedPoseRef.current;
      const pose = landmarks.map((point, index) => {
        const old = prior?.[index];
        return old ? { x: old.x + (point.x - old.x) * .35, y: old.y + (point.y - old.y) * .35, visibility: point.visibility } : point;
      });
      smoothedPoseRef.current = pose;
      const leftShoulder = pose[11];
      const rightShoulder = pose[12];
      const leftHip = pose[23];
      const rightHip = pose[24];
      const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2 * canvas.width;
      const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2 * canvas.height;
      const hipCenterY = (leftHip.y + rightHip.y) / 2 * canvas.height;
      const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x) * canvas.width;
      const torsoHeight = Math.max(hipCenterY - shoulderCenterY, shoulderWidth * .85);
      const image = garmentImageRef.current;
      const width = shoulderWidth * 1.9;
      const height = torsoHeight * 1.5;
      const collarY = shoulderCenterY - torsoHeight * .30;
      const rawRotation = Math.atan2((rightShoulder.y - leftShoulder.y) * canvas.height, (rightShoulder.x - leftShoulder.x) * canvas.width);
      const rotation = rawRotation > Math.PI / 2 ? rawRotation - Math.PI : rawRotation < -Math.PI / 2 ? rawRotation + Math.PI : rawRotation;
      context.save();
      context.translate(shoulderCenterX, collarY + height / 2);
      context.rotate(rotation);
      context.drawImage(image, -width / 2, -height / 2, width, height);
      context.restore();
    } else if (!isTracked) smoothedPoseRef.current = null;
    context.restore();
    animationRef.current = requestAnimationFrame(drawFrame);
  }

  async function startCamera() {
    if (!garmentImageRef.current) {
      setStatus('error');
      setMessage('Đang tải mẫu trang phục, hãy thử lại ngay sau một giây.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error');
      setMessage('Trình duyệt này không hỗ trợ camera. Hãy dùng Chrome, Edge hoặc Safari mới trên HTTPS/localhost.');
      return;
    }
    stopCamera();
    setStatus('starting');
    setMessage('Đang mở camera và tải bộ nhận diện dáng người cục bộ…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user' } });
      const vision = await FilesetResolver.forVisionTasks(wasmPath);
      const tracker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: modelPath, delegate: 'GPU' },
        runningMode: 'VIDEO', numPoses: 1, minPoseDetectionConfidence: .55, minTrackingConfidence: .55,
      });
      if (!videoRef.current) { stream.getTracks().forEach((track) => track.stop()); tracker.close(); return; }
      streamRef.current = stream;
      trackerRef.current = tracker;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus('running');
      setMessage('Đang thử đồ cục bộ trên thiết bị. Hãy đứng trọn phần thân trên trong khung hình.');
      drawFrame();
    } catch (error) {
      disposeTracking();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Không thể khởi động camera hoặc pose tracking.');
    }
  }

  function capture() {
    const canvas = canvasRef.current;
    if (!canvas || status !== 'running') return;
    const link = document.createElement('a');
    link.download = `local-try-on-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return <main>
    <header><div><p className="eyebrow">LOCAL / MEDIAPIPE + CANVAS</p><h1>Phòng thử đồ miễn phí</h1></div><div className={`signal ${status}`}>{status === 'running' ? 'LIVE' : status.toUpperCase()}</div></header>
    <section className="workbench"><section className="stage" aria-label="Camera thử đồ cục bộ"><video ref={videoRef} muted playsInline className="source-video"/><canvas ref={canvasRef} className="output"/>{status !== 'running' && <div className="empty"><strong>{status === 'starting' ? 'Đang khởi động…' : 'Sẵn sàng thử đồ'}</strong><span>Camera và trang phục sẽ được xử lý ngay trên thiết bị.</span></div>}{status === 'running' && <div className="tracking">{tracked ? 'Pose tracked' : 'Đang tìm phần thân trên'}</div>}</section>
      <aside><section><p className="label">CHỌN TRANG PHỤC</p><div className="garments">{garments.map((garment) => <button className={selectedGarment === garment.id ? 'garment active' : 'garment'} key={garment.id} onClick={() => selectGarment(garment)}><img src={garment.image} alt=""/><span>{garment.label}</span></button>)}</div><p className="hint">Ba mẫu có sẵn đã được đóng gói cùng app, không cần upload ảnh.</p></section>
        <section><p className="label">CAMERA & POSE</p><button className="primary" onClick={() => void startCamera()} disabled={status === 'starting'}>{status === 'starting' ? 'Đang khởi động…' : status === 'running' ? 'Khởi động lại camera' : 'Bật camera'}</button><button className="secondary" onClick={stopCamera} disabled={status !== 'running' && status !== 'starting'}>Tắt camera</button><p className={`hint ${status === 'error' ? 'error' : ''}`} role="status">{message}</p></section>
        <section className="actions"><button onClick={capture} disabled={status !== 'running'}>Lưu ảnh kết quả</button></section><p className="privacy">Không có API key, backend, upload hay phí theo giây. Video, pose và ảnh trang phục chỉ được xử lý trong trình duyệt của bạn.</p></aside>
    </section><footer><span>2D overlay theo vai và hông, không phải mô phỏng vải hay đo size.</span><span>Camera yêu cầu localhost hoặc HTTPS.</span></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
