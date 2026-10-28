import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArSession, GARMENTS, GarmentRenderer, type GarmentDefinition, type SessionState, type TrackingStatus } from '@studio-ar/core';
import './styles.css';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null); const canvasRef = useRef<HTMLCanvasElement>(null); const sessionRef = useRef<ArSession | null>(null);
  const [state, setState] = useState<SessionState>('idle'); const [status, setStatus] = useState<TrackingStatus>({ tracked: false, inferenceMs: 0 }); const [garment, setGarment] = useState<GarmentDefinition>(GARMENTS[0]); const [debug, setDebug] = useState(false); const [error, setError] = useState<string>();
  useEffect(() => () => sessionRef.current?.dispose(), []);
  async function toggleCamera() {
    setError(undefined);
    if (sessionRef.current && state === 'running') { sessionRef.current.stop(); return; }
    if (!videoRef.current || !canvasRef.current) return;
    const renderer = new GarmentRenderer(canvasRef.current); const session = new ArSession(videoRef.current, renderer); sessionRef.current = session; session.setGarment(garment);
    session.on((event) => { if (event.type === 'state' && event.state) setState(event.state); if (event.type === 'tracking' && event.status) setStatus(event.status); if (event.type === 'error') setError(event.error?.message); });
    try { await session.start(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể khởi động AR.'); }
  }
  function chooseGarment(next: GarmentDefinition) { setGarment(next); sessionRef.current?.setGarment(next); }
  function capture() { const video = videoRef.current; const overlay = canvasRef.current; if (!video || !overlay || state !== 'running') return; const output = document.createElement('canvas'); output.width = video.videoWidth; output.height = video.videoHeight; const context = output.getContext('2d'); if (!context) return; context.translate(output.width, 0); context.scale(-1, 1); context.drawImage(video, 0, 0, output.width, output.height); context.drawImage(overlay, 0, 0, output.width, output.height); const link = document.createElement('a'); link.download = `studio-ar-${Date.now()}.png`; link.href = output.toDataURL('image/png'); link.click(); }
  return <main><header><div><p className="eyebrow">STUDIO AR LAB / R&D</p><h1>Phòng thử đồ 3D</h1></div><div className={`signal ${state}`}>{state === 'running' ? 'LIVE' : state.toUpperCase()}</div></header>
    <section className="workbench"><div className="stage"><video ref={videoRef} muted playsInline className="mirrored"/><canvas ref={canvasRef} className="overlay mirrored"/>{state !== 'running' && <div className="empty"><strong>Camera chưa bật</strong><span>Video được xử lý cục bộ trong trình duyệt.</span></div>}{debug && <div className="debug">Pose: {status.tracked ? 'đã nhận diện' : 'đang tìm'} · {status.inferenceMs.toFixed(1)} ms</div>}</div>
      <aside><section><p className="label">01 / PHIÊN CAMERA</p><button className="primary" onClick={toggleCamera}>{state === 'running' ? 'Tắt camera' : 'Bật camera'}</button><p className="hint">Chỉ yêu cầu quyền khi bạn bấm nút. Dùng HTTPS hoặc localhost.</p>{error && <p className="error">{error}</p>}</section><section><p className="label">02 / TRANG PHỤC DEMO</p><div className="garments">{GARMENTS.map((item) => <button className={item.id === garment.id ? 'garment active' : 'garment'} key={item.id} onClick={() => chooseGarment(item)}><i style={{ background: item.color }}/>{item.label}</button>)}</div></section><section className="actions"><button onClick={() => setDebug((value) => !value)}>{debug ? 'Ẩn chẩn đoán' : 'Hiện chẩn đoán'}</button><button onClick={capture} disabled={state !== 'running'}>Chụp kết quả</button></section><p className="privacy">Không tải video, ảnh hoặc landmark lên máy chủ. Ảnh chỉ được tạo khi bạn bấm chụp.</p></aside></section>
    <footer><span>Tracking torso 3D · MediaPipe Pose Landmarker</span><span className={status.tracked ? 'good' : ''}>{status.tracked ? 'Body tracked' : 'Đang chờ người dùng'}</span></footer></main>;
}
createRoot(document.getElementById('root')!).render(<App />);
