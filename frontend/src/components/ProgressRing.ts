const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing(): { el: HTMLElement; setProgress: (pct: number, days: number) => void } {
  const el = document.createElement('div');
  el.className = 'progress-ring';
  el.innerHTML = `
    <svg class="progress-ring__svg" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff3366"/>
          <stop offset="50%" stop-color="#6366f1"/>
          <stop offset="100%" stop-color="#0ea5e9"/>
        </linearGradient>
      </defs>
      <circle class="progress-ring__track" cx="60" cy="60" r="${RADIUS}" />
      <circle class="progress-ring__fill" id="progress-ring-fill" cx="60" cy="60" r="${RADIUS}" />
    </svg>
    <div class="progress-ring__content">
      <span class="progress-ring__value" id="progress-ring-days">—</span>
      <span class="progress-ring__label">días restantes</span>
    </div>
  `;

  const fill = el.querySelector('#progress-ring-fill') as SVGCircleElement;
  fill.style.strokeDasharray = `${CIRCUMFERENCE}`;
  fill.style.strokeDashoffset = `${CIRCUMFERENCE}`;

  function setProgress(pct: number, days: number): void {
    const clamped = Math.max(0, Math.min(100, pct));
    fill.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - clamped / 100)}`;
    (el.querySelector('#progress-ring-days') as HTMLElement).textContent = String(days);
  }

  return { el, setProgress };
}
