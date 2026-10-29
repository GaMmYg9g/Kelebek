(function(){
  const categoriesMap = window.CATEGORIES || [];
  const ALL_PRODUCTS  = window.ALL_PRODUCTS || [];

  const ofertasMap = {};
  (window.OFERTAS || []).forEach(o => { ofertasMap[o.id] = o.precioOferta; });
  ALL_PRODUCTS.forEach(p => {
    if (ofertasMap[p.id] != null) {
      p.precioOriginal = p.precio;
      p.precio = ofertasMap[p.id];
      p.enOferta = true;
    }
  });

  const state = { categoria: 'todos', query: '' };
  const $  = (sel, ctx=document) => ctx.querySelector(sel);

  function formatPrice(n){
    return '$' + Number(n).toLocaleString('es-MX', {
      minimumFractionDigits:0, maximumFractionDigits:2
    });
  }
  function escapeHtml(str){
    return (str || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function renderCategories(){
    const nav = $('#categoriesNav');
    nav.innerHTML = '';
    categoriesMap.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn' + (state.categoria === c.key ? ' active' : '');
      btn.dataset.cat = c.key;
      btn.innerHTML = `<i class="${c.icon}"></i><span>${c.label}</span>`;
      btn.addEventListener('click', () => {
        state.categoria = c.key;
        state.query = '';
        $('#searchInput').value = '';
        $('#clearSearch').classList.add('hidden');
        renderCategories();
        render();
        document.getElementById('hero').classList.toggle('hidden', c.key !== 'todos');
      });
      nav.appendChild(btn);
    });
  }

  function getFilteredProducts(){
    let list = ALL_PRODUCTS;
    if (state.categoria !== 'todos'){
      const cat = categoriesMap.find(c => c.key === state.categoria);
      list = (cat && Array.isArray(cat.data)) ? cat.data : [];
    }
    if (state.query){
      list = window.Search.filter(list, state.query);
    }
    return list;
  }

  function createCard(p){
    const card = document.createElement('article');
    card.className = 'product-card gradient-border' + (p.estado === 'agotado' ? ' is-out' : '');
    card.dataset.id = p.id;

    const isOut = p.estado === 'agotado';
    const isNew = p.estado === 'new';

    card.innerHTML = `
      <div class="product-img-wrap" data-img="${escapeHtml(p.imagen)}">
        <img src="${escapeHtml(p.imagen)}" alt="${escapeHtml(p.nombre)}" loading="lazy"
             onerror="this.style.opacity='.15'">
        ${isNew ? '<span class="badge badge-new">NEW</span>' : ''}
        ${isOut ? '<span class="badge badge-out">Agotado</span>' : ''}
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(p.nombre)}</h3>
        ${p.descripcion ? `<p class="product-desc">${escapeHtml(p.descripcion)}</p>` : ''}
        <div class="product-price-row">
          <span class="product-price">
            <span class="currency">$</span>${Number(p.precio).toLocaleString('es-MX')}
            ${p.enOferta ? `<small style="color:var(--gray-600);font-weight:500;text-decoration:line-through;font-size:.7rem">${formatPrice(p.precioOriginal)}</small>` : ''}
          </span>
          <button class="buy-btn" ${isOut ? 'disabled' : ''} data-buy="${p.id}">
            <i class="fa-solid fa-cart-plus"></i>${isOut ? 'Agotado' : 'Comprar'}
          </button>
        </div>
      </div>
    `;

    card.querySelector('.product-img-wrap').addEventListener('click', () => {
      openLightbox(p.imagen, p.nombre);
    });

    const buyBtn = card.querySelector('.buy-btn');
    if (!isOut){
      buyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ok = window.Cart.add(p);
        if (ok) {
          buyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Añadido';
          buyBtn.style.background = 'var(--gold)';
          buyBtn.style.color = 'var(--black)';
          setTimeout(() => {
            buyBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i>Comprar';
            buyBtn.style.background = '';
            buyBtn.style.color = '';
          }, 900);
          updateCartUI();
        }
      });
    }
    return card;
  }

  function render(){
    const grid  = $('#productsGrid');
    const empty = $('#emptyState');
    const title = $('#sectionTitle');
    const list  = getFilteredProducts();

    grid.innerHTML = '';

    if (state.query){
      title.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Resultados (${list.length})`;
    } else if (state.categoria === 'todos'){
      title.innerHTML = '<i class="fa-solid fa-box"></i> Todos los productos';
    } else {
      const c = categoriesMap.find(x => x.key === state.categoria);
      title.innerHTML = c ? `<i class="${c.icon}"></i> ${c.label}` : 'Productos';
    }

    if (list.length === 0){
      empty.classList.remove('hidden');
    } else {
      empty.classList.add('hidden');
      const frag = document.createDocumentFragment();
      list.forEach(p => frag.appendChild(createCard(p)));
      grid.appendChild(frag);
    }

    renderOfertas();
  }

  function renderOfertas(){
    const sec  = $('#offersSection');
    const grid = $('#offersGrid');
    const conOferta = ALL_PRODUCTS.filter(p => p.enOferta);
    if (conOferta.length === 0 || state.query || state.categoria !== 'todos'){
      sec.classList.add('hidden');
      return;
    }
    sec.classList.remove('hidden');
    grid.innerHTML = '';
    conOferta.forEach(p => grid.appendChild(createCard(p)));
  }

  const searchInput  = $('#searchInput');
  const clearSearch  = $('#clearSearch');
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const v = e.target.value;
    clearSearch.classList.toggle('hidden', !v);
    searchTimeout = setTimeout(() => {
      state.query = v;
      state.categoria = 'todos';
      renderCategories();
      render();
      document.getElementById('hero').classList.toggle('hidden', !!v.trim());
    }, 120);
  });
  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    state.query = '';
    clearSearch.classList.add('hidden');
    render();
    document.getElementById('hero').classList.remove('hidden');
  });

  const cartDrawer    = $('#cartDrawer');
  const drawerOverlay = $('#drawerOverlay');

  function openCart(){
    cartDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('drawer-open');
  }
  function closeCart(){
    cartDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('drawer-open');
  }

  $('#cartBtn').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  drawerOverlay.addEventListener('click', closeCart);

  function updateCartUI(){
    const badge = $('#cartBadge');
    const count = window.Cart.count();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'grid' : 'none';
    renderCartItems();
  }

  function renderCartItems(){
    const body     = $('#cartBody');
    const items    = window.Cart.items;
    const clearBtn = $('#clearCart');
    const checkout = $('#checkoutBtn');
    const totalEl  = $('#cartTotal');

    if (items.length === 0){
      body.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-cart-shopping"></i>
          <p>Tu carrito está vacío</p>
        </div>`;
      totalEl.textContent = '$0.00';
      clearBtn.disabled = true;
      checkout.disabled = true;
      return;
    }
    clearBtn.disabled = false;
    checkout.disabled = false;

    body.innerHTML = '';
    items.forEach(it => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img class="cart-item-img" src="${escapeHtml(it.imagen)}" alt="${escapeHtml(it.nombre)}"
             onerror="this.style.opacity='.15'">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(it.nombre)}</div>
          <div class="cart-item-price">${formatPrice(it.precio)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="minus"><i class="fa-solid fa-minus"></i></button>
            <span>${it.qty}</span>
            <button class="qty-btn" data-action="plus"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
        <button class="cart-item-remove" data-action="remove" aria-label="Eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      div.addEventListener('click', (e) => {
        const act = e.target.closest('[data-action]');
        if (!act) return;
        const a = act.dataset.action;
        if (a === 'plus')   window.Cart.increment(it.id);
        if (a === 'minus')  window.Cart.decrement(it.id);
        if (a === 'remove') window.Cart.remove(it.id);
        updateCartUI();
      });
      body.appendChild(div);
    });

    totalEl.textContent = formatPrice(window.Cart.total());
  }

  $('#clearCart').addEventListener('click', () => {
    if (confirm('¿Vaciar el carrito?')){
      window.Cart.clear();
      updateCartUI();
    }
  });

  function buildOrderMessage(){
    const info  = window.STORE_INFO;
    const items = window.Cart.items;
    const LINE  = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    const now = new Date();
    const fecha = now.toLocaleDateString('es-ES', {
      weekday:'long', day:'numeric', month:'long', year:'numeric'
    });
    const hora = now.toLocaleTimeString('es-ES', {
      hour:'2-digit', minute:'2-digit', hour12:false
    });
    const fechaHora = `${fecha} · ${hora}`;

    let detalle = '';
    items.forEach((it, i) => {
      const subtotal = it.precio * it.qty;
      detalle += `*${i+1}. ${it.nombre}*\n`;
      detalle += `    ${it.qty} × ${formatPrice(it.precio)}\n`;
      detalle += `    Subtotal: ${formatPrice(subtotal)}\n\n`;
    });

    const totalArticulos = items.reduce((a,i) => a + i.qty, 0);

    const msg =
`*NUEVO PEDIDO - ${info.nombre.toUpperCase()}*
${fechaHora}
${LINE}

*DETALLE DEL PEDIDO*

${detalle}${LINE}
*RESUMEN*

   Total: ${formatPrice(window.Cart.total())}
   Artículos: ${totalArticulos}

${LINE}
   ¡Pedido enviado!
   Gracias por tu preferencia
   Te responderemos pronto

   *¡Disfruta tu compra!*`;

    return msg;
  }

  $('#checkoutBtn').addEventListener('click', () => {
    if (window.Cart.items.length === 0) return;

    const info = window.STORE_INFO;
    const msg  = buildOrderMessage();
    const url  = `https://wa.me/${info.whatsapp}?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');

    window.Cart.clear();
    updateCartUI();
    closeCart();
  });

  const fabStack      = $('#fabStack');
  const infoFab       = $('#infoFab');
  const fabMaps       = $('#fabMaps');
  const locationPanel = $('#locationPanel');

  function toggleFabStack(force){
    const willOpen = (typeof force === 'boolean')
      ? force
      : !fabStack.classList.contains('open');

    fabStack.classList.toggle('open', willOpen);

    if (!willOpen) closeLocationPanel();
  }

  infoFab.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFabStack();
  });

  function toggleLocationPanel(force){
    const willOpen = (typeof force === 'boolean')
      ? force
      : !locationPanel.classList.contains('open');

    locationPanel.classList.toggle('open', willOpen);
    locationPanel.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
    fabMaps.classList.toggle('active', willOpen);
    fabMaps.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  }
  function closeLocationPanel(){ toggleLocationPanel(false); }

  fabMaps.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLocationPanel();
  });

  document.addEventListener('click', (e) => {
    if (!fabStack.contains(e.target)){
      toggleFabStack(false);
    } else if (!fabMaps.contains(e.target) && !locationPanel.contains(e.target)) {
      closeLocationPanel();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape'){
      closeLocationPanel();
      toggleFabStack(false);
    }
  });

  function bindStoreInfo(){
    const info = window.STORE_INFO;

    $('#locationAddress').textContent = info.direccion;
    $('#locationMapBtn').href = info.mapsUrl;

    $('#fabCall').addEventListener('click', () => {
      window.location.href = `tel:${info.telefono}`;
    });
    $('#fabWhatsapp').href  = `https://wa.me/${info.whatsapp}`;
    $('#fabInstagram').href = `https://instagram.com/${info.instagram}`;
  }

  const lightbox    = $('#lightbox');
  const lightboxImg = $('#lightboxImg');

  function openLightbox(src, alt){
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  }
  $('#lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape'){ closeLightbox(); closeCart(); }
  });

  function registerServiceWorker(){
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        if (reg.waiting) reg.waiting.postMessage('SKIP_WAITING');
        reg.addEventListener('updatefound', () => {
          const nuevo = reg.installing;
          if (!nuevo) return;
          nuevo.addEventListener('statechange', () => {
            if (nuevo.state === 'installed' && navigator.serviceWorker.controller){
              reg.waiting && reg.waiting.postMessage('SKIP_WAITING');
            }
          });
        });
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update();
        });
        setInterval(() => reg.update(), 60 * 1000);
      }).catch(() => {});
    });
  }

  function init(){
    bindStoreInfo();
    renderCategories();
    render();
    updateCartUI();
    window.addEventListener('cart:updated', updateCartUI);

    registerServiceWorker();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
