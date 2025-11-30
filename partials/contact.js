/* tạo ra phần chân trang (Contact Section) dùng chung cho tất cả các trang*/

document.write(`
<section class="contact">
    <div class="main-cont">
        
        <div class="cont-1">
            <img src="image/2nd-logo.png" alt="Logo phụ">
            
            <p>Địa chỉ: Khu phố 6, Phường Linh Trung, TP. Thủ Đức, Thành phố Hồ Chí Minh</p>
            <p>Email: contact@animall.com</p>
            <p>Điện thoại: +84 123 456 789</p>

            <h5>Đăng Ký Nhận Bản Tin</h5>
            <input type="email" id="newsletter-email" name="newsletter_email" placeholder="Nhập email của bạn" autocomplete="email">
        </div>

        <div class="cont-2">
            <h3>Sản phẩm mới</h3>

            <div class="humb-cont" id="recentProducts">
            </div>
        </div>

        <div class="cont-3">
            <h3>Liên kết nhanh</h3>
            <a href="#">Bảo mật</a>
            <a href="#">Đổi trả</a>
            <a href="#">Điều khoản dịch vụ</a>
            <a href="contact.html">Liên hệ</a> 
            <a href="index.html#post">Tin tức</a>
        </div>

        <div class="cont-3 map-card">
            <h3>Bản đồ & Chỉ đường</h3>
            <!-- sửa địa chỉ trong q= nếu đổi địa chỉ công ty -->
            <div class="map-wrap">
                <iframe loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"
                    src="https://maps.google.com/maps?q=Khu+phố+6,+Phường+Linh+Trung,+TP.+Thủ+Đức,+Thành+phố+Hồ+Chí+Minh&t=&z=15&ie=UTF8&iwloc=&output=embed">
                </iframe>
            </div>
            <!-- nút mở chỉ đường (Google Maps) -->
            <div class="map-actions">
                <a class="btn" target="_blank" rel="noopener"
                    href="https://www.google.com/maps/search/?api=1&query=Khu+phố+6,+Phường+Linh+Trung,+TP.+Thủ+Đức,+Thành+phố+Hồ+Chí+Minh">
                    Mở Google Maps
                </a>
                <!-- nút Apple Maps cho iOS/macOS -->
                <a class="btn btn-outline" target="_blank" rel="noopener"
                    href="https://maps.apple.com/?q=Khu+phố+6,+Phường+Linh+Trung,+TP.+Thủ+Đức,+Thành+phố+Hồ+Chí+Minh">
                    Mở Apple Maps
                </a>
            </div>
        </div>
    </div>
</section>
`);