const boton = document.getElementById('menumob');
const mobileNav = document.getElementById('mobile-nav');
const header = document.querySelector('header');


boton.addEventListener('click', () => {
  const isOpen = mobileNav.classList.contains('open');

  if (isOpen) {
    // cerrar
    mobileNav.classList.remove('open');
    boton.classList.remove('rotated');
    header.style.backdropFilter = 'blur(12px)';
    header.style.backgroundColor = 'rgba(253, 253, 253, 0.462)';
    // tras la animación ocultar para que no capture eventos
    setTimeout(() => mobileNav.style.display = 'none', 300);
    boton.innerText = 'menu';
  } else {
    // abrir
    mobileNav.style.display = 'flex';
    // forzar repaint antes de agregar la clase
    requestAnimationFrame(() => mobileNav.classList.add('open'));
    boton.classList.add('rotated');
    header.style.backdropFilter = 'blur(0)';
    header.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    boton.innerText = 'close';
  }
});




function scrollWithOffset() {
        const hash = window.location.hash.slice(1);
        if (!hash) return;
        const el = document.getElementById(hash);
        if (!el) return;
        const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      window.addEventListener('load',  scrollWithOffset);
      window.addEventListener('hashchange', scrollWithOffset);