const SCROLL_THRESHOLD = 60;
const REVEAL_THRESHOLD = 0.1;
const REVEAL_ROOT_MARGIN = '0px 0px -60px 0px';
const CONTACT_EMAIL = 'office@argoshellas.rs';
const MAX_FIELD_LEN = 5000;

function setupNavScroll(): void {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const onScroll = (): void => {
    nav.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function setupReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('.reveal');
  if (targets.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      }
    },
    { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN },
  );

  targets.forEach((el) => observer.observe(el));
}

function setupSmoothScroll(): void {
  const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
  anchors.forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function setupImageFallbacks(): void {
  const images = document.querySelectorAll<HTMLImageElement>('img[data-fallback]');
  images.forEach((img) => {
    img.addEventListener(
      'error',
      () => {
        const fallback = img.dataset['fallback'];
        if (!fallback || img.src === fallback) return;
        img.src = fallback;
      },
      { once: true },
    );
  });
}

function getTrimmed(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement) && !(el instanceof HTMLSelectElement)) {
    return '';
  }
  return el.value.trim().slice(0, MAX_FIELD_LEN);
}

function isValidEmail(value: string): boolean {
  if (value.length === 0 || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildMailto(payload: {
  name: string;
  company: string;
  email: string;
  phone: string;
  area: string;
  message: string;
}): string {
  const subject = `Upit sa sajta — ${payload.area || 'Opšti upit'}`;
  const bodyLines = [
    `Ime: ${payload.name}`,
    `Kompanija: ${payload.company}`,
    `Email: ${payload.email}`,
    `Telefon: ${payload.phone}`,
    `Oblast: ${payload.area}`,
    '',
    'Poruka:',
    payload.message,
  ];
  const params = new URLSearchParams({
    subject,
    body: bodyLines.join('\n'),
  });
  return `mailto:${CONTACT_EMAIL}?${params.toString()}`;
}

function setupContactForm(): void {
  const form = document.getElementById('contact-form');
  if (!(form instanceof HTMLFormElement)) return;
  const success = document.getElementById('form-success');

  // Name fields so we can read them by FormElements.namedItem
  const fieldMap: Array<[string, string]> = [
    ['name', 'input[type="text"][placeholder="Vaše ime"]'],
    ['company', 'input[type="text"][placeholder="Naziv firme"]'],
    ['email', 'input[type="email"]'],
    ['phone', 'input[type="tel"]'],
    ['area', 'select'],
    ['message', 'textarea'],
  ];
  for (const [name, selector] of fieldMap) {
    const el = form.querySelector<HTMLElement>(selector);
    if (el && !el.getAttribute('name')) {
      el.setAttribute('name', name);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const payload = {
      name: getTrimmed(form, 'name'),
      company: getTrimmed(form, 'company'),
      email: getTrimmed(form, 'email'),
      phone: getTrimmed(form, 'phone'),
      area: getTrimmed(form, 'area'),
      message: getTrimmed(form, 'message'),
    };

    if (payload.name.length === 0 || !isValidEmail(payload.email) || payload.message.length === 0) {
      const emailEl = form.querySelector<HTMLInputElement>('input[type="email"]');
      emailEl?.focus();
      return;
    }

    window.location.href = buildMailto(payload);

    if (success) {
      success.style.display = 'block';
    }
    form.style.display = 'none';
  });
}

function init(): void {
  setupNavScroll();
  setupReveal();
  setupSmoothScroll();
  setupImageFallbacks();
  setupContactForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
