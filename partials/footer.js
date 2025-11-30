// partials/footer.js

// file này dùng để chèn (inject) phần FOOTER dùng chung
// cho tất cả các trang. Mục tiêu: đồng bộ UI và tránh lặp code.

document.write(`
  <!-- FOOTER CHUNG CỦA WEBSITE -->
  <div class="footer">
    <div class="footer-left">
      <!-- Thông tin bản quyền -->
      <p>© 2025 <span>Animall</span>. All rights reserved.</p>
    </div>

    <div class="footer-right">
      <!-- Thông tin phương thức thanh toán hỗ trợ -->
      <p>Phương thức thanh toán</p>
      <img src="image/footer-img.png" alt="Các phương thức thanh toán Animall hỗ trợ">
    </div>
  </div>
`);
