document.addEventListener('DOMContentLoaded', () => {
  const secretMenu = document.getElementById('secret-menu');
  const closeButton = document.getElementById('close-secret-menu');

  if (!secretMenu || !closeButton) {
    return;
  }

  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];

  let konamiIndex = 0;

  const keydownHandler = (event) => {
    if (event.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        secretMenu.classList.remove('hidden');
        konamiIndex = 0; // Reset for next time
      }
    } else {
      konamiIndex = 0;
    }
  };

  document.addEventListener('keydown', keydownHandler);

  closeButton.addEventListener('click', () => {
    secretMenu.classList.add('hidden');
  });
});
