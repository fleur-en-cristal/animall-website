// checkout.js

//**lắng nghe sự kiện khi trang HTML đã tải xong hoàn toàn
document.addEventListener('DOMContentLoaded', () => {
  //***CẤU HÌNH & HÀM TIỆN ÍCH
  const CART_KEY = 'cart_items_v1';
  // hàm format số thành tiền Việt Nam (VD: 100000 -> 100.000 VND)
  const VN = (n) => (n||0).toLocaleString('vi-VN') + ' VND';
  // hàm chuyển chuỗi tiền tệ về số nguyên (VD: "100.000 đ" -> 100000) để tính toán
  const toNum = (s) => parseInt(String(s||'').replace(/[^\d]/g,''))||0;

  //***LẤY CÁC DOM ELEMENTS (PHẦN TỬ HTML)
  // các phần tử hiển thị thông tin thanh toán
const $summary = document.getElementById('summaryItems'); // nơi hiển thị danh sách sản phẩm
  const $subtotal = document.getElementById('sumSubtotal'); // tạm tính
  const $discount = document.getElementById('sumDiscount'); // giảm giá
  const $shipping = document.getElementById('sumShipping'); // phí ship
  const $total    = document.getElementById('sumTotal');    // tổng cộng

  // các phần tử Form
  const $couponInput = document.getElementById('coupon');      // ô nhập mã giảm giá
  const $applyCoupon = document.getElementById('applyCoupon'); // nút áp dụng mã
  const $form = document.getElementById('checkoutForm');       // form thông tin giao hàng

  // biến lưu trạng thái mã giảm giá hiện tại
  let coupon = null;

  //***CÁC HÀM XỬ LÝ CHÍNH

  // hàm lấy giỏ hàng từ LocalStorage một cách an toàn (tránh lỗi nếu dữ liệu sai format)
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  // hàm render giao diện và tính toán tiền
  function renderSummary(){
    const items = getCart();
    //**hiển thị danh sách sản phẩm bên cột phải
    if(!items.length){
      $summary.innerHTML = '<p style="opacity:.7">Giỏ hàng đang trống. Vui lòng thêm sản phẩm.</p>';
    }else{
      // duyệt qua từng sản phẩm và tạo HTML
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
    //**tính toán các con số
    //tạm tính (Subtotal)
    const subtotal = items.reduce((s,it)=> s + toNum(it.price)*it.qty, 0);
    //**tính giảm giá (discount) dựa trên biến coupon
    // nếu là % thì nhân, nếu là flat (số tiền cố định) thì trừ thẳng
    const discount = coupon && coupon.type==='percent' ? Math.floor(subtotal * coupon.value) :
                     coupon && coupon.type==='flat' ? coupon.value : 0;

    //**tính phí ship (shipping) dựa trên radio button trong form
    const shipMethod = (new FormData($form)).get('ship') || 'standard';
    let shipFee = 0;
    // logic phí ship:
    if(shipMethod === 'standard') 
      shipFee = subtotal >= 500000 ? 0 : 30000; // nếu đơn > 500k thì miễn phí ship thường, ngược lại 30k
    if(shipMethod === 'express')  
      shipFee = 60000;               // ship nhanh luôn tính 60k
    if(shipMethod === 'pickup')   shipFee = 0; // nhận tại cửa hàng

    //**tổng cộng total = tạm tính - giảm giá + ship
    // Math.max(0, ...) để đảm bảo tiền k bị âm
    const total = Math.max(0, subtotal - discount) + shipFee;

    //**cập nhật các con số lên giao diện
    $subtotal.textContent = VN(subtotal);
    $discount.textContent = '-' + VN(discount);
    $shipping.textContent = VN(shipFee);
    $total.textContent    = VN(total);
  }

  //***CÁC SỰ KIỆN XỬ LÝ

  //**xử lý khi bấm nút áp dụng mã giảm giá
  $applyCoupon?.addEventListener('click', (e) => {
    e.preventDefault(); // chặn reload trang
    const code = ($couponInput.value || '').trim().toUpperCase(); // chuẩn hóa mã về chữ hoa
    coupon = null; // reset mã cũ

    // kiểm tra mã (hardcode cứng trong JS)
    if (code === 'ANIMALL10') {
      coupon = { type: 'percent', value: 0.10 }; // giảm 10%
      alert('Áp dụng mã ANIMALL10: giảm 10%');
    } 
    else if (code === 'FREESHIP') {
      // chỉ set giá trị giảm = 0, chưa can thiệp vào biến shipFee
      coupon = { type: 'flat', value: 0 }; 
      alert('Áp dụng mã FREESHIP: miễn phí vận chuyển');
    } 
    else if (code) {
      alert('Mã không hợp lệ.');
    }
    
    // tính lại tiền sau khi áp mã
    renderSummary();
  });

  //**xử lý khi thay đổi hình thức giao hàng
  $form?.addEventListener('change', (e)=>{
    // chỉ render lại nếu người dùng đổi ô 'ship'
    if(e.target.name === 'ship') renderSummary();
  });

  //**xử lý khi bấm nút đặt hàng (Submit Form)
  $form?.addEventListener('submit', (e)=>{
    e.preventDefault();

    //validate form (HTML5 validation)
    if(!$form.checkValidity()){ alert('Vui lòng điền đầy đủ thông tin hợp lệ.'); return; }
    //kiểm tra giỏ hàng có rỗng k
    const items = getCart();
    if(!items.length){ alert('Giỏ hàng trống.'); return; }

    //***gom dữ liệu để lưu
    const data = Object.fromEntries(new FormData($form).entries()); //lấy tất cả input trong form thành Object
    const orderId = 'AN' + Math.floor(Math.random()*1e6).toString().padStart(6,'0'); //tạo mã đơn ngẫu nhiên (VD: AN123456)
    const now = new Date().toLocaleString('vi-VN');//thời gian đặt

    //**tạo object đơn hàng
    const order = { id: orderId, at: now, items, data };

    //***lưu vào lịch sử đơn hàng (order_history)
    const history = JSON.parse(localStorage.getItem('order_history')||'[]');
    history.push(order);
    localStorage.setItem('order_history', JSON.stringify(history));

    //***xóa giỏ hàng sau khi mua thành công
    localStorage.removeItem(CART_KEY);

    //***thông báo và chuyển trang
    alert('Đặt hàng thành công! Mã đơn: ' + orderId);
    window.location.href = 'thankyou.html?id=' + orderId;
  });

  // chạy lần đầu khi vào trang để hiển thị thông tin ngay lập tức
  renderSummary();
});
