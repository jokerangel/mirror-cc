import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface ParticleHandle {
  morphTo: (shape: 'discovery' | 'records' | 'deduction' | 'world' | 'injection' | 'idle' | 'aggregate', options?: { centerX?: number, centerY?: number }) => void;
  morphToImage: (url: string, options?: { centerX?: number, centerY?: number, panelWidth?: number, panelHeight?: number, animate?: boolean }) => void;
  setProcessing: (active: boolean) => void;
}

export const ParticleBackground = forwardRef<ParticleHandle, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const currentShape = useRef<string>('idle');
  const morphCenter = useRef({ x: 0, y: 0 });
  const isProcessing = useRef(false);
  const lastImageUrl = useRef<string>('');
  const lastImageOptions = useRef<{ centerX?: number; centerY?: number; panelWidth?: number; panelHeight?: number }>({});

  const getShapePoints = (shape: string, w: number, h: number, options?: { centerX?: number, centerY?: number }): Point3D[] => {
    const points: Point3D[] = [];
    const centerX = options?.centerX ?? w / 2;
    const centerY = options?.centerY ?? h / 2;
    morphCenter.current = { x: centerX, y: centerY };
    const count = 100000;

    switch (shape) {
      case 'discovery':
        // Humanoid bust silhouette (Abstract)
        for (let i = 0; i < count; i++) {
          const rand = i / count;
          let x, y, z;

          if (rand < 0.15) {
            // Head (Sphere)
            const r = 45;
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            x = r * Math.sin(phi) * Math.cos(theta);
            y = -160 + r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
          } else if (rand < 0.2) {
            // Neck
            x = (Math.random() - 0.5) * 30;
            y = -110 + (Math.random() - 0.5) * 40;
            z = (Math.random() - 0.5) * 30;
          } else if (rand < 0.7) {
            // Chest / Shoulders (Ellipsoid)
            const rX = 120;
            const rY = 140;
            const rZ = 70;
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            x = rX * Math.sin(phi) * Math.cos(theta);
            y = 20 + rY * Math.sin(phi) * Math.sin(theta);
            z = rZ * Math.cos(phi);
            if (y > 100) y = 100;
          } else {
            // Aura / Background particles
            const r = 250 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            x = r * Math.sin(phi) * Math.cos(theta);
            y = -100 + r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
          }

          points.push({
            x: centerX + x,
            y: centerY + y,
            z: z
          });
        }
        break;
      case 'world':
        // Horizontal "World Tree" / Branching Timeline
        for (let i = 0; i < count; i++) {
          const t = Math.random();
          let x, y, z;

          x = (t - 0.5) * w * 1.5;

          const trunkY = Math.sin(t * 3) * 30;

          const branchIntervals = [0.1, 0.25, 0.4, 0.6, 0.75, 0.9];
          let closestBranch = branchIntervals[0];
          let minDist = 1;
          branchIntervals.forEach(b => {
             if (Math.abs(t - b) < minDist) {
                minDist = Math.abs(t - b);
                closestBranch = b;
             }
          });

          const branchID = branchIntervals.indexOf(closestBranch);
          const branchDir = (branchID % 2 === 0 ? 1 : -1);
          const branchStrength = Math.max(0, (t - closestBranch) * 5);
          const isBranchParticle = i % 10 < 4 && t > closestBranch;

          let targetY = trunkY;
          if (isBranchParticle) {
             targetY += branchDir * branchStrength * 120;
          }

          const isCore = i % 10 < 2;
          const scatterRadius = isCore ? 5 : (30 + Math.random() * 150);
          const angle = Math.random() * Math.PI * 2;
          const r = Math.pow(Math.random(), 1.5) * scatterRadius;

          x += Math.cos(angle) * r * 0.3;
          y = targetY + Math.sin(angle) * r;
          z = (Math.random() - 0.5) * 120;

          points.push({
            x: centerX + x,
            y: centerY + y,
            z: z
          });
        }
        break;
      case 'records':
      case 'idle':
        // Slow floating sphere/nebula
        for (let i = 0; i < count; i++) {
          const phi = Math.acos(-1 + (2 * i) / count);
          const theta = Math.sqrt(count * Math.PI) * phi;
          const r = 240 + Math.random() * 20;
          points.push({
            x: centerX + r * Math.cos(theta) * Math.sin(phi),
            y: centerY + r * Math.sin(theta) * Math.sin(phi),
            z: r * Math.cos(phi)
          });
        }
        break;
      default:
        // Basic sphere
        for (let i = 0; i < count; i++) {
          const phi = Math.acos(-1 + (2 * i) / count);
          const theta = Math.sqrt(count * Math.PI) * phi;
          const r = 250;
          points.push({
            x: centerX + r * Math.cos(theta) * Math.sin(phi),
            y: centerY + r * Math.sin(theta) * Math.sin(phi),
            z: r * Math.cos(phi)
          });
        }
    }
    return points;
  };

  const imageToSampledPoints = (
    img: HTMLImageElement,
    centerX: number,
    centerY: number,
    panelW: number,
    panelH: number
  ): { x: number; y: number; color: string }[] => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    let imgW = img.width;
    let imgH = img.height;
    const scale = Math.min(panelW / imgW, panelH / imgH, 1);
    imgW = Math.floor(imgW * scale);
    imgH = Math.floor(imgH * scale);

    canvas.width = imgW;
    canvas.height = imgH;
    ctx.drawImage(img, 0, 0, imgW, imgH);

    const imageData = ctx.getImageData(0, 0, imgW, imgH).data;
    const sampledPoints: { x: number; y: number; color: string }[] = [];
    const count = 100000;
    const step = Math.max(1, Math.ceil(Math.sqrt((imgW * imgH) / count)));

    for (let sy = 0; sy < imgH; sy += step) {
      for (let sx = 0; sx < imgW; sx += step) {
        const index = (sy * imgW + sx) * 4;
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const a = imageData[index + 3];

        if (a > 50 && (r + g + b) > 30) {
          sampledPoints.push({
            x: centerX + (sx - imgW / 2),
            y: centerY + (sy - imgH / 2),
            color: `rgb(${r},${g},${b})`
          });
        }
      }
    }

    // Shuffle to ensure uniform distribution across the entire image
    for (let i = sampledPoints.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sampledPoints[i], sampledPoints[j]] = [sampledPoints[j], sampledPoints[i]];
    }

    return sampledPoints;
  };

  useImperativeHandle(ref, () => ({
    morphTo: (shape, options) => {
      currentShape.current = (shape as any);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const pts = getShapePoints(shape, w, h, options);

      const worldColors = ['#50e3c2', '#7edafc', '#bd10e0', '#f8e71c', '#ffffff', '#9abdc4'];
      const defaultColors = ['#d4a574', '#e8d5b7'];

      particles.current.forEach((p, i) => {
        const pt = pts[i % pts.length];
        p.setTarget(pt.x, pt.y, pt.z, true);

        if (shape === 'world') {
          p.color = worldColors[i % worldColors.length];
        } else {
          p.color = Math.random() > 0.8 ? defaultColors[0] : defaultColors[1];
        }
      });
    },
    setProcessing: (active) => {
      isProcessing.current = active;
    },
    morphToImage: (url, options) => {
      currentShape.current = 'image';
      lastImageUrl.current = url;
      lastImageOptions.current = options || {};
      const animate = options?.animate !== false;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const centerX = options?.centerX ?? w * 0.25;
        const centerY = options?.centerY ?? h * 0.5;
        morphCenter.current = { x: centerX, y: centerY };

        const panelW = options?.panelWidth ?? w * 0.4;
        const panelH = options?.panelHeight ?? h * 0.6;

        const sampledPoints = imageToSampledPoints(img, centerX, centerY, panelW, panelH);
        if (sampledPoints.length === 0) return;

        if (animate) {
          // Phase 1: scatter particles outward
          particles.current.forEach((p) => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const scatterDist = 200 + Math.random() * 300;
            const scatterX = centerX + (dx / dist) * scatterDist + (Math.random() - 0.5) * 100;
            const scatterY = centerY + (dy / dist) * scatterDist + (Math.random() - 0.5) * 100;
            const scatterZ = (Math.random() - 0.5) * 400;
            p.setTarget(scatterX, scatterY, scatterZ, true);
            p.color = Math.random() > 0.5 ? '#d4a574' : '#e8d5b7';
          });

          // Phase 2: reassemble to image shape
          setTimeout(() => {
            particles.current.forEach((p, i) => {
              const pt = sampledPoints[i % sampledPoints.length];
              if (pt) {
                p.setTarget(pt.x, pt.y, (Math.random() - 0.5) * 40, true);
                p.color = pt.color;
                p.ease = 0.03 + Math.random() * 0.04;
                p.friction = 0.88 + Math.random() * 0.06;
              }
            });
          }, 800);
        } else {
          // Smooth morph: particles glide directly to new positions
          particles.current.forEach((p, i) => {
            const pt = sampledPoints[i % sampledPoints.length];
            if (pt) {
              p.setTarget(pt.x, pt.y, (Math.random() - 0.5) * 40, true);
              p.color = pt.color;
              p.ease = 0.06 + Math.random() * 0.04;
              p.friction = 0.85 + Math.random() * 0.05;
            }
          });
        }
      };
    }
  }));

  interface Point3D { x: number; y: number; z: number; }
  const mouse = useRef({ x: 0, y: 0 });

  class Particle {
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    targetX: number; targetY: number; targetZ: number;
    isMorphed: boolean = false;
    color: string;
    size: number;
    opacity: number;
    ease: number = 0.05 + Math.random() * 0.05;
    friction: number = 0.9 + Math.random() * 0.05;
    wobble: number = Math.random() * Math.PI * 2;

    constructor(w: number, h: number) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.z = (Math.random() - 0.5) * 600;
      this.vx = 0; this.vy = 0; this.vz = 0;
      this.targetX = this.x; this.targetY = this.y; this.targetZ = this.z;
      this.size = Math.random() * 1.0 + 0.1;
      this.opacity = Math.random() * 0.3 + 0.05;
      this.color = Math.random() > 0.8 ? '#9abdc4' : '#e8d5b7';
    }

    setTarget(x: number, y: number, z: number, morphed: boolean) {
      this.targetX = x; this.targetY = y; this.targetZ = z;
      this.isMorphed = morphed;
    }

    update(w: number, h: number, rotation: { x: number, y: number }, centerX: number, centerY: number, processing: boolean) {
      let tx = this.targetX;
      let ty = this.targetY;
      let depthScale = 1;

      if (this.isMorphed) {
        const rx = tx - centerX;
        const ry = ty - centerY;
        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);

        const x1 = rx * cosY + this.targetZ * sinY;
        const z1 = this.targetZ * cosY - rx * sinY;
        const y2 = ry * cosX - z1 * sinX;
        const z2 = z1 * cosX + ry * sinX;

        depthScale = (z2 + 500) / 500;
        tx = centerX + x1 * depthScale;
        ty = centerY + y2 * depthScale;
      }

      this.wobble += 0.08;
      let vibrationLevel = processing ? 15.0 : 0.8;

      const vibeX = Math.cos(this.wobble) * vibrationLevel;
      const vibeY = Math.sin(this.wobble) * vibrationLevel;

      if (this.isMorphed) {
        const dx = (tx + vibeX) - this.x;
        const dy = (ty + vibeY) - this.y;
        this.vx += dx * this.ease * (processing ? 0.3 : 0.12);
        this.vy += dy * this.ease * (processing ? 0.3 : 0.12);
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.opacity = (0.2 + depthScale * 0.4) + Math.random() * 0.1;
      } else {
        this.vx += (Math.random() - 0.5) * (processing ? 0.2 : 0.015) + vibeX * 0.002;
        this.vy += (Math.random() - 0.5) * (processing ? 0.2 : 0.015) + vibeY * 0.002;
        this.vx *= processing ? 0.96 : 0.99;
        this.vy *= processing ? 0.96 : 0.99;
      }

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > w) {
        this.vx *= -1;
        this.x = Math.max(0, Math.min(w, this.x));
      }
      if (this.y < 0 || this.y > h) {
        this.vy *= -1;
        this.y = Math.max(0, Math.min(h, this.y));
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const count = 100000;
    if (particles.current.length === 0) {
      particles.current = Array.from({ length: count }, () => new Particle(w, h));
    }

    let rotation = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      targetRotation.y = (e.clientX - w / 2) * 0.0005;
      targetRotation.x = (e.clientY - h / 2) * 0.0005;
    };

    let animId: number;
    const animate = () => {
      rotation.x += (targetRotation.x - rotation.x) * 0.05;
      rotation.y += (targetRotation.y - rotation.y) * 0.05;

      ctx.clearRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';

      const cx = morphCenter.current.x || w / 2;
      const cy = morphCenter.current.y || h / 2;

      particles.current.forEach(p => {
        p.update(w, h, rotation, cx, cy, isProcessing.current);
        p.draw(ctx);
      });

      ctx.globalCompositeOperation = 'source-over';

      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      if (currentShape.current !== 'idle') {
        if (currentShape.current === 'image' && lastImageUrl.current) {
          const opts = lastImageOptions.current;
          // Recalculate panel position from DOM
          const leftPanel = document.getElementById('records-left-panel');
          if (leftPanel) {
            const rect = leftPanel.getBoundingClientRect();
            opts.centerX = rect.left + rect.width / 2;
            opts.centerY = rect.top + rect.height / 2;
            opts.panelWidth = rect.width * 0.85;
            opts.panelHeight = rect.height * 0.7;
          }
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = lastImageUrl.current;
          img.onload = () => {
            const centerX = opts.centerX ?? w / 2;
            const centerY = opts.centerY ?? h / 2;
            morphCenter.current = { x: centerX, y: centerY };
            const panelW = opts.panelWidth ?? w * 0.4;
            const panelH = opts.panelHeight ?? h * 0.6;
            const resizePoints = imageToSampledPoints(img, centerX, centerY, panelW, panelH);
            particles.current.forEach((p, i) => {
              const pt = resizePoints[i % resizePoints.length];
              if (pt) {
                p.setTarget(pt.x, pt.y, (Math.random() - 0.5) * 40, true);
              }
            });
          };
        } else {
          const cx = morphCenter.current.x || w / 2;
          const cy = morphCenter.current.y || h / 2;
          const pts = getShapePoints(currentShape.current, w, h, { centerX: cx, centerY: cy });
          particles.current.forEach((p, i) => {
            const pt = pts[i % pts.length];
            p.setTarget(pt.x, pt.y, pt.z, true);
          });
        }
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'radial-gradient(circle at center, #0a0a0d 0%, #000 100%)' }}
    />
  );
});

ParticleBackground.displayName = 'ParticleBackground';