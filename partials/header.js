// partials/header.js
// file này dùng để chèn (inject) phần HEADER,
// ô TÌM KIẾM và DRAWER GIỎ HÀNG dùng chung cho
// tất cả các trang (index, products, posts, contact, checkout, ...).
// mục tiêu: không phải copy/paste header ở từng file HTML.

document.write(`
  <!-- HEADER CHUNG CỦA WEBSITE -->
  <header>
      <!-- Logo bấm về trang chủ -->
      <a href="index.html" class="logo">
        <img src="image/2nd-logo.png" alt="Animall logo">
      </a>

      <!-- Thanh điều hướng chính -->
      <ul class="navigation">
          <li><a href="index.html">Trang chủ</a></li>
          <li><a href="index.html#services">Dịch vụ</a></li>
          <li><a href="index.html#food">Sản phẩm</a></li>
          <li><a href="index.html#review">Về chúng tôi</a></li>
          <li><a href="index.html#post">Bài viết</a></li>
      </ul>

      <!-- Khu vực nút đăng nhập / đăng ký + icon -->
      <div class="head-btn">
          <div class="nav-btn">
              <!-- Phần này sẽ được script.js thay đổi
                   thành "Xin chào, [Tên]" nếu user đã đăng nhập -->
              <div class="log-reg">
                  <a href="login.html">Đăng nhập / </a>
                  <a href="register.html">Đăng ký</a>
              </div>

              <!-- Icon tìm kiếm + giỏ hàng -->
              <div class="head-icon">
                  <!-- Nút bật/tắt ô tìm kiếm sản phẩm -->
                  <button id="searchToggle" class="search-btn" type="button">
                      <i class='bx bx-search'></i>
                  </button>

                  <!-- Nút mở giỏ hàng (cart drawer) -->
                  <a href="#" class="cart-link">
                      <i class='bx bx-cart'></i>
                      <!-- Badge hiển thị số lượng sản phẩm trong giỏ -->
                      <span id="cartCount" class="cart-count" aria-live="polite">0</span>
                  </a>
              </div>
          </div>

          <!-- Icon menu mobile (hiện khi màn hình nhỏ) -->
          <div class="bx bx-menu" id="menu-icon"></div>
      </div>
  </header>

  <!-- Ô TÌM KIẾM SẢN PHẨM DÙNG CHUNG -->
  <div class="search-panel" id="searchPanel" aria-hidden="true">
      <div class="search-inner">
          <!-- Input để nhập từ khóa cần tìm -->
          <input
              type="text"
              id="searchInput"
              placeholder="Tìm sản phẩm..."
              autocomplete="off"
          />
          <!-- Nút đóng panel tìm kiếm -->
          <button id="searchClose" class="search-close" type="button">&times;</button>
      </div>

      <!-- Kết quả tìm kiếm sẽ được script.js render vào đây -->
      <div id="searchResults" class="search-results"></div>
  </div>

  <!-- DRAWER GIỎ HÀNG DÙNG CHUNG -->
  <div id="cartDrawer" class="cart-drawer" aria-hidden="true">
      <!-- Lớp overlay tối bên ngoài, bấm vào sẽ đóng giỏ -->
      <div class="cart-overlay" data-cart-close></div>

      <!-- Panel giỏ hàng trượt từ bên phải vào -->
      <div class="cart-panel" role="dialog" aria-labelledby="cartTitle">
        <div class="cart-header">
          <h3 id="cartTitle">Giỏ Hàng</h3>

          <!-- Nút đóng giỏ (dấu X) -->
          <button class="cart-close" data-cart-close aria-label="Đóng giỏ">&times;</button>
        </div>

        <!-- Danh sách sản phẩm trong giỏ (cart.js sẽ render) -->
        <div id="cartItems" class="cart-items"></div>

        <!-- Khu vực tổng tiền + nút hành động -->
        <div class="cart-footer">
          <div class="cart-total">
            <span>Tổng:</span>
            <!-- Tổng tiền giỏ hàng -->
            <strong id="cartTotal">0 VND</strong>
          </div>

          <div class="cart-actions">
            <!-- Xóa toàn bộ giỏ -->
            <button id="cartClear" class="btn-outline">Xoá tất cả</button>

            <!-- Đi tới trang thanh toán (checkout.html) -->
            <button id="cartCheckout" class="btn-primary">Thanh toán</button>
          </div>
        </div>
      </div>
  </div>
`);
