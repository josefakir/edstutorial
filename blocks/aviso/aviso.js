export default function decorate(block) {
  const [titulo, texto] = block.children;

  titulo?.classList.add('aviso-titulo');
  texto?.classList.add('aviso-texto');

  const icono = document.createElement('span');
  icono.className = 'aviso-icono';
  icono.textContent = block.classList.contains('advertencia') ? '⚠️' : 'ℹ️';
  titulo?.prepend(icono);

  block.setAttribute('role', 'note');
}
