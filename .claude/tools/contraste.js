// Auditoria de contraste do portal.
// Cole no console do preview (ou rode via javascript_tool) com a tela aberta.
// Devolve "OK" ou a lista de elementos cujo texto fica abaixo do mínimo da
// WCAG AA (4,5:1; 3:1 para texto grande). Elementos sobre imagem de fundo são
// ignorados — esses precisam de conferência visual.
window.AUD = () => {
  const L = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const P = s => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(Number);
    return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  const BG = el => {
    let e = el;
    while (e) {
      const cs = getComputedStyle(e);
      const b = P(cs.backgroundColor);
      if (b && b.a > 0.9) return b.rgb;
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      e = e.parentElement;
    }
    return [255, 255, 255];
  };
  const out = [];
  document.querySelectorAll('body *').forEach(el => {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
    const t = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim())
      .map(n => n.textContent.trim()).join(' ');
    if (!t) return;
    const cs = getComputedStyle(el), fg = P(cs.color), bg = BG(el);
    if (!fg || !bg) return;
    const l1 = L(fg.rgb), l2 = L(bg);
    const r = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const s = parseFloat(cs.fontSize), w = parseInt(cs.fontWeight) || 400;
    const min = (s >= 24 || (s >= 18.66 && w >= 700)) ? 3 : 4.5;
    if (r < min) out.push(el.tagName.toLowerCase() + '.' + [...el.classList].join('.') +
      ' [' + t.slice(0, 24) + '] ' + (Math.round(r * 100) / 100) + ' < ' + min);
  });
  return out.length ? [...new Set(out)].join(' || ') : 'OK';
};
AUD();
