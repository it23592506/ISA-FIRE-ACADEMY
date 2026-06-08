import { useState, useEffect, useCallback, useRef } from 'react';
import { partyScenarios, partyVenueIcons } from '../partyData';
import { ExtinguisherType, GameScreen, GameResult } from '../types';

interface Props {
  scenarioId: number;
  onNavigate: (screen: GameScreen) => void;
  onComplete: (result: GameResult) => void;
}

type Phase = 'briefing' | 'patrol' | 'panic' | 'extinguish' | 'evacuate';

export default function PartyGame({ scenarioId, onNavigate, onComplete }: Props) {
  const s = partyScenarios.find(p => p.id === scenarioId) || partyScenarios[0];
  const [phase, setPhase] = useState<Phase>('briefing');
  const [storyIdx, setStoryIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(s.timeLimit);
  const [running, setRunning] = useState(false);
  const [alarmOn, setAlarmOn] = useState(false);
  const [isOk, setIsOk] = useState(false);
  const [passN, setPassN] = useState(0);
  const [fire, setFire] = useState(60);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  const [rescued, setRescued] = useState(0);
  const [trapped, setTrapped] = useState(0);
  const [pp, setPp] = useState({ x: s.alarmPosition.x, y: 10 });
  const [wp, setWp] = useState<{ x: number; y: number } | null>(null);
  const [vr, setVr] = useState<Set<number>>(new Set());
  const [found, setFound] = useState(false);
  const [hint, setHint] = useState('');
  const [combo, setCombo] = useState('');
  const [cs, setCs] = useState({ w: 700, h: 480 });
  const doneRef = useRef(false);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const guestsRef = useRef<any[]>([]);

  const seedGuests = useCallback(() => {
    guestsRef.current = Array.from({ length: 20 }, (_, i) => ({
      id: i, x: 20 + Math.random() * 60, y: 25 + Math.random() * 50,
      state: 'dancing', panicTimer: 0,
      emoji: ['😀', '🎉', '💃', '🕺', '🥳', '🎊', '😎', '🤩'][i % 8],
    }));
  }, []);

  useEffect(() => {
    const d = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'arrowup'].includes(k)) keys.current = { ...keys.current, w: true };
      if (['a', 'arrowleft'].includes(k)) keys.current = { ...keys.current, a: true };
      if (['s', 'arrowdown'].includes(k)) keys.current = { ...keys.current, s: true };
      if (['d', 'arrowright'].includes(k)) keys.current = { ...keys.current, d: true };
      if ((k === 'e' || k === ' ') && !alarmOn && phase === 'patrol') {
        const dx = pp.x - s.alarmPosition.x;
        const dy = pp.y - s.alarmPosition.y;
        if (Math.hypot(dx, dy) < 8) activateAlarm();
      }
    };
    const u = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'arrowup'].includes(k)) keys.current = { ...keys.current, w: false };
      if (['a', 'arrowleft'].includes(k)) keys.current = { ...keys.current, a: false };
      if (['s', 'arrowdown'].includes(k)) keys.current = { ...keys.current, s: false };
      if (['d', 'arrowright'].includes(k)) keys.current = { ...keys.current, d: false };
    };
    window.addEventListener('keydown', d);
    window.addEventListener('keyup', u);
    return () => { window.removeEventListener('keydown', d); window.removeEventListener('keyup', u); };
  }, [pp, alarmOn, phase, s.alarmPosition]);

  useEffect(() => {
    const cb = () => {
      const el = wrapRef.current;
      if (!el) return;
      setCs({ w: el.clientWidth, h: Math.min(Math.floor(el.clientWidth * 0.65), 500) });
    };
    cb();
    window.addEventListener('resize', cb);
    return () => window.removeEventListener('resize', cb);
  }, []);

  const activateAlarm = useCallback(() => {
    setAlarmOn(true);
    setHint('');
    setFound(false);
    setScore(v => v + 150);
    setCombo('🚨 ALARM ACTIVATED!');
    setTimeout(() => setCombo(''), 2000);
    setPhase('panic');
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      if (doneRef.current) return;
      doneRef.current = true;
      setRunning(false);
      const sv = guestsRef.current.filter((g: any) => g.state === 'safe').length;
      const tr = guestsRef.current.filter((g: any) => g.state === 'trapped').length;
      onComplete({
        score,
        maxScore: s.points,
        timeTaken: s.timeLimit,
        accuracy: alarmOn ? 40 : 10,
        details: [alarmOn ? '🚨 Alarm activated' : '❌ Alarm not activated', `👥 Evacuated: ${sv}/${s.guestCount}`, tr > 0 ? `⚠️ Trapped: ${tr}` : '✅ All clear!', `⏰ Time ran out`],
        mode: 'party',
      });
      return;
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft, score, alarmOn, s, onComplete]);

  useEffect(() => {
    if (!running) return;
    const sp = 0.4;
    let nx = pp.x, ny = pp.y;
    if (keys.current.w) ny -= sp;
    if (keys.current.s) ny += sp;
    if (keys.current.a) nx -= sp;
    if (keys.current.d) nx += sp;
    nx = Math.max(2, Math.min(98, nx));
    ny = Math.max(2, Math.min(98, ny));
    setPp({ x: nx, y: ny });

    const dd = Math.hypot(nx - s.alarmPosition.x, ny - s.alarmPosition.y);
    if (dd < 8 && !found && phase === 'patrol') {
      setFound(true);
      setHint('🚨 Press E or Space to activate the alarm!');
      setTimeout(() => setHint(''), 3500);
    }

    const ri = s.rooms.findIndex((r: any) => nx >= r.x && nx <= r.x + r.w && ny >= r.y && ny <= r.y + r.h);
    if (ri !== -1) setVr((v: Set<number>) => { const n = new Set(v); n.add(ri); return n; });
  }, [running, pp, s.alarmPosition, s.rooms, found, phase]);

  useEffect(() => {
    if (phase !== 'panic' && phase !== 'extinguish' && phase !== 'evacuate') return;
    const loop = setInterval(() => {
      guestsRef.current = guestsRef.current.map((g: any) => {
        if (g.state === 'safe') return g;
        if (g.state === 'dancing' && alarmOn) return { ...g, state: 'alerted', panicTimer: Math.floor(Math.random() * 50) };
        if (g.state === 'alerted') {
          if (g.panicTimer <= 0) return { ...g, state: 'evacuating' };
          return { ...g, panicTimer: g.panicTimer - 1 };
        }
        if (g.state === 'panicking') {
          return { ...g, x: Math.max(2, Math.min(98, g.x + (Math.random() - 0.5) * 3)), y: Math.max(2, Math.min(98, g.y + (Math.random() - 0.5) * 3)) };
        }
        if (g.state === 'evacuating' || g.state === 'trapped') {
          const ex = s.exits.reduce((best: any, e: any) =>
            Math.hypot(g.x - e.x, g.y - e.y) < Math.hypot(g.x - best.x, g.y - best.y) ? e : best
          , s.exits[0]);
          const nx = g.x + (ex.x - g.x) * 0.04;
          const ny = g.y + (ex.y - g.y) * 0.04;
          const d = Math.hypot(nx - ex.x, ny - ex.y);
          if (d < 4) return { ...g, x: ex.x, y: ex.y, state: 'safe' };
          if (Math.hypot(nx - s.fireOrigin.x, ny - s.fireOrigin.y) < 12) return { ...g, state: 'trapped' };
          return { ...g, x: nx, y: ny };
        }
        return g;
      });
    }, 60);
    return () => clearInterval(loop);
  }, [phase, alarmOn, s.exits, s.fireOrigin]);

  useEffect(() => {
    const loop = setInterval(() => {
      const sv = guestsRef.current.filter((g: any) => g.state === 'safe').length;
      const tr = guestsRef.current.filter((g: any) => g.state === 'trapped').length;
      setRescued(sv);
      setTrapped(tr);
    }, 400);
    return () => clearInterval(loop);
  }, []);

  // Win check
  useEffect(() => {
    if (phase !== 'evacuate') return;
    const sv = guestsRef.current.filter((g: any) => g.state === 'safe').length;
    const tr = guestsRef.current.filter((g: any) => g.state === 'trapped').length;
    if (sv >= s.guestCount * 0.75 && tr === 0 && !doneRef.current) {
      doneRef.current = true;
      setRunning(false);
      onComplete({
        score: score + rescued * 10,
        maxScore: s.points,
        timeTaken: s.timeLimit - timeLeft,
        accuracy: alarmOn ? 100 : 30,
        details: [
          alarmOn ? '✅ Alarm activated in time!' : '❌ Alarm not activated',
          `🏃 Evacuated: ${rescued + sv}/${s.guestCount}`,
          tr === 0 ? '✅ No one trapped!' : `⚠️ ${tr} trapped`,
          `⏱️ ${timeLeft}s remaining`,
        ],
        mode: 'party',
      });
    }
  }, [phase, rescued, timeLeft, alarmOn, score, s.guestCount, s.points, s.timeLimit, onComplete]);

  useEffect(() => {
    if (alarmOn && phase === 'patrol') {
      setPhase('panic');
      setRunning(true);
      const t = setTimeout(() => { if (phase === 'panic') setPhase('extinguish'); }, 5000);
      return () => clearTimeout(t);
    }
  }, [alarmOn, phase]);

  useEffect(() => {
    if (fire === 0 && phase === 'extinguish') {
      setTimeout(() => {
        setPhase('evacuate');
        guestsRef.current = guestsRef.current.map((g: any) =>
          ['dancing', 'alerted', 'panicking', 'trapped'].includes(g.state)
            ? { ...g, state: 'evacuating' } : g
        );
      }, 1000);
    }
  }, [fire, phase]);

  const chooseExt = (t: ExtinguisherType) => {
    if (phase !== 'extinguish' || isOk) return;
    setIsOk(true);
    if (t === 'powder') {
      setScore(v => v + 200);
      setPassN(1);
      setCombo('CORRECT!');
      setTimeout(() => setCombo(''), 1200);
    } else {
      setShake(true);
      setFire(v => Math.min(v + 15, 100));
      setScore(v => v - 20);
      setTimeout(() => { setShake(false); setIsOk(false); }, 1500);
    }
  };

  const passClick = (n: number) => {
    if (n !== passN + 1 || !isOk) return;
    setPassN(n);
    setScore(v => v + 30);
    if (n === 4) {
      setFire(0);
      setCombo('FIRE CONTAINED! Evacuate!');
      setTimeout(() => setCombo(''), 1500);
    }
  };

  const next = () => {
    if (storyIdx < s.story.length - 1) setStoryIdx(v => v + 1);
    else { setPhase('patrol'); seedGuests(); }
  };

  const passSteps = [
    { n: 1, l: 'P', t: 'Pull pin' }, { n: 2, l: 'A', t: 'Aim base' },
    { n: 3, l: 'S', t: 'Squeeze' }, { n: 4, l: 'S', t: 'Sweep' },
  ];

  const tc = timeLeft > 50 ? 'text-green-400' : timeLeft > 20 ? 'text-yellow-400' : 'text-red-400 animate-pulse';

  // Canvas
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const W = cs.w, H = cs.h;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#07050a'); bg.addColorStop(1, '#120818');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 25) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      s.rooms.forEach((r: any, i: number) => {
        const rx = (r.x / 100) * W, ry = (r.y / 100) * H;
        const rw = (r.w / 100) * W, rh = (r.h / 100) * H;
        ctx.fillStyle = vr.has(i) ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.01)';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = vr.has(i) ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)';
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '9px monospace'; ctx.fillText(r.name, rx + 3, ry + 11);
      });

      s.exits.forEach((ex: any) => {
        const exx = (ex.x / 100) * W, exy = (ex.y / 100) * H;
        ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(exx, exy, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4ade80'; ctx.font = '8px monospace'; ctx.fillText('⬤ EXIT', exx + 6, exy + 3);
      });

      const aX = (s.alarmPosition.x / 100) * W;
      const aY = (s.alarmPosition.y / 100) * H;
      const pulse = (Math.sin(Date.now() / 150) + 1) / 2;
      if (alarmOn) {
        ctx.fillStyle = `rgba(239,68,68,${0.25 + pulse * 0.3})`;
        ctx.beginPath(); ctx.arc(aX, aY, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 9px monospace'; ctx.fillText('🚨 ALARM', aX - 22, aY - 10);
        ctx.strokeStyle = `rgba(239,68,68,${0.1 + pulse * 0.1})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(aX, aY, 14 + pulse * 6, 0, Math.PI * 2); ctx.stroke();
      } else {
        ctx.fillStyle = found ? '#fbbf24' : '#4b5563'; ctx.beginPath(); ctx.arc(aX, aY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = found ? '#fbbf24' : '#9ca3af'; ctx.font = '8px monospace';
        ctx.fillText(found ? 'Press Space/E' : 'Alarm Panel', aX - 28, aY - 9);
      }

      if (phase !== 'evacuate') {
        const fX = (s.fireOrigin.x / 100) * W;
        const fY = (s.fireOrigin.y / 100) * H;
        const inten = phase === 'extinguish' ? fire : 70;
        if (inten > 5) {
          const fg = ctx.createRadialGradient(fX, fY, 0, fX, fY, 50 + inten);
          fg.addColorStop(0, `rgba(255,80,0,${Math.min(inten / 120, 0.5)})`);
          fg.addColorStop(1, 'rgba(255,40,0,0)');
          ctx.fillStyle = fg; ctx.fillRect(fX - 80, fY - 80, 160, 160);
          ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(fX, fY, 4 + inten / 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ef4444';
          for (let i = 0; i < inten / 18; i++) {
            const ox = Math.sin(Date.now() / 180 + i) * 12;
            const oy = Math.cos(Date.now() / 160 + i) * 8;
            ctx.beginPath(); ctx.arc(fX + ox, fY + oy, 2 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      if (phase === 'extinguish' && fire > 0 && fire < 100) {
        const fX = (s.fireOrigin.x / 100) * W;
        const fY = (s.fireOrigin.y / 100) * H;
        ctx.fillStyle = `rgba(255,80,0,${fire / 120})`; ctx.beginPath(); ctx.arc(fX, fY, fire / 4, 0, Math.PI * 2); ctx.fill();
      }

      guestsRef.current.forEach((g: any) => {
        if (g.state === 'safe') return;
        const gx = (g.x / 100) * W, gy = (g.y / 100) * H;
        if (g.state === 'trapped') {
          ctx.fillStyle = 'rgba(239,68,68,0.2)'; ctx.beginPath(); ctx.arc(gx, gy, 7, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ef4444'; ctx.font = 'bold 9px monospace'; ctx.fillText('⚠️', gx - 3, gy - 8);
        }
        if (g.state === 'evacuating') {
          ctx.fillStyle = 'rgba(34,197,94,0.25)'; ctx.beginPath(); ctx.arc(gx, gy, 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.font = '13px sans-serif'; ctx.fillText(g.emoji, gx - 6, gy + 4);
      });

      const pX = (pp.x / 100) * W, pY = (pp.y / 100) * H;
      ctx.fillStyle = 'rgba(59,130,246,0.15)'; ctx.beginPath(); ctx.arc(pX, pY, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(pX, pY, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pX, pY, 5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 8px monospace'; ctx.fillText('🧑‍🚒', pX - 20, pY - 10);

      const mW = 90, mH = 70, mX = W - mW - 6, mY = 6;
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(mX, mY, mW, mH); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.strokeRect(mX, mY, mW, mH);
      s.rooms.forEach((r: any) => {
        ctx.fillStyle = 'rgba(99,102,241,0.15)';
        ctx.fillRect(mX + (r.x / 100) * mW, mY + (r.y / 100) * mH, (r.w / 100) * mW, (r.h / 100) * mH);
      });
      s.exits.forEach((ex: any) => { ctx.fillStyle = '#22c55e'; ctx.fillRect(mX + (ex.x / 100) * mW, mY + (ex.y / 100) * mH, 3, 3); });
      ctx.fillStyle = '#ef4444'; ctx.fillRect(mX + (s.fireOrigin.x / 100) * mW, mY + (s.fireOrigin.y / 100) * mH, 4, 4);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(mX + (s.alarmPosition.x / 100) * mW, mY + (s.alarmPosition.y / 100) * mH, 3, 3);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(mX + (pp.x / 100) * mW - 1, mY + (pp.y / 100) * mH - 1, 3, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px monospace'; ctx.fillText('RADAR', mX + 3, mY + 7);

      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, H - 16, W, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px monospace';
      ctx.fillText(`📍 ${s.location}  👥 20 guests  ⏱️ ${timeLeft}s`, 6, H - 4);

      if (alarmOn) {
        ctx.fillStyle = `rgba(239,68,68,${0.03 + Math.sin(Date.now() / 300) * 0.015})`;
        ctx.fillRect(0, 0, W, H);
      }
    };
    let raf: number;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [cs, pp, vr, found, alarmOn, phase, fire, timeLeft, s]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!running || phase !== 'patrol') return;
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setWp({ x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) });
  };

  useEffect(() => {
    if (!wp || !running) return;
    const dx = wp.x - pp.x, dy = wp.y - pp.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.5) { setWp(null); return; }
    const sp = 1.1;
    setPp({ x: Math.max(2, Math.min(98, pp.x + (dx / d) * sp)), y: Math.max(2, Math.min(98, pp.y + (dy / d) * sp)) });
  }, [wp, running, pp]);

  // --- RENDER ---

  if (phase === 'briefing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-xl w-full bg-gray-900/95 rounded-2xl border border-orange-500/30 overflow-hidden shadow-2xl">
          <div className="relative bg-orange-600/15 border-b border-orange-500/30 px-5 py-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center text-2xl animate-pulse">🚨</div>
              <div>
                <p className="text-[10px] text-orange-400 font-mono tracking-widest">⚡ PARTY EMERGENCY</p>
                <h2 className="text-xl font-black mt-0.5">{s.title}</h2>
              </div>
              <span className="ml-auto text-2xl">{partyVenueIcons[s.venue]}</span>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-800/50 rounded-xl p-2.5 text-center border border-gray-700/30">
                <span className="text-lg">👥</span><p className="text-sm font-black mt-0.5">{s.guestCount}</p><p className="text-[9px] text-gray-500">Guests</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-2.5 text-center border border-gray-700/30">
                <span className="text-lg">⏱️</span><p className="text-sm font-black mt-0.5">{s.timeLimit}s</p><p className="text-[9px] text-gray-500">Limit</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-2.5 text-center border border-gray-700/30">
                <span className="text-lg">⭐</span><p className="text-sm font-black mt-0.5">{s.points}</p><p className="text-[9px] text-gray-500">Points</p>
              </div>
            </div>
            <div className="bg-orange-500/5 rounded-xl p-3.5 mb-4 border-l-4 border-orange-500 min-h-[65px]">
              <p className="text-sm leading-relaxed" key={storyIdx} style={{ animation: 'fadeIn 0.3s ease' }}>{s.story[storyIdx]}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">{s.story.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i <= storyIdx ? 'bg-orange-500 w-5' : 'bg-gray-700 w-3'}`} />
              ))}</div>
              <button onClick={next} className="px-6 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
                {storyIdx < s.story.length - 1 ? 'Continue' : '🎯 Enter'} →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white select-none ${shake ? 'animate-shake' : ''}`}>
      {(phase === 'panic' || phase === 'extinguish' || phase === 'evacuate') && combo && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-4xl font-black text-yellow-400 animate-bounce" style={{ textShadow: '0 0 30px rgba(250,204,21,0.5)' }}>{combo}</div>
        </div>
      )}

      {/* PATROL */}
      {phase === 'patrol' && (
        <div className="min-h-screen flex flex-col">
          <div className="bg-gray-900/95 border-b border-gray-700/50 px-3 py-2 flex items-center justify-between flex-wrap gap-2 z-10">
            <div className="flex items-center gap-2">
              <button onClick={() => { if (confirm('Exit?')) onNavigate('party'); }} className="px-3 py-1 bg-gray-800 rounded-lg hover:bg-gray-700 text-xs border border-gray-700/50">← Exit</button>
              <div className="bg-gray-800 rounded-lg px-2 py-1 text-[10px] border border-gray-700/50">📍 {vr.size}/{s.rooms.length} rooms</div>
            </div>
            <div className="flex items-center gap-2">
              {hint && <span className="text-[10px] text-yellow-400 animate-pulse hidden lg:inline">{hint}</span>}
              <span className={`text-base font-mono font-black ${tc}`}>⏱️ {timeLeft}s</span>
              <button onClick={() => setCs(c => ({ w: c.w + 100, h: c.h + 70 }))} className="px-2 py-1 rounded text-[10px] bg-gray-800 border border-gray-700/50">+</button>
            </div>
          </div>
          <div className="p-3 flex-1" ref={wrapRef}>
            <canvas ref={cvRef} width={cs.w} height={cs.h} onClick={handleClick} className="w-full rounded-2xl border border-gray-700/50 cursor-pointer" />
            <p className="text-[9px] text-gray-600 text-center mt-1">WASD/Arrows move • Click to waypoint • Find 🔔 alarm (E/Space) • + to zoom</p>
            {found && !alarmOn && (
              <div className="text-center mt-2">
                <button onClick={activateAlarm} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 animate-pulse">🚨 ACTIVATE ALARM (Space)</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANIC */}
      {phase === 'panic' && (
        <div className="min-h-screen flex flex-col">
          <div className="bg-red-900/30 border-b border-red-500/30 px-3 py-2.5 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-pulse">🚨</span>
              <span className="font-black text-red-400 text-xs tracking-wider">PANIC — FIRE SPREADING</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">🔥 {Math.round(fire)}%</span>
              <span className={`text-base font-mono font-black ${tc}`}>⏱️ {timeLeft}s</span>
            </div>
          </div>
          <div className="p-3">
            <div className="text-center text-xs text-red-300 font-bold mb-2">⚠️ Guests panicking! Activate alarm + extinguish fire!</div>
            <div ref={wrapRef}>
              <canvas ref={cvRef} width={cs.w} height={cs.h} className="w-full rounded-2xl border border-red-500/30" />
            </div>
          </div>
        </div>
      )}

      {/* EXTINGUISH */}
      {phase === 'extinguish' && (
        <div className="min-h-screen flex flex-col">
          <div className="bg-gray-900/95 border-b border-gray-700/50 px-3 py-2 flex items-center justify-between z-10">
            <span className="text-[10px] text-gray-400 font-bold">🧯 EXTINGUISH THE FIRE</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gray-400">🔥 {Math.round(fire)}%</span>
              <span className={`text-base font-mono font-black ${tc}`}>⏱️ {timeLeft}s</span>
            </div>
          </div>
          <div className="p-3 flex-1">
            <div className="max-w-3xl mx-auto">
              <div style={{ aspectRatio: '16/9', maxHeight: '340px' }} ref={wrapRef}>
                <canvas ref={cvRef} width={cs.w} height={cs.h} className="w-full h-full rounded-2xl border border-orange-500/30" />
              </div>
              <div className="bg-gray-900/80 rounded-xl p-2 mb-3 border border-gray-700/50">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(100 - fire, 0)}%`, background: 'linear-gradient(to right, #eab308, #22c55e)' }} />
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 p-3">
                <p className="text-[10px] text-center text-gray-400 mb-2 font-bold">🧯 PASS — click in order</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {passSteps.map(st => (
                    <button key={st.n} onClick={() => passClick(st.n)} disabled={st.n !== passN + 1 || !isOk}
                      className="rounded-lg border p-2 text-center transition-all">
                      <span className="text-lg block">{st.n < passN ? '✅' : '🧯'}</span>
                      <p className={`text-base font-black ${st.n === passN + 1 ? 'text-orange-400' : ''}`}>{st.l}</p>
                      <p className="text-[8px] text-gray-500">{st.t}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVACUATE */}
      {phase === 'evacuate' && (
        <div className="min-h-screen flex flex-col">
          <div className="bg-green-900/30 border-b border-green-500/30 px-3 py-2 flex items-center justify-between z-10">
            <span className="text-xs font-black text-green-400">🏃 EVACUATE ALL GUESTS!</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gray-400">Evacuated: <strong className="text-green-400">{rescued}</strong></span>
              <span className="text-[10px] text-gray-400">Trapped: <strong className="text-red-400">{trapped}</strong></span>
              <span className={`text-base font-mono font-black ${tc}`}>⏱️ {timeLeft}s</span>
            </div>
          </div>
          <div className="p-3 flex-1">
            <div ref={wrapRef} style={{ aspectRatio: '16/10' }}>
              <canvas ref={cvRef} width={cs.w} height={cs.h} className="w-full rounded-2xl border border-green-500/20" />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.003)} }
        .animate-heartbeat { animation: heartbeat 0.3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
