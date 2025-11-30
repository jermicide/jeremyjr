// public/scripts/matrix.js
function createMatrixBackground(canvas) {
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
  const charArray = chars.split('');
  const fontSize = 14;
  const columns = Math.floor(width / fontSize);
  const drops = Array(columns).fill(height);

  let animationFrameId;

  function draw() {
    ctx.fillStyle = 'rgba(0, 25, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#00FF41';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = charArray[Math.floor(Math.random() * charArray.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  function startAnimation() {
    function animate() {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    }
    animate();
  }

  function stopAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  }

  function handleResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // No need to reset drops, it adapts
  }
  
  window.addEventListener('resize', handleResize);

  return { start: startAnimation, stop: stopAnimation };
}
