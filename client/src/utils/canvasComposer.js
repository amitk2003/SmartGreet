import { loadImage } from './imageUtils';

const W = 800, H = 1000;

// ── Parse gradient color stops ─────────────────────
const parseColors = (gradStr) => (gradStr && gradStr.match(/#[0-9a-fA-F]{3,8}/g)) || ['#1a1a2e', '#7c3aed'];

// ── Draw background gradient ───────────────────────
const drawBg = async (ctx, template) => {
  if (template.backgroundUrl) {
    try {
      const img = await loadImage(template.backgroundUrl);
      ctx.drawImage(img, 0, 0, W, H);
      // Optional: dark overlay to ensure text visibility
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, W, H);
      return;
    } catch (err) {
      console.error('Failed to load background image', err);
    }
  }

  const colors = parseColors(template.gradient);
  const angle = 135 * (Math.PI / 180);
  const grd = ctx.createLinearGradient(
    W / 2 - Math.cos(angle) * W, H / 2 - Math.sin(angle) * H,
    W / 2 + Math.cos(angle) * W, H / 2 + Math.sin(angle) * H
  );
  colors.forEach((c, i) => grd.addColorStop(i / Math.max(colors.length - 1, 1), c));
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
};

// ── Draw pattern overlay ───────────────────────────
const drawPattern = (ctx, { pattern, accentColor }) => {
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = accentColor || '#fff';

  if (pattern === 'dots') {
    for (let x = 20; x < W; x += 40)
      for (let y = 20; y < H; y += 40) {
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      }
  } else if (pattern === 'stars' || pattern === 'sparkles') {
    for (let i = 0; i < 50; i++) {
      drawStar(ctx, Math.random() * W, Math.random() * H, 8, 4, 5);
      ctx.fill();
    }
  } else if (pattern === 'hearts') {
    for (let x = 50; x < W; x += 80)
      for (let y = 50; y < H; y += 80)
        drawHeart(ctx, x, y, 14);
  } else if (pattern === 'confetti') {
    const cols = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff'];
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = cols[i % cols.length];
      ctx.globalAlpha = 0.3;
      ctx.save();
      ctx.translate(Math.random() * W, Math.random() * H);
      ctx.rotate(Math.random() * Math.PI * 2);
      ctx.fillRect(-6, -3, 12, 6);
      ctx.restore();
    }
  } else if (pattern === 'geometric') {
    ctx.strokeStyle = accentColor || '#fff'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60)
      for (let y = 0; y < H; y += 60)
        ctx.strokeRect(x + 10, y + 10, 40, 40);
  } else {
    for (let x = 20; x < W; x += 40)
      for (let y = 20; y < H; y += 40) {
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      }
  }
  ctx.restore();
};

const drawStar = (ctx, cx, cy, outerR, innerR, pts) => {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const angle = (i * Math.PI) / pts - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
  }
  ctx.closePath();
};

const drawHeart = (ctx, x, y, size) => {
  ctx.save(); ctx.translate(x, y); ctx.beginPath();
  ctx.moveTo(0, -size / 4);
  ctx.bezierCurveTo(size / 2, -size, size, -size / 4, 0, size / 2);
  ctx.bezierCurveTo(-size, -size / 4, -size / 2, -size, 0, -size / 4);
  ctx.fill(); ctx.restore();
};

// ── Draw title + emoji + wish text ────────────────
const drawDecorations = (ctx, template) => {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, 200);
  ctx.restore();

  ctx.font = 'bold 110px serif';
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#fff';
  ctx.fillText(template.emoji, W / 2, 150);
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 52px Poppins,Inter,sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 12;
  ctx.fillText(template.title, W / 2, 260);
  ctx.shadowBlur = 0;

  ctx.font = '28px Inter,sans-serif';
  ctx.globalAlpha = 0.9;
  wrapText(ctx, template.wish, W / 2, 320, W - 80, 38);
  ctx.globalAlpha = 1;
};

const wrapText = (ctx, text, x, y, maxW, lh) => {
  const words = text.split(' ');
  let line = '';
  words.forEach((word) => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, y); line = word + ' '; y += lh;
    } else line = test;
  });
  ctx.fillText(line.trim(), x, y);
};

// ── Draw user photo + name panel (core feature) ───
const drawUserOverlay = async (ctx, template, user) => {
  // Bottom gradient panel
  const ph = 280, py = H - ph;
  const grd = ctx.createLinearGradient(0, py, 0, H);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(0.4, 'rgba(0,0,0,0.55)');
  grd.addColorStop(1, 'rgba(0,0,0,0.88)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, py, W, ph);

  // Glass card
  const cx = 40, cy = H - 200, cw = W - 80, ch = 160, cr = 24;
  roundRect(ctx, cx, cy, cw, ch, cr);
  ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.28; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
  roundRect(ctx, cx, cy, cw, ch, cr); ctx.stroke(); ctx.restore();

  // Profile circle
  const px = cx + 28, py2 = cy + ch / 2, pr = 58;
  ctx.save();
  ctx.beginPath(); ctx.arc(px, py2, pr + 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath(); ctx.arc(px, py2, pr, 0, Math.PI * 2); ctx.clip();
  if (user.photo) {
    try {
      const img = await loadImage(user.photo);
      ctx.drawImage(img, px - pr, py2 - pr, pr * 2, pr * 2);
    } catch { drawInitialAvatar(ctx, px - pr, py2 - pr, pr * 2, user.name); }
  } else {
    drawInitialAvatar(ctx, px - pr, py2 - pr, pr * 2, user.name);
  }
  ctx.restore();

  // Name + subtitle
  const tx = px + pr + 24;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px Poppins,Inter,sans-serif';
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText(user.name || 'Your Name', tx, cy + ch / 2 - 16);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.68)';
  ctx.font = '24px Inter,sans-serif';
  ctx.fillText('via ClaasPlus 🎉', tx, cy + ch / 2 + 26);

  // Watermark
  if (!user.isPremium) {
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.font = '18px Inter,sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('claasplus.app', W - 28, H - 18);
  }
};

const drawInitialAvatar = (ctx, x, y, size, name = '') => {
  const grd = ctx.createLinearGradient(x, y, x + size, y + size);
  grd.addColorStop(0, '#7c3aed'); grd.addColorStop(1, '#a78bfa');
  ctx.fillStyle = grd; ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size * 0.4}px Poppins,Inter,sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText((name || 'G')[0].toUpperCase(), x + size / 2, y + size / 2 + size * 0.14);
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

// ── Main export ────────────────────────────────────
export const composeCard = async (canvas, template, user) => {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  await drawBg(ctx, template);
  drawPattern(ctx, template);
  drawDecorations(ctx, template);
  await drawUserOverlay(ctx, template, user);
};

// ── Dynamic Video Export ───────────────────────────
const drawDynamicPattern = (ctx, template, frame) => {
  ctx.save();
  ctx.fillStyle = template.accentColor || '#fff';
  // Use math to pseudo-randomly place 60 stars that move and twinkle based on the frame count
  for (let i = 0; i < 60; i++) {
    // calculate deterministic but scattered positions
    const startX = Math.abs(Math.sin(i * 123.45)) * W;
    const startY = Math.abs(Math.cos(i * 321.12)) * H;
    
    // add movement based on frame
    const speedX = (i % 3) - 1; // -1, 0, 1
    const speedY = ((i % 5) + 1) * 0.5; // moving down
    
    let x = (startX + speedX * frame) % W;
    let y = (startY + speedY * frame) % H;
    if (x < 0) x += W;
    
    // twinkle effect
    const scale = 0.5 + 0.5 * Math.sin(frame * 0.1 + i);
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.1 + (0.6 * scale);
    drawStar(ctx, 0, 0, 8, 4, 5);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
};

export const composeVideoCard = async (canvas, template, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Render the static parts to an offscreen canvas
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = W; baseCanvas.height = H;
      const baseCtx = baseCanvas.getContext('2d');
      await drawBg(baseCtx, template);
      // We skip the static pattern here so we can draw it dynamically
      drawDecorations(baseCtx, template);
      await drawUserOverlay(baseCtx, template, user);

      // 2. Setup main canvas for recording
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      
      const stream = canvas.captureStream(30); // 30 FPS
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];
      
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      
      recorder.start();

      let frame = 0;
      const totalFrames = 30 * 4; // 4 seconds total
      
      const loop = () => {
        // Draw the static background and overlays
        ctx.drawImage(baseCanvas, 0, 0);
        
        // Draw the moving animated pattern on top
        drawDynamicPattern(ctx, template, frame);
        
        frame++;
        if (frame < totalFrames) {
          requestAnimationFrame(loop);
        } else {
          recorder.stop();
        }
      };
      
      loop();
    } catch (err) {
      reject(err);
    }
  });
};
