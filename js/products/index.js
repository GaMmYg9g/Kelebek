(function () {
  const DEFS = [
    { key:'todos',      label:'Todos',      icon:'fa-solid fa-border-all',            data:null,                          especial:true },
    { key:'alimentos',  label:'Alimentos',  icon:'fa-solid fa-bowl-rice',             data:window.PRODUCTS_ALIMENTOS },
    { key:'bebidas',    label:'Bebidas',    icon:'fa-solid fa-bottle-water',          data:window.PRODUCTS_BEBIDAS },
    { key:'embutidos',  label:'Embutidos',  icon:'fa-solid fa-drumstick-bite',        data:window.PRODUCTS_EMBUTIDOS },
    { key:'confituras', label:'Snacks',     icon:'fa-solid fa-cookie-bite',           data:window.PRODUCTS_CONFITURAS },
    { key:'aseo',       label:'Aseo',       icon:'fa-solid fa-pump-soap',             data:window.PRODUCTS_ASEO },
    { key:'limpieza',   label:'Limpieza',   icon:'fa-solid fa-spray-can-sparkles',    data:window.PRODUCTS_LIMPIEZA },
    { key:'perfumes',   label:'Perfumes',   icon:'fa-solid fa-spray-can',             data:window.PRODUCTS_PERFUMES },
    { key:'ropa',       label:'Ropa',       icon:'fa-solid fa-shirt',                 data:window.PRODUCTS_ROPA },
    { key:'calzado',    label:'Calzado',    icon:'fa-solid fa-shoe-prints',           data:window.PRODUCTS_CALZADO },
    { key:'hogar',      label:'Hogar',      icon:'fa-solid fa-blender',               data:window.PRODUCTS_HOGAR }
  ];

  window.CATEGORIES = DEFS.filter(c => c.especial || Array.isArray(c.data));
  window.ALL_PRODUCTS = window.CATEGORIES.filter(c => Array.isArray(c.data)).flatMap(c => c.data);

  console.log('[Kelebek] Categorías cargadas:', window.CATEGORIES.map(c => c.label));
  console.log('[Kelebek] Total de productos:', window.ALL_PRODUCTS.length);
})();
