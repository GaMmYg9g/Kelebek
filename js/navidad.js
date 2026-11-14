/* ============================================================
   ACTIVADOR AUTOMÁTICO DEL TEMA NAVIDEÑO
   ============================================================ */

(function() {
  const now = new Date();
  const month = now.getMonth(); // 0 = Enero, 10 = Noviembre, 11 = Diciembre
  const day = now.getDate();

  // Condición: Todo Noviembre, todo Diciembre, y hasta el 6 de Enero (Día de Reyes)
  const isChristmasSeason = (month === 10) || (month === 11) || (month === 0 && day <= 6);

  if (isChristmasSeason) {
    document.body.classList.add('theme-christmas');
    console.log('🎄 Tema navideño activado');
  }
})();