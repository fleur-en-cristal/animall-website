// cart.js
document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'cart_items_v1';

  const $drawer   = document.getElementById('cartDrawer');
  const $items    = document.getElementById('cartItems');
  const $total    = document.getElementById('cartTotal');
  const $count    = document.getElementById('cartCount');
  const $openBtn  = document.querySelector('.cart-link');
  const $clearBtn = document.getElementById('cartClear');
  const $checkout = document.getElementById('cartCheckout');

  const moneyToNumber = (s) => parseInt(String(s||'').replace(/[^\d]/g,'')) || 0;
  const numberToMoney = (n) => n.toLocaleString('vi-VN') + ' VND';

  const loadCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
  const saveCart = (items) => { localStorage.setItem(CART_KEY, JSON.stringify(items)); updateBadge(items); };
  const updateBadge = (items = loadCart()) => {
    const n = items.reduce((s, it) => s + it.qty, 0);
    if ($count) { $count.textContent = n; $count.style.display = n ? 'inline-flex' : 'none'; }
  };

  const addToCart = (item) => {
    const items = loadCart();
    const idx = items.findIndex(x => x.id === item.id);
    if (idx >= 0) items[idx].qty += 1; else items.push({ ...item, qty: 1 });
    saveCart(items);
  };

  const renderCart = () => {
    if (!$items || !$total) return; // trang nào chưa có drawer thì bỏ qua
    const items = loadCart();
    if (!items.length) { $items.innerHTML = `<p style="padding:12px;opacity:.7">Chưa có sản phẩm.</p>`; $total.textContent = '0 VND'; return; }
    $items.innerHTML = items.map(it => `
      <div class="cart-item" data-id="${it.id}">
        <img src="${it.img}" alt="${it.title}">
        <div>
          <h5>${it.title}</h5>
          ${it.type ? `<div class="cart-type">Loại: ${it.type}</div>` : ''}
          <div class="price-line">${it.price}</div>
          <div class="cart-qty">
            <button data-qty="-1" aria-label="Giảm">−</button>
            <span>${it.qty}</span>
            <button data-qty="+1" aria-label="Tăng">+</button>
          </div>
        </div>
        <div><button class="cart-remove">Xoá</button></div>
      </div>
    `).join('');

    const total = items.reduce((s, it) => s + moneyToNumber(it.price) * it.qty, 0);
    $total.textContent = numberToMoney(total);
  };

  const openCart  = () => { renderCart(); if ($drawer) { $drawer.classList.add('open'); $drawer.setAttribute('aria-hidden','false'); } };
  const closeCart = () => { if ($drawer) { $drawer.classList.remove('open'); $drawer.setAttribute('aria-hidden','true'); } };

  // Delegation: bấm icon giỏ trong bất kỳ card nào (.bx-cart-alt)
  document.body.addEventListener('click', (e) => {
    const icon = e.target.closest('.bx-cart-alt');
    if (icon) {
      e.preventDefault();
      const card = icon.closest('.row');
      if (!card) return;
      const id    = card.dataset.id || (card.querySelector('img')?.src + '|' + (card.querySelector('.btm-text h5')?.textContent.trim() || ''));
      const title = card.dataset.title || card.querySelector('.btm-text h5')?.textContent.trim() || 'Sản phẩm';
      const price = card.dataset.price || (card.querySelector('.price h6')?.childNodes[0]?.textContent.trim() || '0 VND');
      const img   = card.dataset.img   || card.querySelector('img')?.getAttribute('src') || '';
      addToCart({ id, title, price, img });
      return;
    }

    if (e.target.closest('.cart-link')) { e.preventDefault(); openCart(); }
    if (e.target.closest('[data-cart-close]')) { e.preventDefault(); closeCart(); }

    const removeBtn = e.target.closest('.cart-remove');
    if (removeBtn) {
      const id = removeBtn.closest('.cart-item')?.dataset.id;
      if (id) { const items = loadCart().filter(x => x.id !== id); saveCart(items); renderCart(); }
    }
    const qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      const id = qtyBtn.closest('.cart-item')?.dataset.id;
      const delta = qtyBtn.getAttribute('data-qty') === '+1' ? 1 : -1;
      if (id) {
        const items = loadCart().map(it => it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it);
        saveCart(items); renderCart();
      }
    }
  });

  if ($clearBtn) $clearBtn.addEventListener('click', () => { localStorage.removeItem(CART_KEY); updateBadge(); renderCart(); });
  if ($checkout) $checkout.addEventListener('click', () => { alert('Chuyển hướng sang trang thanh toán và xác nhận đơn hàng'); });

  // khởi tạo badge khi load ở mọi trang
  updateBadge();

  // expose nho nhỏ nếu cần dùng ở nơi khác
  window.Cart = { add: addToCart, open: openCart };
  window.addToCart = addToCart;
});
