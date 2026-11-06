/* ============================================================
   LÓGICA DE DOMICILIO - Kelebek
   ============================================================ */

window.DOMICILIO_CONFIG = {
  activo: true,
  precio: 200,
  moneda: 'CUP',
  mensaje: '200 CUP en todo Ciego de Ávila'
};

// Estado global del domicilio
window.DomicilioState = {
  incluir: false,
  nombre: '',
  movil: '',
  direccion: ''
};

document.addEventListener('DOMContentLoaded', () => {
  if (!window.DOMICILIO_CONFIG.activo) return;

  // 1. Modal de "Segunda Oportunidad" (si olvidó marcar el checkbox)
  const modalSeguroHTML = `
    <div id="domicilioSeguroModal" class="modal-overlay" style="display:none;">
      <div class="modal-box gradient-border">
        <h2 class="modal-title"><i class="fa-solid fa-motorcycle"></i> ¿Olvidaste el domicilio?</h2>
        <p class="modal-text">No has seleccionado envío a domicilio. Por solo <strong>${window.DOMICILIO_CONFIG.precio} ${window.DOMICILIO_CONFIG.moneda}</strong> te lo llevamos a tu puerta en Ciego de Ávila.</p>
        
        <div class="modal-actions">
          <button class="btn-secondary" id="seguroNo">No, recogeré</button>
          <button class="btn-primary" id="seguroSi">Sí, agregar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalSeguroHTML);

  // 2. Modal de Datos del Cliente (Nombre, Móvil, Dirección)
  const modalDatosHTML = `
    <div id="datosDomicilioModal" class="modal-overlay" style="display:none;">
      <div class="modal-box gradient-border">
        <h2 class="modal-title"><i class="fa-solid fa-motorcycle"></i> Datos de entrega</h2>
        <p class="modal-text">Para llevar tu pedido a domicilio, necesitamos estos datos:</p>
        
        <form id="formDomicilio">
          <div class="form-group">
            <label for="domNombre">Nombre del comprador</label>
            <input type="text" id="domNombre" required placeholder="Ej: Ana Pérez">
          </div>
          <div class="form-group">
            <label for="domMovil">Móvil para contactar</label>
            <input type="tel" id="domMovil" required placeholder="Ej: 55555555">
          </div>
          <div class="form-group">
            <label for="domDireccion">Dirección exacta</label>
            <textarea id="domDireccion" required placeholder="Calle, número, entre calles, referencias..."></textarea>
          </div>
          
          <div class="modal-actions" style="margin-top: 20px;">
            <button type="button" class="btn-secondary" id="datosCancelar">Cancelar</button>
            <button type="submit" class="btn-primary">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalDatosHTML);

  // Referencias a los modales y elementos
  const seguroModal = document.getElementById('domicilioSeguroModal');
  const datosModal = document.getElementById('datosDomicilioModal');
  
  const btnSeguroSi = document.getElementById('seguroSi');
  const btnSeguroNo = document.getElementById('seguroNo');
  
  const formDomicilio = document.getElementById('formDomicilio');
  const btnDatosCancelar = document.getElementById('datosCancelar');
  const inputNombre = document.getElementById('domNombre');
  const inputMovil = document.getElementById('domMovil');
  const inputDireccion = document.getElementById('domDireccion');

  // --- Funciones de apertura/cierre ---
  window.abrirModalSeguroDomicilio = () => {
    seguroModal.style.display = 'flex';
  };

  const cerrarSeguroModal = () => { seguroModal.style.display = 'none'; };
  const cerrarDatosModal = () => { datosModal.style.display = 'none'; };

  const abrirDatosModal = () => {
    // Si ya había datos guardados, los rellenamos
    inputNombre.value = window.DomicilioState.nombre || '';
    inputMovil.value = window.DomicilioState.movil || '';
    inputDireccion.value = window.DomicilioState.direccion || '';
    datosModal.style.display = 'flex';
  };

  // --- Lógica Modal "Segunda Oportunidad" ---
  btnSeguroSi.addEventListener('click', () => {
    window.DomicilioState.incluir = true;
    cerrarSeguroModal();
    abrirDatosModal(); // Ahora pedimos los datos
  });

  btnSeguroNo.addEventListener('click', () => {
    window.DomicilioState.incluir = false;
    cerrarSeguroModal();
    if (typeof window.procederConCheckout === 'function') {
      window.procederConCheckout(); // Enviar sin domicilio directo
    }
  });

  // --- Lógica Modal de Datos ---
  btnDatosCancelar.addEventListener('click', () => {
    // Si cancela, desmarcamos el domicilio y detenemos el pedido
    window.DomicilioState.incluir = false;
    window.DomicilioState.nombre = '';
    window.DomicilioState.movil = '';
    window.DomicilioState.direccion = '';
    cerrarDatosModal();
    
    // Actualizamos el carrito visual para que se desmarque el checkbox
    if (typeof window.actualizarCarritoVisual === 'function') {
      window.actualizarCarritoVisual();
    }
  });

  formDomicilio.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Guardamos los datos
    window.DomicilioState.nombre = inputNombre.value.trim();
    window.DomicilioState.movil = inputMovil.value.trim();
    window.DomicilioState.direccion = inputDireccion.value.trim();

    if (!window.DomicilioState.nombre || !window.DomicilioState.movil || !window.DomicilioState.direccion) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    cerrarDatosModal();
    
    // Procedemos al checkout final (abrir WhatsApp)
    if (typeof window.procederConCheckout === 'function') {
      window.procederConCheckout();
    }
  });

  // Función que se llamará desde app.js cuando el usuario ya marcó el checkbox
  // y le da a "Pedir" directamente.
  window.abrirModalDatosDomicilio = abrirDatosModal;
});
