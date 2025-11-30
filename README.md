# Animall – Website Bán Đồ & Dịch Vụ Thú Cưng


## 1. Tên dự án:

Website bán đồ & dịch vụ cho thú cưng **Animall** (Front-end: HTML/CSS/JavaScript).


## 2. Giới thiệu:

Dự án xây dựng một website bán hàng dành cho thú cưng, cho phép người dùng:

- Xem danh mục sản phẩm theo loài: Cún, Mèo, Chim, Thỏ, Hamster.
- Xem chi tiết sản phẩm, giá, hình ảnh.
- Thêm sản phẩm/dịch vụ vào giỏ hàng và thanh toán mô phỏng.
- Theo dõi tin tức/bài viết liên quan đến chăm sóc thú cưng.
- Đăng ký/đăng nhập tài khoản cơ bản (lưu tại `localStorage`).
- Gửi thông tin liên hệ qua form (mô phỏng).

> **Repo front-end (hiện tại):**  
> https://github.com/fleur-en-cristal/animall-website

> **Link demo GitHub Pages (sau khi bật Pages):**  
> `https://fleur-en-cristal.github.io/animall-website/`



## 3. Thành viên nhóm:

| STT | MSSV     | Github Username                                         |
|-----|----------|---------------------------------------------------------|
| 1   | 23540027 | [fleur-en-cristal](https://github.com/fleur-en-cristal) |


## 4. Công nghệ sử dụng:

- **Front-end:**
  - HTML5, CSS3 (Flexbox, Grid).
  - JavaScript ES6.
  - Boxicons, Google Fonts (Roboto).

- **Dữ liệu:**
  - Các file JSON tĩnh:
    - `data/products.json` – danh sách sản phẩm.
    - `data/posts.json` – bài viết.
    - `data/users.json` – tài khoản mẫu.
    - `data/services.json` – thông tin dịch vụ.

- **Lưu trữ phía client:**
  - `localStorage`:
    - Lưu giỏ hàng.
    - Lưu thông tin user hiện tại sau khi đăng nhập.
    - Lưu nháp form liên hệ.

- **Công cụ:**
  - VS Code, Live Server.
  - Git & GitHub (quản lý mã nguồn, public repo).
  - GitHub Pages (deploy website tĩnh).



## 5. Cấu trúc thư mục chính:

```text
animall-website/
│
├── index.html          # Trang chủ
├── products.html       # Trang danh mục sản phẩm
├── product-detail.html # Trang chi tiết sản phẩm
├── checkout.html       # Trang thanh toán
├── thankyou.html       # Trang cảm ơn sau khi đặt hàng
├── login.html          # Đăng nhập
├── register.html       # Đăng ký
├── posts.html          # Danh sách bài viết
├── posts-detail.html   # Chi tiết bài viết
├── contact.html        # Trang liên hệ
│
├── partials/
│   ├── contact.js      # Xử lý phần footer chung (liên hệ, sản phẩm gần đây, map,...)
│   ├── footer.js       # Xử lý phần footer chung (Copyright, phương thức thanh toán)
│   └── header.js       # Xử lý phần header chung
├── css/
│   ├── style.css       # CSS chung cho toàn bộ website
│   └── checkout.css    # CSS riêng cho trang thanh toán
│
├── js/
│   ├── script.js       # Logic: header, dịch vụ, load sản phẩm, bài viết, search…
│   ├── cart.js         # Xử lý giỏ hàng + drawer giỏ hàng
│   └── checkout.js     # Xử lý trang thanh toán, tính phí ship, mã giảm giá
│
├── data/
│   ├── products.json   # Dữ liệu sản phẩm (chia theo dog/cat/bird/rabbit/hamster)
│   ├── posts.json      # Dữ liệu bài viết
│   ├── services.json   # Dịch vụ chăm sóc thú cưng
│   └── users.json      # User mẫu (demo đăng nhập)
├── README.md
│
└── image/
    ├── ...             # Toàn bộ hình ảnh giao diện, sản phẩm, logo

## 6. Giao diện Demo:

**A. Trang Chủ:**
![Giao diện dự án](https://github.com/fleur-en-cristal/animall-website/blob/main/image/demo-home.png?raw=true)

**B. Sản phẩm (Ngoài trang chủ):**
![Giao diện dự án](https://github.com/fleur-en-cristal/animall-website/blob/main/image/demo-product.png?raw=true)

**C. Đăng ký / Đăng nhập:**
![Giao diện dự án](https://github.com/fleur-en-cristal/animall-website/blob/main/image/demo-login.png?raw=true)
![Giao diện dự án](https://github.com/fleur-en-cristal/animall-website/blob/main/image/demo-register.png?raw=true)

**D. Tất cả sản phẩm (Trang danh mục):**
![Giao diện dự án](https://github.com/fleur-en-cristal/animall-website/blob/main/image/demo-allproducts.png?raw=true)

**E. Chi tiết sản phẩm:**
![Giao diện dự án](https://github.com/fleur-en-cristal/animall-website/blob/main/image/demo-product-detail.png?raw=true)

**F. Tin tức / Bài viết:**
![Giao diện dự án](https://github.com/fleur-en-cristal/animall-website/blob/main/image/demo-allpost.png?raw=true)

**G. Chi tiết bài viết:**
![Giao diện dự án](https://github.com/fleur-en-cristal/animall-website/blob/main/image/demo-post-detail.png?raw=true)

**H. Giỏ hàng & Thanh toán:**
![Giao diện dự án](https://github.com/fleur-en-cristal/animall-website/blob/main/image/demo-payment.png?raw=true)

**I. Đặt hàng thành công:**
![Giao diện dự án](https://github.com/fleur-en-cristal/animall-website/blob/main/image/demo-order-placed.png?raw=true)