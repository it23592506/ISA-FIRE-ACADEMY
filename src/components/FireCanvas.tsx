import { useRef, useEffect, useCallback, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'fire' | 'smoke' | 'spark' | 'water' | 'foam' | 'co2' | 'powder';
}

interface Props {
  fireIntensity: number;
  isExtinguishing: boolean;
  extinguisherType: string | null;
  mousePos: { x: number; y: number } | null;
  width?: number;
  height?: number;
  buildingType?: string;
}

export default function FireCanvas({
  fireIntensity,
  isExtinguishing,
  extinguisherType,
  mousePos,
  width = 800,
  height = 400,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);
  const [canvasSize, setCanvasSize] = useState({ w: width, h: height });

  // Responsive canvas
  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const w = Math.min(container.clientWidth, 800);
        const h = Math.floor(w * 0.55);
        setCanvasSize({ w, h });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createFireParticle = useCallback((baseX: number, baseY: number, intensity: number) => {
    const spread = intensity * 1.5;
    return {
      x: baseX + (Math.random() - 0.5) * spread,
      y: baseY + Math.random() * 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -(Math.random() * 3 + 1.5),
      life: Math.random() * 40 + 20,
      maxLife: 60,
      size: Math.random() * 6 + 3,
      color: '',
      type: 'fire' as const,
    };
  }, []);

  const createSmokeParticle = useCallback((baseX: number, baseY: number) => {
    return {
      x: baseX + (Math.random() - 0.5) * 60,
      y: baseY - 30,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(Math.random() * 1.5 + 0.5),
      life: Math.random() * 80 + 40,
      maxLife: 120,
      size: Math.random() * 15 + 8,
      color: '',
      type: 'smoke' as const,
    };
  }, []);

  const createSparkParticle = useCallback((baseX: number, baseY: number) => {
    return {
      x: baseX + (Math.random() - 0.5) * 40,
      y: baseY,
      vx: (Math.random() - 0.5) * 6,
      vy: -(Math.random() * 8 + 2),
      life: Math.random() * 20 + 10,
      maxLife: 30,
      size: Math.random() * 2 + 1,
      color: '#FDE047',
      type: 'spark' as const,
    };
  }, []);

  const createExtParticle = useCallback((mx: number, my: number, type: string) => {
    const colors: Record<string, string[]> = {
      water: ['#60A5FA', '#3B82F6', '#93C5FD'],
      foam: ['#FDE68A', '#FBBF24', '#FEF3C7'],
      co2: ['#E5E7EB', '#D1D5DB', '#F3F4F6'],
      powder: ['#818CF8', '#6366F1', '#A5B4FC'],
    };
    const c = colors[type] || colors.water;
    return {
      x: mx,
      y: my,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      life: Math.random() * 20 + 15,
      maxLife: 35,
      size: Math.random() * 4 + 2,
      color: c[Math.floor(Math.random() * c.length)],
      type: type as Particle['type'],
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles = particlesRef.current;

    const drawBuilding = () => {
      const w = canvasSize.w;
      const h = canvasSize.h;

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0c0a09');
      skyGrad.addColorStop(0.5, '#1c1917');
      skyGrad.addColorStop(1, '#292524');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137) % w);
        const sy = ((i * 89) % (h * 0.4));
        ctx.beginPath();
        ctx.arc(sx, sy, 0.5 + (i % 3) * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, h * 0.78, w, h * 0.22);
      ctx.fillStyle = '#2d2d44';
      ctx.fillRect(0, h * 0.78, w, 2);

      // Building
      const bw = w * 0.35;
      const bh = h * 0.55;
      const bx = w * 0.5 - bw / 2;
      const by = h * 0.78 - bh;

      // Building shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(bx + 8, by + 8, bw, bh);

      // Building body
      const buildGrad = ctx.createLinearGradient(bx, by, bx + bw, by);
      buildGrad.addColorStop(0, '#374151');
      buildGrad.addColorStop(0.5, '#4B5563');
      buildGrad.addColorStop(1, '#374151');
      ctx.fillStyle = buildGrad;
      ctx.fillRect(bx, by, bw, bh);

      // Building outline
      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bw, bh);

      // Windows
      const wCols = 5;
      const wRows = 4;
      const ww = bw * 0.1;
      const wh = bh * 0.1;
      const wGapX = (bw - wCols * ww) / (wCols + 1);
      const wGapY = (bh - wRows * wh) / (wRows + 1);

      for (let r = 0; r < wRows; r++) {
        for (let c = 0; c < wCols; c++) {
          const wx = bx + wGapX + c * (ww + wGapX);
          const wy = by + wGapY + r * (wh + wGapY);

          // Fire glow in some windows
          const isFireWindow = (r <= 1) && fireIntensity > 30;
          if (isFireWindow) {
            const glow = Math.sin(frameRef.current * 0.1 + c + r) * 0.3 + 0.7;
            const fireGrad = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 0, wx + ww / 2, wy + wh / 2, ww);
            fireGrad.addColorStop(0, `rgba(255, ${80 + Math.floor(glow * 100)}, 0, ${glow * (fireIntensity / 100)})`);
            fireGrad.addColorStop(1, `rgba(255, 50, 0, ${glow * 0.3 * (fireIntensity / 100)})`);
            ctx.fillStyle = fireGrad;
            ctx.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);
          }

          ctx.fillStyle = isFireWindow
            ? `rgba(255, ${100 + Math.floor(Math.random() * 50)}, 0, ${0.5 + Math.random() * 0.5})`
            : (Math.random() > 0.3 ? 'rgba(255, 240, 180, 0.6)' : 'rgba(100, 120, 150, 0.3)');
          ctx.fillRect(wx, wy, ww, wh);

          ctx.strokeStyle = '#555';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(wx, wy, ww, wh);
        }
      }

      // Door
      ctx.fillStyle = '#78716C';
      ctx.fillRect(bx + bw / 2 - 12, by + bh - 30, 24, 30);
      ctx.strokeStyle = '#A8A29E';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + bw / 2 - 12, by + bh - 30, 24, 30);

      // Side buildings (background)
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(bx - w * 0.2, h * 0.5, w * 0.15, h * 0.28);
      ctx.fillRect(bx + bw + w * 0.05, h * 0.45, w * 0.18, h * 0.33);
      ctx.fillStyle = '#111827';
      ctx.fillRect(bx - w * 0.35, h * 0.55, w * 0.1, h * 0.23);

      // Fire truck
      if (isExtinguishing || fireIntensity < 80) {
        const tx = bx - 60;
        const ty = h * 0.78 - 25;

        // Truck body
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(tx, ty, 55, 20);
        ctx.fillRect(tx + 5, ty - 12, 40, 14);

        // Truck cabin
        ctx.fillStyle = '#991B1B';
        ctx.fillRect(tx, ty - 8, 18, 10);

        // Windows
        ctx.fillStyle = '#93C5FD';
        ctx.fillRect(tx + 2, ty - 6, 8, 5);

        // Wheels
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(tx + 12, ty + 20, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tx + 42, ty + 20, 5, 0, Math.PI * 2);
        ctx.fill();

        // Flashing light
        const flashOn = Math.floor(frameRef.current / 8) % 2 === 0;
        ctx.fillStyle = flashOn ? '#EF4444' : '#3B82F6';
        ctx.beginPath();
        ctx.arc(tx + 25, ty - 14, 3, 0, Math.PI * 2);
        ctx.fill();

        // Light glow
        ctx.fillStyle = flashOn ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)';
        ctx.beginPath();
        ctx.arc(tx + 25, ty - 14, 15, 0, Math.PI * 2);
        ctx.fill();

        // Ladder
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx + 45, ty);
        ctx.lineTo(bx + 10, by + bh * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tx + 48, ty + 3);
        ctx.lineTo(bx + 13, by + bh * 0.33);
        ctx.stroke();
      }

      return { bx, by, bw, bh };
    };

    const animate = () => {
      frameRef.current++;
      ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

      const { bx, by, bw, bh } = drawBuilding();

      // Generate fire particles
      const fireX = bx + bw / 2;
      const fireY = by + bh * 0.15;
      const particleCount = Math.floor(fireIntensity / 10);

      for (let i = 0; i < particleCount; i++) {
        if (particles.length < 500) {
          particles.push(createFireParticle(fireX, fireY, fireIntensity));
        }
      }

      // Smoke
      if (fireIntensity > 20 && frameRef.current % 3 === 0) {
        particles.push(createSmokeParticle(fireX, fireY));
      }

      // Sparks
      if (fireIntensity > 50 && frameRef.current % 8 === 0) {
        particles.push(createSparkParticle(fireX, fireY));
      }

      // Extinguisher particles
      if (isExtinguishing && mousePos && extinguisherType && frameRef.current % 2 === 0) {
        const rect = canvas.getBoundingClientRect();
        const mx = (mousePos.x - rect.left) * (canvasSize.w / rect.width);
        const my = (mousePos.y - rect.top) * (canvasSize.h / rect.height);
        for (let i = 0; i < 5; i++) {
          particles.push(createExtParticle(mx, my, extinguisherType));
        }
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.type === 'fire') {
          p.vy -= 0.05;
          p.size *= 0.98;
        }
        if (p.type === 'smoke') {
          p.vx += (Math.random() - 0.5) * 0.2;
          p.size *= 1.005;
        }
        if (p.type === 'spark') {
          p.vy += 0.15;
        }

        if (p.life <= 0 || p.size < 0.3) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.min(p.life / p.maxLife, 1);

        ctx.save();
        ctx.globalAlpha = alpha;

        if (p.type === 'fire') {
          const lifeRatio = p.life / p.maxLife;
          const r = 255;
          const g = Math.floor(50 + lifeRatio * 180);
          const b = Math.floor(lifeRatio * 30);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.shadowColor = `rgba(255, ${g}, 0, 0.5)`;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'smoke') {
          const gray = 60 + Math.floor((1 - alpha) * 40);
          ctx.fillStyle = `rgba(${gray},${gray},${gray + 10},${alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'spark') {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Extinguisher particles
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Ambient fire glow
      if (fireIntensity > 10) {
        const glow = ctx.createRadialGradient(fireX, fireY, 0, fireX, fireY, 100 + fireIntensity);
        glow.addColorStop(0, `rgba(255, 100, 0, ${(fireIntensity / 100) * 0.15})`);
        glow.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);
      }

      // Victory overlay
      if (fireIntensity <= 0) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [canvasSize, fireIntensity, isExtinguishing, extinguisherType, mousePos, createFireParticle, createSmokeParticle, createSparkParticle, createExtParticle]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.w}
      height={canvasSize.h}
      className="w-full rounded-2xl border border-gray-700/50"
      style={{ imageRendering: 'auto' }}
    />
  );
}
