// checkout.js
document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'cart_items_v1';
  const VN = (n) => (n||0).toLocaleString('vi-VN') + ' VND';
  const toNum = (s) => parseInt(String(s||'').replace(/[^\d]/g,''))||0;

  const $summary = document.getElementById('summaryItems');
  const $subtotal = document.getElementById('sumSubtotal');
  const $discount = document.getElementById('sumDiscount');
  const $shipping = document.getElementById('sumShipping');
  const $total    = document.getElementById('sumTotal');

  const $couponInput = document.getElementById('coupon');
  const $applyCoupon = document.getElementById('applyCoupon');
  const $form = document.getElementById('checkoutForm');

  let coupon = null;

  function getCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }

  function renderSummary(){
    const items = getCart();
    if(!items.length){
      $summary.innerHTML = '<p style="opacity:.7">Giỏ hàng đang trống. Vui lòng thêm sản phẩm.</p>';
    }else{
      $summary.innerHTML = items.map(it=>`
        <div class="summary-item">
          <img src="${it.img}" alt="${it.title}">
          <div>
            <div style="font-weight:600">${it.title}</div>
            <div style="font-size:13px;opacity:.8">x${it.qty}</div>
          </div>
          <div>${VN(toNum(it.price)*it.qty)}</div>
        </div>
      `).join('');
    }

    const subtotal = items.reduce((s,it)=> s + toNum(it.price)*it.qty, 0);
    const discount = coupon && coupon.type==='percent' ? Math.floor(subtotal * coupon.value) :
                     coupon && coupon.type==='flat' ? coupon.value : 0;

    const shipMethod = (new FormData($form)).get('ship') || 'standard';
    let shipFee = 0;
    if(shipMethod === 'standard') shipFee = subtotal >= 500000 ? 0 : 30000;
    if(shipMethod === 'express')  shipFee = 60000;
    if(shipMethod === 'pickup')   shipFee = 0;

    const total = Math.max(0, subtotal - discount) + shipFee;

    $subtotal.textContent = VN(subtotal);
    $discount.textContent = '-' + VN(discount);
    $shipping.textContent = VN(shipFee);
    $total.textContent    = VN(total);
  }

  $applyCoupon?.addEventListener('click', (e)=>{
    e.preventDefault();
    const code = ($couponInput.value||'').trim().toUpperCase();
    coupon = null;
    if(code === 'ANIMALL10'){ coupon = { type:'percent', value: 0.10 }; alert('Áp dụng mã ANIMALL10: giảm 10%'); }
    else if(code === 'FREESHIP'){ coupon = { type:'flat', value: 0 }; alert('Áp dụng mã FREESHIP: miễn phí vận chuyển (hãy chọn Tiêu chuẩn)'); }
    else if(code){ alert('Mã không hợp lệ.'); }
    renderSummary();
  });

  $form?.addEventListener('change', (e)=>{
    if(e.target.name === 'ship') renderSummary();
  });

  $form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!$form.checkValidity()){ alert('Vui lòng điền đầy đủ thông tin hợp lệ.'); return; }
    const items = getCart();
    if(!items.length){ alert('Giỏ hàng trống.'); return; }

    const data = Object.fromEntries(new FormData($form).entries());
    const orderId = 'AN' + Math.floor(Math.random()*1e6).toString().padStart(6,'0');
    const now = new Date().toLocaleString('vi-VN');

    const order = { id: orderId, at: now, items, data };
    const history = JSON.parse(localStorage.getItem('order_history')||'[]');
    history.push(order);
    localStorage.setItem('order_history', JSON.stringify(history));

    localStorage.removeItem(CART_KEY);

    alert('Đặt hàng thành công! Mã đơn: ' + orderId);
    window.location.href = 'thankyou.html?id=' + orderId;
  });

  renderSummary();
});
