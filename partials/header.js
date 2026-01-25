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
    <ul class="navigation" aria-label="Điều hướng chính">
      <li><a href="index.html">Trang chủ</a></li>

      <li class="nav-has-mega" data-mega>
        <a href="products.html" class="nav-mega-trigger" aria-haspopup="true" aria-expanded="false">Sản phẩm</a>

        <!-- Mega menu: ưu tiên Learnability (Theo Loài | Theo Nhu cầu) -->
        <div class="mega-menu" role="menu" aria-label="Sản phẩm">
          <div class="mega-head">
            <div class="mega-tabs" role="tablist" aria-label="Cách duyệt sản phẩm">
              <button class="mega-tab is-active" type="button" role="tab" data-mega-tab="species" aria-selected="true">Theo Loài</button>
              <button class="mega-tab" type="button" role="tab" data-mega-tab="needs" aria-selected="false">Theo Nhu cầu</button>
            </div>
            <div class="mega-quick">
              <a class="mega-quick-link" href="post-detail.html?id=huong-dan-chon-size-cho-cho-meo-tho-chim-hamster">Hướng dẫn chọn size</a>
              <a class="mega-quick-link" href="products.html?sort=best">Top bán chạy</a>
              <a class="mega-quick-link" href="products.html?sort=new">Hàng mới</a>
              <a class="mega-quick-link" href="products.html?sort=sale">Giảm giá</a>
            </div>
          </div>

          <!-- Panel: Theo Loài -->
          <div class="mega-panel is-active" data-mega-panel="species" role="tabpanel">
            <div class="mega-grid">
              <div class="mega-col">
                <h4>Chó</h4>
                <a href="products.html?cat=dog&need=food">Thức ăn</a>
                <a href="products.html?cat=dog&need=health">Sức khỏe</a>
                <a href="products.html?cat=dog&need=hygiene">Vệ sinh</a>
                <a href="products.html?cat=dog&need=accessory">Phụ kiện</a>
                <a href="products.html?cat=dog&need=toy">Đồ chơi & huấn luyện</a>
                <a href="products.html?cat=dog&need=newbie">Dành cho người mới</a>
              </div>

              <div class="mega-col">
                <h4>Mèo</h4>
                <a href="products.html?cat=cat&need=food">Thức ăn</a>
                <a href="products.html?cat=cat&need=health">Sức khỏe</a>
                <a href="products.html?cat=cat&need=hygiene">Vệ sinh</a>
                <a href="products.html?cat=cat&need=accessory">Phụ kiện</a>
                <a href="products.html?cat=cat&need=toy">Đồ chơi</a>
                <a href="products.html?cat=cat&need=newbie">Dành cho người mới</a>
              </div>

              <div class="mega-col">
                <h4>Chim</h4>
                <a href="products.html?cat=bird&need=food">Thức ăn</a>
                <a href="products.html?cat=bird&need=accessory">Lồng & phụ kiện</a>
                <a href="products.html?cat=bird&need=hygiene">Sức khỏe & vệ sinh</a>
                <a href="products.html?cat=bird&need=newbie">Dành cho người mới: setup lồng</a>
              </div>

              <div class="mega-col">
                <h4>Thú nhỏ</h4>
                <a href="products.html?cat=hamster&need=food">Thức ăn</a>
                <a href="products.html?cat=hamster&need=accessory">Lồng & lót chuồng</a>
                <a href="products.html?cat=hamster&need=health">Sức khỏe</a>
                <a href="products.html?cat=hamster&need=newbie">Bộ nuôi thú nhỏ</a>
              </div>

              <div class="mega-col">
                <h4>Khác</h4>
                <a href="products.html?cat=fish">Cá: set up hồ 7 ngày</a>
                <a href="products.html?cat=reptile">Bò sát: set up cơ bản</a>
              </div>
            </div>
          </div>

          <!-- Panel: Theo Nhu cầu -->
          <div class="mega-panel" data-mega-panel="needs" role="tabpanel">
            <div class="mega-grid">
              <div class="mega-col">
                <h4>Thức ăn</h4>
                <a href="products.html?need=food&species=dog">Theo Loài: Chó</a>
                <a href="products.html?need=food&species=cat">Theo Loài: Mèo</a>
                <a href="products.html?need=food&species=bird">Theo Loài: Chim</a>
                <a href="products.html?need=food&species=hamster">Theo Loài: Thú nhỏ</a>
                <a href="products.html?need=food&stage=puppy">Theo giai đoạn: Nhỏ tuổi</a>
                <a href="products.html?need=food&stage=adult">Theo giai đoạn: Trưởng thành</a>
                <a href="products.html?need=food&stage=senior">Theo giai đoạn: Cao tuổi</a>
              </div>

              <div class="mega-col">
                <h4>Sức khỏe</h4>
                <a href="products.html?need=health&topic=supplement">Dinh dưỡng bổ sung</a>
                <a href="products.html?need=health&topic=skin">Da & lông</a>
                <a href="products.html?need=health&topic=digest">Tiêu hóa</a>
                <a href="products.html?need=health&topic=parasite">Ký sinh trùng</a>
                <a href="products.html?need=health&topic=basic-care">Vật tư chăm sóc</a>
              </div>

              <div class="mega-col">
                <h4>Vệ sinh</h4>
                <a href="products.html?need=hygiene&topic=bath">Tắm & chăm sóc</a>
                <a href="products.html?need=hygiene&topic=odor">Khử mùi</a>
                <a href="products.html?need=hygiene&topic=oral">Vệ sinh răng–tai</a>
                <a href="products.html?need=hygiene&topic=litter">Cát vệ sinh / tã / túi nhặt phân</a>
              </div>

              <div class="mega-col">
                <h4>Phụ kiện</h4>
                <a href="products.html?need=accessory&topic=feeding">Ăn uống</a>
                <a href="products.html?need=accessory&topic=outdoor">Ra ngoài</a>
                <a href="products.html?need=accessory&topic=sleep">Ngủ nghỉ</a>
                <a href="products.html?need=accessory&topic=wear">Mặc & bảo hộ</a>
              </div>

              <div class="mega-col">
                <h4>Đồ chơi & định kỳ</h4>
                <a href="products.html?need=toy">Đồ chơi & huấn luyện</a>
                <a href="products.html?need=combo">Combo & định kỳ</a>
                <a href="products.html?need=reorder">Gợi ý mua định kỳ / Mua lại</a>
                <a href="pet-profile.html">Pet Profile</a>
              </div>
            </div>
          </div>
        </div>
      </li>

      <li><a href="services.html">Dịch vụ</a></li>
      <li><a href="posts.html">Kiến thức</a></li>
      <li><a href="promotions.html">Khuyến mãi</a></li>
      <li><a href="support.html">Đơn hàng</a></li>
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
