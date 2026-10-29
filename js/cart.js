(function(){
  const KEY = 'kelebek_cart_v1';

  const Cart = {
    items: [],
    load(){
      try{
        const raw = localStorage.getItem(KEY);
        this.items = raw ? JSON.parse(raw) : [];
      }catch(e){ this.items = []; }
    },
    save(){
      localStorage.setItem(KEY, JSON.stringify(this.items));
      window.dispatchEvent(new CustomEvent('cart:updated'));
    },
    add(product){
      if (product.estado === 'agotado') return false;
      const found = this.items.find(i => i.id === product.id);
      if (found){
        found.qty += 1;
      } else {
        this.items.push({
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagen,
          qty: 1
        });
      }
      this.save();
      return true;
    },
    increment(id){
      const it = this.items.find(i => i.id === id);
      if (!it) return;
      it.qty += 1;
      this.save();
    },
    decrement(id){
      const it = this.items.find(i => i.id === id);
      if (!it) return;
      it.qty -= 1;
      if (it.qty <= 0) this.remove(id);
      else this.save();
    },
    remove(id){
      this.items = this.items.filter(i => i.id !== id);
      this.save();
    },
    clear(){
      this.items = [];
      this.save();
    },
    count(){
      return this.items.reduce((a,i) => a + i.qty, 0);
    },
    total(){
      return this.items.reduce((a,i) => a + i.qty * i.precio, 0);
    }
  };

  window.Cart = Cart;
  Cart.load();
})();