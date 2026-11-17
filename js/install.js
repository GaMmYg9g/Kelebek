/* ============================================================
   LÓGICA DE INSTALACIÓN DE LA PWA
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.getElementById('installBtn');
  let deferredPrompt;

  // 1. Detectar si ya está instalada (Standalone)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  
  if (isStandalone) {
    // Si ya está instalada, no mostramos nada
    installBtn.classList.add('hidden');
    return;
  }

  // 2. Detectar si es iOS (iPhone/iPad)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (isIOS) {
    // En iOS, no existe el evento nativo, así que mostramos el botón directamente
    // y al tocarlo mostramos el tutorial
    installBtn.classList.remove('hidden');
    installBtn.addEventListener('click', () => {
      mostrarTutorialIOS();
    });
    return;
  }

  // 3. Android / PC (Chrome, Edge, etc.)
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenimos que el navegador muestre su propio banner automático
    e.preventDefault();
    // Guardamos el evento para dispararlo con nuestro botón
    deferredPrompt = e;
    // Mostramos nuestro botón
    installBtn.classList.remove('hidden');
  });

  // Al tocar el botón en Android/PC
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    // Mostramos el diálogo nativo del navegador
    deferredPrompt.prompt();
    
    // Esperamos la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la PWA');
    } else {
      console.log('Usuario rechazó instalar la PWA');
    }
    // Limpiamos el evento
    deferredPrompt = null;
  });

  // Si el usuario instala la app (por este botón o por el menú), ocultamos el botón
  window.addEventListener('appinstalled', () => {
    installBtn.classList.add('hidden');
    deferredPrompt = null;
  });
});

/* ============================================================
   TUTORIAL PARA iPHONE (Muestra un cartel por 6.5 segundos)
   ============================================================ */
function mostrarTutorialIOS() {
  // Evitar múltiples carteles si toca varias veces rápido
  if (document.getElementById('iosTutorial')) return;

  const tutorial = document.createElement('div');
  tutorial.id = 'iosTutorial';
  tutorial.className = 'ios-tooltip';
  tutorial.innerHTML = `
    <i class="fa-brands fa-apple"></i>
    <p>Para instalar en iPhone:</p>
    <ol>
      <li>Toca el botón <strong>Compartir</strong> <i class="fa-solid fa-arrow-up-from-bracket"></i></li>
      <li>Desliza y selecciona <strong>Agregar a Inicio</strong> <i class="fa-solid fa-square-plus"></i></li>
    </ol>
  `;
  
  document.body.appendChild(tutorial);

  // Animación de entrada
  setTimeout(() => tutorial.classList.add('show'), 50);

  // Ocultar y eliminar después de 6.5 segundos
  setTimeout(() => {
    tutorial.classList.remove('show');
    setTimeout(() => tutorial.remove(), 300); // Espera a que termine la transición
  }, 6500);
}