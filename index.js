/**
 * script.js — DEVMATRIX Landing Page
 * Módulo ES2022 organizado por categorías:
 *   1. ANIMACIONES  — Estrellas, typing effect, mouse glow
 *   2. INTERFAZ     — Nav, mobile menu, scroll reveal, scroll progress
 *   3. CHAT DEMO    — Chat interactivo del mockup
 *   4. UTILIDADES   — Copy al clipboard, toast, smooth scroll
 *   5. INIT         — Punto de entrada único
 */

'use strict';

// ═══════════════════════════════════════════════════════
// 1. ANIMACIONES
// ═══════════════════════════════════════════════════════

/** Genera estrellas animadas en el fondo */
function createStars() {
  const container = document.getElementById('stars');
  if (!container) return;
  for (let i = 0; i < 90; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top  = `${Math.random() * 100}%`;
    star.style.setProperty('--d', `${2 + Math.random() * 5}s`);
    star.style.setProperty('--o', String(0.15 + Math.random() * 0.6));
    star.style.animationDelay = `${Math.random() * 6}s`;
    container.appendChild(star);
  }
}

/** Efecto typing en el hero — rota frases con cursor parpadeante */
const PHRASES = [
  'potencia tu código',
  'integra IA fácil',
  'habla con tu app',
  'genera imágenes',
  'analiza cualquier imagen',
  'debug instantáneo',
];

function initTypingEffect() {
  const el = document.getElementById('typingText');
  if (!el) return;

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;

  function tick() {
    const phrase = PHRASES[phraseIdx];
    if (!deleting) {
      el.textContent = phrase.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
      setTimeout(tick, 60 + Math.random() * 40);
    } else {
      el.textContent = phrase.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 30);
    }
  }
  tick();
}

/** Mouse glow — sigue el cursor con interpolación suave (lerp) */
function initMouseGlow() {
  const glow = document.getElementById('mouseGlow');
  if (!glow) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    currentX = lerp(currentX, targetX, 0.08);
    currentY = lerp(currentY, targetY, 0.08);
    glow.style.left = `${currentX}px`;
    glow.style.top  = `${currentY}px`;
    requestAnimationFrame(animate);
  }
  animate();
}

/** Mouse tracking por tarjeta — para el efecto radial en hover */
function initCardMouseTracking() {
  document.querySelectorAll('.feat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

// ═══════════════════════════════════════════════════════
// 2. INTERFAZ
// ═══════════════════════════════════════════════════════

/** Navbar: clase 'scrolled' + barra de progreso */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const progress = document.getElementById('scrollProgress');
  if (!navbar || !progress) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${(window.scrollY / scrollable) * 100}%`;
  }, { passive: true });
}

/** Menú hamburguesa (móvil) */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });

  // Cerrar al hacer click en un enlace
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });
}

/** Scroll reveal con IntersectionObserver */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/** Smooth scroll para links con ancla (#) */
function initSmoothScroll() {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger  = document.getElementById('hamburger');

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      mobileMenu?.classList.remove('open');
      hamburger?.classList.remove('active');
    });
  });
}

/** Detecta sesión activa y cambia CTA buttons a "Ir al chat" */
function initSessionCTA() {
  if (!localStorage.getItem('matrix_apikey')) return;
  document.querySelectorAll('a[href="/login"]').forEach(el => {
    const text = el.textContent.trim();
    if (text.includes('gratis') || text.includes('Empezar') || text.includes('cuenta')) {
      el.href = '/chat';
      el.innerHTML = el.innerHTML
        .replace(/Empezar gratis|Crear cuenta gratis/, 'Ir al chat');
    }
  });
}

// ═══════════════════════════════════════════════════════
// 3. CHAT DEMO
// ═══════════════════════════════════════════════════════

const AI_RESPONSES = [
  {
    text: 'Claro, aquí tienes un ejemplo de debounce:',
    code: `function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}`,
    lang: 'JavaScript',
  },
  {
    text: 'Aquí tienes una forma elegante de hacer deep clone:',
    code: `const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
  );
};`,
    lang: 'JavaScript',
  },
  {
    text: 'Te muestro cómo usar IntersectionObserver:',
    code: `const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);`,
    lang: 'JavaScript',
  },
  {
    text: 'Aquí tienes un patrón de middleware para Express:',
    code: `const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'dev'
      ? err.stack : undefined
  });
};`,
    lang: 'JavaScript',
  },
];

let responseIdx = 0;

function appendUserMessage(chatBody, text) {
  const msg = document.createElement('div');
  msg.className = 'cm-msg user';
  msg.innerHTML = `
    <div class="cm-avatar user">K</div>
    <div class="cm-bubble">${escapeHtml(text)}</div>
  `;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function appendAICodeMessage(chatBody, { text, code, lang }) {
  const msg = document.createElement('div');
  msg.className = 'cm-msg ai';
  msg.innerHTML = `
    <div class="cm-avatar ai">DM</div>
    <div class="cm-bubble">
      ${escapeHtml(text)}
      <div class="cm-code">
        <div class="cm-code-header">
          <span class="cm-code-lang">${lang}</span>
          <button class="cm-code-copy" data-action="copy-code">
            <i data-lucide="clipboard" style="width:12px;height:12px;"></i>
            Copiar
          </button>
        </div>
        ${escapeHtml(code)}
      </div>
    </div>
  `;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
  if (window.lucide) lucide.createIcons({ nodes: [msg] });
}

function showTypingIndicator(chatBody) {
  const msg = document.createElement('div');
  msg.className = 'cm-msg ai';
  msg.id = 'typingMsg';
  msg.innerHTML = `
    <div class="cm-avatar ai">DM</div>
    <div class="cm-bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById('typingMsg')?.remove();
}

function initChatDemo() {
  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatInput');
  const chatSend  = document.getElementById('chatSend');
  if (!chatBody || !chatInput || !chatSend) return;

  function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    appendUserMessage(chatBody, text);
    chatInput.value = '';
    showTypingIndicator(chatBody);
    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
      removeTypingIndicator();
      appendAICodeMessage(chatBody, AI_RESPONSES[responseIdx % AI_RESPONSES.length]);
      responseIdx++;
    }, delay);
  }

  chatSend.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
}

// ═══════════════════════════════════════════════════════
// 4. UTILIDADES
// ═══════════════════════════════════════════════════════

/** Escapa caracteres HTML para evitar XSS en contenido dinámico */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Muestra un toast de notificación */
function showToast(message) {
  const toast   = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/**
 * Copia el texto de un bloque de código al portapapeles.
 * Busca el bloque .cm-code más cercano al botón pulsado.
 */
function copyCodeBlock(btn) {
  const block = btn.closest('.cm-code');
  if (!block) return;
  // Excluir el header del bloque (lang + botón)
  const header = block.querySelector('.cm-code-header');
  const clone  = block.cloneNode(true);
  clone.querySelector('.cm-code-header')?.remove();
  const text = clone.textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<i data-lucide="check" style="width:12px;height:12px;"></i> Copiado';
    if (window.lucide) lucide.createIcons({ nodes: [btn] });
    showToast('Código copiado al portapapeles');
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<i data-lucide="clipboard" style="width:12px;height:12px;"></i> Copiar';
      if (window.lucide) lucide.createIcons({ nodes: [btn] });
    }, 2000);
  });
}

/** Copia el bloque de la sección API */
function copyApiBlock(btn) {
  const block = document.getElementById('apiCodeBlock');
  if (!block) return;
  navigator.clipboard.writeText(block.textContent.trim()).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<i data-lucide="check" style="width:12px;height:12px;"></i> Copiado';
    if (window.lucide) lucide.createIcons({ nodes: [btn] });
    showToast('Código API copiado');
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<i data-lucide="clipboard" style="width:12px;height:12px;"></i> Copiar';
      if (window.lucide) lucide.createIcons({ nodes: [btn] });
    }, 2000);
  });
}

/** Delegación de eventos para todos los botones de copia */
function initCopyButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    switch (btn.dataset.action) {
      case 'copy-code': copyCodeBlock(btn); break;
      case 'copy-api':  copyApiBlock(btn);  break;
    }
  });
}

// ═══════════════════════════════════════════════════════
// 5. INIT — Punto de entrada único
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Animaciones
  createStars();
  initTypingEffect();
  initMouseGlow();
  initCardMouseTracking();

  // Interfaz
  initNavbar();
  initMobileMenu();
  initReveal();
  initSmoothScroll();
  initSessionCTA();

  // Chat demo
  initChatDemo();

  // Utilidades
  initCopyButtons();

  // Lucide icons
  if (window.lucide) lucide.createIcons();
});
