import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function createArea(className, section) {
  const area = document.createElement('div');
  area.className = className;
  if (section) area.append(...section.children);
  return area;
}

function closePanels(nav, except) {
  nav.querySelectorAll('.nav-menu-button[aria-expanded="true"]').forEach((button) => {
    if (button !== except) button.setAttribute('aria-expanded', 'false');
  });
}

function toggleMobileMenu(nav, force) {
  const expanded = force ?? nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', expanded);
  nav.querySelector('.nav-hamburger').setAttribute('aria-label', expanded ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
  if (!expanded) closePanels(nav);
}

function buildMenuItem(section, index) {
  const item = document.createElement('li');
  item.className = 'nav-menu-item';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-menu-button';
  button.textContent = section.dataset.label || `Menú ${index + 1}`;
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `nav-panel-${index}`);

  const panel = createArea('nav-panel', section);
  panel.id = `nav-panel-${index}`;

  item.append(button, panel);
  return item;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const ofType = (type) => sections.filter((section) => section.classList.contains(type));
  const [promoSection] = ofType('promo');
  const [utilitySection] = ofType('utility');
  const [brandSection] = ofType('brand');

  const brand = createArea('nav-brand', brandSection);
  const logo = brand.querySelector('picture');
  if (logo && !logo.closest('a')) {
    const home = document.createElement('a');
    home.href = '/';
    logo.before(home);
    home.append(logo);
  }
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const brandContent = brand.querySelector('.default-content-wrapper');
  if (brandContent) tools.append(...[...brandContent.children].slice(1));

  const menu = document.createElement('ul');
  menu.className = 'nav-menu';
  ofType('menu').forEach((section, index) => menu.append(buildMenuItem(section, index)));

  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-label', 'Abrir menú');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';

  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  bar.append(brand, menu, tools, hamburger);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Principal');
  nav.setAttribute('aria-expanded', 'false');
  nav.append(createArea('nav-utility', utilitySection), bar);

  menu.addEventListener('click', (e) => {
    const button = e.target.closest('.nav-menu-button');
    if (!button) return;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    closePanels(nav, button);
    button.setAttribute('aria-expanded', !expanded);
  });

  hamburger.addEventListener('click', () => toggleMobileMenu(nav));

  nav.addEventListener('focusout', (e) => {
    if (isDesktop.matches && !nav.contains(e.relatedTarget)) closePanels(nav);
  });

  document.addEventListener('click', (e) => {
    if (isDesktop.matches && !nav.contains(e.target)) closePanels(nav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = nav.querySelector('.nav-menu-button[aria-expanded="true"]');
    if (open) {
      closePanels(nav);
      open.focus();
    } else if (nav.getAttribute('aria-expanded') === 'true') {
      toggleMobileMenu(nav, false);
      hamburger.focus();
    }
  });

  isDesktop.addEventListener('change', () => toggleMobileMenu(nav, false));

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  if (promoSection) wrapper.append(createArea('nav-promo', promoSection));
  wrapper.append(nav);
  block.replaceChildren(wrapper);
}
