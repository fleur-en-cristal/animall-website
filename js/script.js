const header = document.querySelector("header");
window.addEventListener("scroll", function() {
    header.classList.toggle("sticky", window.scrollY > 0);
});
// dịch vụ
document.addEventListener('DOMContentLoaded', function () {
  // Mapping nội dung cho từng dịch vụ
  const SERVICE_CONTENT = {
    grooming: {
      id: 'sv-grooming',
      title: 'Thẩm mỹ thú cưng',
      price: 2500000,
      desc:
        'Trải nghiệm dịch vụ Grooming & Spa cao cấp với quy trình khép kín: Tắm vệ sinh, cắt tỉa nghệ thuật, chăm sóc móng và tai chuyên biệt. Chúng tôi sử dụng các dòng sản phẩm dưỡng lông hàng đầu giúp phục hồi hư tổn, mang lại vẻ ngoài hoàn hảo và sức khỏe dẻo dai cho thú cưng của bạn ngay từ lần trải nghiệm đầu tiên.',
      icon: 'image/ser-scissors.png',
      cta: 'Chọn dịch vụ'
    },
    boarding: {
      id: 'sv-boarding',
      title: 'Nội trú thú cưng',
      price: 3000000,
      desc:
        'Dịch vụ lưu trú an toàn với không gian sạch sẽ, điều hòa thoáng mát, theo dõi camera và lịch trình ăn – chơi – ngủ khoa học. Nhân viên túc trực 24/7 đảm bảo thú cưng được chăm sóc như ở nhà.',
      icon: 'image/ser-scissors.png',
      cta: 'Đặt chỗ ngay'
    },
    training: {
      id: 'sv-training',
      title: 'Huấn luyện thú cưng',
      price: 3500000,
      desc:
        'Chương trình huấn luyện cơ bản và nâng cao: đi đúng chỗ, ngồi/đứng/ở lại, gọi tên – lại gần, giao tiếp & xã hội hóa. Giáo trình tích cực, tôn trọng tính cách riêng của từng bé.',
      icon: 'image/ser-scissors.png',
      cta: 'Đăng ký khóa học'
    },
    health: {
      id: 'sv-health',
      title: 'Sức khỏe thú cưng',
      price: 4000000,
      desc:
        'Khám tổng quát, tiêm phòng, tẩy giun, vệ sinh tai – răng, tư vấn dinh dưỡng. Hợp tác cùng các phòng khám đạt chuẩn để đảm bảo chẩn đoán & phác đồ điều trị chuẩn xác.',
      icon: 'image/ser-scissors.png',
      cta: 'Đặt lịch khám'
    },
    nanny: {
      id: 'sv-nanny',
      title: 'Bảo mẫu thú cưng',
      price: 1800000,
      desc:
        'Dịch vụ trông giữ tại nhà theo giờ/ngày, cho ăn – cho uống – chơi cùng – dọn vệ sinh. Báo cáo hình ảnh/video định kỳ để bạn yên tâm dù bận rộn hay đi công tác.',
      icon: 'image/ser-scissors.png',
      cta: 'Gọi bảo mẫu'
    }
  };

  const serviceIcon  = document.getElementById('serviceIcon');
  const serviceTitle = document.getElementById('serviceTitle');
  const serviceDesc  = document.getElementById('serviceDesc');
  const serviceBtn   = document.getElementById('serviceBtn');

  let currentServiceKey = 'grooming';

  // Hàm đổi nội dung theo dịch vụ
  function renderService(key) {
    const data = SERVICE_CONTENT[key];
    if (!data) return;

    currentServiceKey = key;

    if (serviceIcon)  serviceIcon.src         = data.icon;
    if (serviceTitle) serviceTitle.textContent = data.title;
    if (serviceDesc)  serviceDesc.textContent  = data.desc;
    if (serviceBtn) {
      serviceBtn.innerHTML = `${data.cta}<span><i class='bx bxs-cat'></i></span>`;
    }

    // Active state bên trái
    document.querySelectorAll('.serv-detls .detls')
      .forEach(el => el.classList.toggle('active', el.dataset.key === key));
  }

  // Click / hover menu bên trái
  document.querySelectorAll('.serv-detls .detls').forEach(el => {
    const key = el.dataset.key;
    el.setAttribute('tabindex', '0');

    el.addEventListener('click',      () => renderService(key));
    el.addEventListener('mouseenter', () => renderService(key));
    el.addEventListener('focus',      () => renderService(key));
  });

  // Bấm nút "Chọn dịch vụ / Đăng ký khóa học / ..."
  if (serviceBtn) {
    serviceBtn.addEventListener('click', function (e) {
      e.preventDefault();

      const data = SERVICE_CONTENT[currentServiceKey];
      if (!data || !window.addToCart) {
        console.warn('Chưa tìm thấy hàm window.addToCart trong cart.js');
        return;
      }

      // Thêm vào giỏ với đúng field mà cart.js đang dùng (title, price, img)
      window.addToCart({
        id: data.id,
        title: data.title,
        price: data.price.toLocaleString('vi-VN') + ' VND',
        img: data.icon,
        type: 'Dịch vụ'   // 👈 thêm field type
      });

      // Mở luôn giỏ hàng cho user thấy
      if (window.Cart && typeof window.Cart.open === 'function') {
        window.Cart.open();
      }
    });
  }

  // Mặc định hiển thị "Thẩm mỹ"
  renderService('grooming');
});



document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('productGrid');
  const tabs = Array.from(document.querySelectorAll('.cat-link'));
  if (!grid || tabs.length === 0) return;

  const DATA_URL = 'data/products.json';
  const state = { data: null, loading: false };

  // Tạo 1 card theo đúng markup/các class đang dùng
  const card = (p, idx, catKey) => `
      <div class="row" id="prod-${catKey}-${idx}">
          <img src="${p.img}" alt="${p.alt}">
          <div class="icon"><a href="#"><i class='bx bx-heart'></i></a></div>
          <div class="hovr">
              <a href="#"><i class='bx bx-cart-alt'></i></a>
              <a href="#"><i class='bx bx-low-vision'></i></a>
              <a href="#"><i class='bx bx-sync'></i></a>
          </div>
          <div class="btm-text">
              <p>${p.tag}</p>
              <h5>${p.title}</h5>
              <div class="price">
                  <div class="pri-1"><h6>${p.price} <span>${p.oldPrice || ''}</span></h6></div>
                  <div class="rating"><a href="#"><i class='bx bxs-star'></i>${p.rate || ''}</a></div>
              </div>
          </div>
      </div>
`;

  // Fisher–Yates shuffle ⇒ lấy ngẫu nhiên n phần tử
  function sampleRandom(arr, n) {
    const a = arr.slice(); // clone
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  async function loadData() {
    if (state.data || state.loading) return state.data;
    state.loading = true;
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Không tải được dữ liệu sản phẩm');
    state.data = await res.json();
    state.loading = false;
    return state.data;
  }

  function render(catKey, random = false) {
    const listAll = (state.data && state.data[catKey]) || [];
    const list = random ? sampleRandom(listAll, 8) : listAll.slice(0, 8);
    grid.innerHTML = list.length
      ? list.map((p, idx) => card(p, idx, catKey)).join('')
      : '<p style="padding:1rem;opacity:.7">Chưa có sản phẩm cho danh mục này.</p>';
  }
  const hash = window.location.hash;
  if (hash && hash.startsWith('#prod-')) {
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.add('prod-highlight');
      setTimeout(() => target.classList.remove('prod-highlight'), 1500);
    }
  }

  // Mặc định: pet thứ nhất (nút đầu tiên)
  (async () => {
    try {
      grid.innerHTML = `<p style="padding:1rem">Đang tải...</p>`;
      await loadData();
      const firstCat = tabs[0].dataset.cat; // pet thứ nhất
      tabs[0].classList.add('active');
      render(firstCat, false); // lấy 8 đầu tiên
    } catch (e) {
      grid.innerHTML = `<p style="padding:1rem;color:#b00020">Lỗi: ${e.message}</p>`;
    }
  })();

  // Hover: hiển thị 8 NGẪU NHIÊN của pet tương ứng
  // Focus: hỗ trợ bàn phím
  tabs.forEach((btn) => {
    btn.setAttribute('tabindex', '0');

    const preview = async () => {
      try {
        await loadData();
        render(btn.dataset.cat, true); // random 8
        tabs.forEach(b => b.classList.toggle('active', b === btn));
      } catch (e) {
        // im lặng để tránh nhấp nháy lỗi khi rê nhanh
      }
    };

    btn.addEventListener('mouseenter', preview);
    btn.addEventListener('focus', preview);
  });

  // Click: sang trang danh mục đầy đủ (products.html?cat=...)
  // (giữ nguyên href sẵn có; không cần chặn)
});
// =============== BÀI VIẾT: TẤT CẢ + MỚI NHẤT ===============
document.addEventListener('DOMContentLoaded', function () {
  const allContainer    = document.getElementById('allPosts');    // dùng ở posts.html
  const latestContainer = document.getElementById('latestPosts'); // dùng ở index.html + posts.html

  // Nếu trang hiện tại không có 2 khu này thì thôi, không làm gì
  if (!allContainer && !latestContainer) return;

  fetch('data/posts.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Không load được posts.json');
      return res.json();
    })
    .then(function (posts) {
      if (!Array.isArray(posts) || posts.length === 0) {
        const emptyHtml =
          "<p style='padding:1rem;opacity:.7'>Chưa có bài viết.</p>";
        if (allContainer)    allContainer.innerHTML    = emptyHtml;
        if (latestContainer) latestContainer.innerHTML = emptyHtml;
        return;
      }

      // -------- TẤT CẢ BÀI VIẾT (posts.html) --------
      if (allContainer) {
        const sorted = posts.slice().sort(function (a, b) {
          if (!a.date || !b.date) return 0;
          return new Date(b.date) - new Date(a.date); // mới -> cũ
        });

        allContainer.innerHTML = sorted.map(function (post) {
          return `
            <div class="box">
              <div class="box-img">
                <img src="${post.image}" alt="${post.title}">
              </div>
              <p>${post.dateText || ''}</p>
              <h4>${post.title}</h4>
              <div class="box-btn">
                <a href="${post.url || '#'}">
                  Đọc thêm <span><i class='bx bx-right-arrow-alt'></i></span>
                </a>
              </div>
            </div>
          `;
        }).join('');
      }

      // -------- 4 BÀI MỚI NHẤT / NGẪU NHIÊN (index.html + posts.html) --------
      if (latestContainer) {
        const shuffled = posts.slice().sort(function () {
          return Math.random() - 0.5;
        });
        const selected = shuffled.slice(0, 4);

        latestContainer.innerHTML = selected.map(function (post) {
          return `
            <div class="box">
              <div class="box-img">
                <img src="${post.image}" alt="${post.title}">
              </div>
              <p>${post.dateText || ''}</p>
              <h4>${post.title}</h4>
              <div class="box-btn">
                <a href="${post.url || '#'}">
                  Đọc thêm <span><i class='bx bx-right-arrow-alt'></i></span>
                </a>
              </div>
            </div>
          `;
        }).join('');
      }
    })
    .catch(function (err) {
      console.error(err);
      const errorHtml =
        "<p style='padding:1rem;color:#b00020'>Không thể tải danh sách bài viết.</p>";
      if (allContainer)    allContainer.innerHTML    = errorHtml;
      if (latestContainer) latestContainer.innerHTML = errorHtml;
    });
});
// ==================== AUTH: Đăng nhập / Đăng ký / Đăng xuất ====================
document.addEventListener('DOMContentLoaded', function () {
  const AUTH_KEY = 'currentUser';
  const LOCAL_USERS_KEY = 'localUsers';

  // --- Hàm load danh sách user từ users.json + localStorage ---
  async function loadUsers() {
    let baseUsers = [];
    try {
      const res = await fetch('data/users.json', { cache: 'no-cache' });
      if (res.ok) baseUsers = await res.json();
    } catch (e) {
      console.error('Lỗi load users.json', e);
    }

    let extra = [];
    try {
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) extra = JSON.parse(stored);
    } catch (e) {
      console.warn('Không đọc được localUsers', e);
    }

    return [...baseUsers, ...extra];
  }

  // --- Cập nhật header (Đăng nhập/Đăng ký hoặc Xin chào/Đăng xuất) ---
  const logReg = document.querySelector('.log-reg');
  if (logReg) {
    const current = localStorage.getItem(AUTH_KEY);
    if (current) {
      let user;
      try { user = JSON.parse(current); } catch (e) {}
      if (user) {
        logReg.innerHTML = `
          <span>Xin chào, <strong>${user.name}</strong></span>
          <a href="#" id="logoutLink" style="margin-left:8px;">Đăng xuất</a>
        `;
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
          logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem(AUTH_KEY);
            // sau khi logout quay về trang chủ
            window.location.href = 'index.html';
          });
        }
      }
    } else {
      // nếu chưa login, đảm bảo có link đúng
      logReg.innerHTML = `
        <a href="login.html">Đăng nhập</a> /
        <a href="register.html">Đăng ký</a>
      `;
    }
  }

  // --- Xử lý ĐĂNG NHẬP (login.html) ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const emailInput = document.getElementById('loginEmail');
    const passInput  = document.getElementById('loginPassword');
    const errorEl    = document.getElementById('loginError');

    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }

      const email = emailInput.value.trim().toLowerCase();
      const pass  = passInput.value;

      const users = await loadUsers();

      // console.log('Users nạp được:', users);
      // console.log('Email nhập:', email, 'Pass nhập:', pass);

      const found = users.find(u =>
        u.email && u.email.toLowerCase() === email && u.password === pass
      );

      if (!found) {
        if (errorEl) {
          errorEl.textContent = 'Email hoặc mật khẩu không đúng.';
          errorEl.style.display = 'block';
        }
        return;
      }

      // Lưu thông tin user vào localStorage
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        id: found.id,
        name: found.name,
        email: found.email
      }));

      // Chuyển về trang chủ (hoặc trang trước)
      window.location.href = 'index.html';
    });
  }

  // --- Xử lý ĐĂNG KÝ (register.html) ---
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const nameInput  = document.getElementById('regName');
    const emailInput = document.getElementById('regEmail');
    const passInput  = document.getElementById('regPassword');
    const errorEl    = document.getElementById('registerError');
    const successEl  = document.getElementById('registerSuccess');

    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (errorEl)   { errorEl.style.display = 'none'; errorEl.textContent = ''; }
      if (successEl) { successEl.style.display = 'none'; successEl.textContent = ''; }

      const name  = nameInput.value.trim();
      const email = emailInput.value.trim().toLowerCase();
      const pass  = passInput.value;

      if (!name || !email || !pass) {
        if (errorEl) {
          errorEl.textContent = 'Vui lòng nhập đầy đủ thông tin.';
          errorEl.style.display = 'block';
        }
        return;
      }

      const users = await loadUsers();
      const existed = users.some(u => u.email && u.email.toLowerCase() === email);
      if (existed) {
        if (errorEl) {
          errorEl.textContent = 'Email này đã được đăng ký.';
          errorEl.style.display = 'block';
        }
        return;
      }

      // Lưu user mới vào localStorage (không ghi vào users.json được)
      let extra = [];
      try {
        const stored = localStorage.getItem(LOCAL_USERS_KEY);
        if (stored) extra = JSON.parse(stored);
      } catch {}

      extra.push({
        id: Date.now(),
        name,
        email,
        password: pass
      });

      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(extra));

      if (successEl) {
        successEl.textContent = 'Đăng ký thành công! Bạn có thể đăng nhập.';
        successEl.style.display = 'block';
      }

      // tự động chuyển sang trang đăng nhập sau 1.5s
      setTimeout(function () {
        window.location.href = 'login.html';
      }, 1500);
    });
  }
});

//script của products.html
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat') || 'dog';
    const titleMap = {
        dog: 'Sản phẩm cho Cún',
        cat: 'Sản phẩm cho Mèo',
        bird: 'Sản phẩm cho Chim',
        rabbit: 'Sản phẩm cho Thỏ',
        hamster: 'Sản phẩm cho Hamster'
    };

    const grid = document.getElementById('catalogGrid');
    const title = document.getElementById('catalogTitle');
    title.textContent = titleMap[cat] || 'Tất cả sản phẩm';

    grid.innerHTML = '<p style="padding:1rem">Đang tải...</p>';
    try {
        const res = await fetch('data/products.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('Không tải được dữ liệu sản phẩm');
        const data = await res.json();
        const list = data[cat] || [];

        const card = (p, idx) => `
            <div class="row" id="prod-${cat}-${idx}">
              <img src="${p.img}" alt="${p.alt}">
              <div class="icon"><a href="#"><i class='bx bx-heart'></i></a></div>
              <div class="hovr">
                  <a href="#"><i class='bx bx-cart-alt'></i></a>
                  <a href="#"><i class='bx bx-low-vision'></i></a>
                  <a href="#"><i class='bx bx-sync'></i></a>
              </div>
              <div class="btm-text">
                  <p>${p.tag}</p>
                  <h5>${p.title}</h5>
                  <div class="price">
                  <div class="pri-1"><h6>${p.price} <span>${p.oldPrice || ''}</span></h6></div>
                  <div class="rating"><a href="#"><i class='bx bxs-star'></i>${p.rate || ''}</a></div>
                  </div>
              </div>
            </div>
        `;
        grid.innerHTML = list.length
            ? list.map(card).join('')
            : '<p style="padding:1rem;opacity:.7">Chưa có sản phẩm cho danh mục này.</p>';
    } catch (e) {
        grid.innerHTML = `<p style="padding:1rem;color:#b00020">Lỗi: ${e.message}</p>`;
    }
});
// ========== SẢN PHẨM GẦN ĐÂY Ở FOOTER ==========
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('recentProducts');
  if (!wrap) return; // nếu không có block thì thôi

  const DATA_URL = 'data/products.json';

  // Fisher–Yates shuffle
  function sampleRandom(arr, n) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  fetch(DATA_URL, { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error('Không tải được dữ liệu sản phẩm');
      return res.json();
    })
    .then(data => {
      const all = [];

      // gom tất cả sản phẩm, nhưng giữ lại cat + index
      Object.entries(data || {}).forEach(([catKey, arr]) => {
        arr.forEach((p, idx) => {
          all.push({ cat: catKey, index: idx, p });
        });
      });

      if (!all.length) {
        wrap.innerHTML =
          "<p style='font-size:14px;opacity:.7'>Chưa có sản phẩm để hiển thị.</p>";
        return;
      }

      const picks = sampleRandom(all, 3);

      wrap.innerHTML = picks.map(item => {
        const { cat, index, p } = item;
        const targetId = `prod-${cat}-${index}`;
        const href = `products.html?cat=${encodeURIComponent(cat)}#${targetId}`;

        // dùng <a> làm container để click được toàn bộ dòng
        return `
          <a class="cont-info" href="${href}">
            <img src="${p.img}" alt="${p.alt || p.title}">
            <div class="cont-hum">
              <h4>${p.title}</h4>
              <h6>${p.price}</h6>
            </div>
          </a>
        `;
      }).join('');
    })
    .catch(err => {
      console.error('Lỗi sản phẩm gần đây:', err);
      wrap.innerHTML =
        "<p style='font-size:14px;color:#b00020'>Không tải được sản phẩm gần đây.</p>";
    });
});
// ========== TÌM KIẾM SẢN PHẨM ========== 
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('searchToggle');
  const panel     = document.getElementById('searchPanel');
  const input     = document.getElementById('searchInput');
  const closeBtn  = document.getElementById('searchClose');
  const resultsEl = document.getElementById('searchResults');

  if (!toggleBtn || !panel || !input || !resultsEl) return;

  const DATA_URL = 'data/products.json';
  let allProducts = [];
  let loaded = false;

  // gom toàn bộ sản phẩm từ products.json
  async function ensureData() {
    if (loaded) return allProducts;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('Không tải được dữ liệu sản phẩm');
      const data = await res.json();

      const tmp = [];
      Object.entries(data || {}).forEach(([catKey, arr]) => {
        arr.forEach((p, idx) => {
          tmp.push({
            ...p,
            cat: catKey,
            index: idx
          });
        });
      });
      allProducts = tmp;
      loaded = true;
    } catch (e) {
      console.error('Lỗi load dữ liệu search:', e);
    }
    return allProducts;
  }

  function openPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    setTimeout(() => input.focus(), 10);
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    input.value = '';
    resultsEl.innerHTML = '';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closePanel();
    });
  }

  // ESC để đóng
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      closePanel();
    }
  });

  // Lọc kết quả theo text
  input.addEventListener('input', async () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      resultsEl.innerHTML = '';
      return;
    }

    await ensureData();
    if (!allProducts.length) {
      resultsEl.innerHTML =
        "<p class='search-empty'>Không tải được dữ liệu sản phẩm.</p>";
      return;
    }

    const matches = allProducts.filter(p =>
      (p.title || '').toLowerCase().includes(q)
    );

    if (!matches.length) {
      resultsEl.innerHTML =
        "<p class='search-empty'>Không tìm thấy sản phẩm phù hợp.</p>";
      return;
    }

    // tối đa 8 kết quả
    const top = matches.slice(0, 8);

    resultsEl.innerHTML = top.map(p => {
      const anchor = `prod-${p.cat}-${p.index}`;
      const href = `products.html?cat=${encodeURIComponent(p.cat)}#${anchor}`;
      return `
        <a class="search-item" href="${href}">
          <img src="${p.img}" alt="${p.alt || p.title}">
          <div class="search-meta">
            <div class="search-title">${p.title}</div>
            <div class="search-price">${p.price}</div>
          </div>
        </a>
      `;
    }).join('');
  });
});


let menu = document.querySelector('#menu-icon');
let navigation = document.querySelector('.navigation');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navigation.classList.toggle('active');
};
// random 4 bài viết mới nhất
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('latestPosts');
    if (!container) return; // phòng khi dùng script.js ở trang khác

    fetch('data/posts.json')
        .then(function (res) {
            if (!res.ok) throw new Error('Không load được posts.json');
            return res.json();
        })
        .then(function (posts) {
            if (!Array.isArray(posts) || posts.length === 0) return;

            // shuffle mảng rồi lấy 4 phần tử đầu
            const shuffled = posts.slice().sort(function () {
                return Math.random() - 0.5;
            });
            const selected = shuffled.slice(0, 4);

            container.innerHTML = selected.map(function (post) {
                return `
                <div class="box">
                    <div class="box-img">
                        <img src="${post.image}" alt="${post.title}">
                    </div>
                    <p>${post.dateText}</p>
                    <h4>${post.title}</h4>
                    
                    <div class="box-btn">
                        <a href="${post.url || '#'}">
                            Đọc thêm <span><i class='bx bx-right-arrow-alt'></i></span>
                        </a>
                    </div>
                </div>
                `;
            }).join('');
        })
        .catch(function (err) {
            console.error(err);
            container.innerHTML =
                "<p style='padding:1rem;color:#b00020'>Không thể tải danh sách bài viết.</p>";
        });
});
// liên hệ
(function () {
    const form = document.getElementById('contactForm');
    const fields = ['name', 'email', 'topic', 'message'];

    fields.forEach(f => {
        const el = document.getElementById(f);
        const val = localStorage.getItem('contact_' + f);
        if (val) el.value = val;
        el.addEventListener('input', () => localStorage.setItem('contact_' + f, el.value));
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { alert('Vui lòng điền đầy đủ thông tin.'); return; }
        alert('Đã gửi liên hệ! (mô phỏng)');
        form.reset();
        fields.forEach(f => localStorage.removeItem('contact_' + f));
    });
})();
