export function Card(title: string, content: string | HTMLElement, className = ''): HTMLElement {
  const el = document.createElement('div');
  el.className = `glass-card panel-card animate-fade-in ${className}`;

  const heading = document.createElement('h3');
  heading.className = 'text-lg font-bold mb-4 gradient-text';
  heading.textContent = title;
  el.appendChild(heading);

  if (typeof content === 'string') {
    const p = document.createElement('p');
    p.className = 'text-muted text-sm';
    p.textContent = content;
    el.appendChild(p);
  } else {
    el.appendChild(content);
  }

  return el;
}
