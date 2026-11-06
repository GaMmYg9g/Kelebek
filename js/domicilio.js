/* ============================================================
   LÓGICA DE DOMICILIO - Kelebek
   ============================================================ */

window.DOMICILIO_CONFIG = {
  activo: true,
  precio: 200,
  moneda: 'CUP',
  mensaje: '200 CUP en todo Ciego de Ávila'
};

// Estado global del domiciliox
window.DomicilioState = {
  incluir: false
};

document.addEventListener('DOMContentLoaded', () => {
  if (!window.DOMICILIO_CONFIG.activo) return;

  // Modal de "Segunda Oportunidad" (por si olvidó marcarlo)
  const modalHTML = `
    <div id="domicilioModal" class="modal-overlay" style="display:none;">
      <div class="modal-box gradient-border">
        <h2 class="modal-title"><i class="fa-solid fa-motorcycle"></i> ¿Olvidaste el domicilio?</h2>
        <p class="modal-text">No has seleccionado envío a domicilio. Por solo <strong>${window.DOMICILIO_CONFIG.precio} ${window.DOMICILIO_CONFIG.moneda}</strong> te lo llevamos a tu puerta en Ciego de Ávila.</p>
        
        <div class="modal-actions">
          <button class="btn-secondary" id="domNo">No, recogeré</button>
          <button class="btn-primary" id="domSi">Sí, agregar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('domicilioModal');
  const btnSi = document.getElementById('domSi');
  const btnNo = document.getElementById('domNo');

  const cerrarModal = () => { modal.style.display = 'none'; };

  // Si dice que SÍ quiere domicilio
  btnSi.addEventListener('click', () => {
    window.DomicilioState.incluir = true;
    cerrarModal();
    
    // Actualizamos el carrito para que se vea reflejado y procedemos a enviar
    if (typeof window.actualizarCarritoVisual === 'function') {
      window.actualizarCarritoVisual();
    }
    if (typeof window.procederConCheckout === 'function') {
      window.procederConCheckout();
    }
  });

  // Si dice que NO quiere domicilio
  btnNo.addEventListener('click', () => {
    window.DomicilioState.incluir = false;
    cerrarModal();
    
    // Procedemos a enviar sin domicilio
    if (typeof window.procederConCheckout === 'function') {
      window.procederConCheckout();
    }
  });

  // Función global para abrir este modal desde app.js
  window.abrirModalSeguroDomicilio = () => {
    modal.style.display = 'flex';
  };
});
