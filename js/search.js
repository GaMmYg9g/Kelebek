(function(){
  function normalize(str){
    return (str || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  window.Search = {
    normalize,
    filter(products, query){
      const q = normalize(query);
      if (!q) return products;
      const words = q.split(/\s+/).filter(Boolean);
      return products.filter(p => {
        const haystack = normalize(p.nombre + ' ' + (p.descripcion || '') + ' ' + (p.categoria || ''));
        return words.every(w => haystack.includes(w));
      });
    }
  };
})();