import { marked } from 'marked';
import script from '../docs/story-script.md?raw';

const article = document.getElementById('script-content');
article.innerHTML = marked.parse(script);
const toc = document.getElementById('script-toc');
article.querySelectorAll('h2').forEach((h, i) => {
  h.id = `part-${i}`;
  const a = document.createElement('a');
  a.href = `#${h.id}`;
  a.textContent = h.textContent;
  toc.appendChild(a);
});
document.getElementById('voice-only').addEventListener('click', (e) => {
  const active = article.classList.toggle('voice-only');
  e.currentTarget.setAttribute('aria-pressed', String(active));
  e.currentTarget.textContent = active ? '查看完整分镜' : '只看旁白';
});
document.getElementById('print-script').addEventListener('click', () => window.print());
