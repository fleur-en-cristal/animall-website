const header = document.querySelector("header");
window.addEventListener("scroll", function() {
    header.classList.toggle("sticky", window.scrollY > 0);
});
//***DỊCH VỤ***//
document.addEventListener('DOMContentLoaded', function () {
  // mapping nội dung cho từng dịch vụ
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

  /**ĐỔI NỘI DUNG THEO DỊCH VỤ**/
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

    // active state bên trái
    document.querySelectorAll('.serv-detls .detls')
      .forEach(el => el.classList.toggle('active', el.dataset.key === key));
  }

  // click / hover menu bên trái
  document.querySelectorAll('.serv-detls .detls').forEach(el => {
    const key = el.dataset.key;
    el.setAttribute('tabindex', '0');

    el.addEventListener('click',      () => renderService(key));
    el.addEventListener('mouseenter', () => renderService(key));
    el.addEventListener('focus',      () => renderService(key));
  });

  // bấm nút "Chọn dịch vụ / Đăng ký khóa học / ..."
  if (serviceBtn) {
    serviceBtn.addEventListener('click', function (e) {
      e.preventDefault();
      //code kiểm tra đăng nhập
      const user = localStorage.getItem('currentUser');
      if (!user) {
          if (confirm("Bạn cần đăng nhập để đăng ký dịch vụ.\nĐến trang đăng nhập ngay?")) {
              window.location.href = 'login.html';
          }
          return; // dừng lại
      }
      const data = SERVICE_CONTENT[currentServiceKey];
      if (!data || !window.addToCart) {
        console.warn('Chưa tìm thấy hàm window.addToCart trong cart.js');
        return;
      }

      // thêm vào giỏ với đúng field mà cart.js đang dùng (title, price, img)
      window.addToCart({
        id: data.id,
        title: data.title,
        price: data.price.toLocaleString('vi-VN') + ' VND',
        img: data.icon,
        type: 'Dịch vụ'   // 👈 thêm field type
      });

      // mở luôn giỏ hàng cho user thấy
      if (window.Cart && typeof window.Cart.open === 'function') {
        window.Cart.open();
      }
    });
  }

  // mặc định hiển thị "Thẩm mỹ"
  renderService('grooming');
});

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('productGrid');
  const tabs = Array.from(document.querySelectorAll('.cat-link'));
  if (!grid || tabs.length === 0) return;

  const DATA_URL = 'data/products.json';
  const state = { data: null, loading: false };

  // tạo 1 card theo đúng markup/các class đang dùng
  const card = (p, idx, catKey) => `
    <div class="row" 
         id="prod-${catKey}-${idx}" 
         data-id="prod-${catKey}-${idx}" 
         data-cat="${catKey}"
         style="cursor: pointer;"
         onclick="if(!event.target.closest('a')) window.location.href='product-detail.html?cat=${catKey}&id=${idx}'">
           
          <img src="${p.img}" alt="${p.alt}">
          
          <div class="icon">
              <a href="#"><i class='bx bx-heart'></i></a>
          </div>
          
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
                  <div class="rating">
                      <a href="#"><i class='bx bxs-star'></i>${p.rate || ''}</a>
                  </div>
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

    //***Gắn số thứ tự gốc originalIndex vào từng sản phẩm trước khi random
    // để dù có bị xáo trộn đi đâu, nó vẫn nhớ vị trí nhà của nó
    const listWithIndex = listAll.map((item, originalIndex) => ({
        ...item,
        originalIndex: originalIndex // lưu lại số thứ tự gốc (0, 1, 2, 3...)
    }));

    //*** xong bước trên thì bây giờ mới thực hiện random hoặc cắt lấy 8 sản phẩm
    const list = random ? sampleRandom(listWithIndex, 8) : listWithIndex.slice(0, 8);

    //***khi tạo card, truyền p.originalIndex thay vì idx của vòng lặp
    grid.innerHTML = list.length
      ? list.map((p) => card(p, p.originalIndex, catKey)).join('')
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

  // mặc định: pet thứ nhất là nút đầu tiên bên trái
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

  // hover: hiển thị 8 ngẫu nhiên của pet tương ứng
  // focus: hỗ trợ bàn phím
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

  // click: sang trang danh mục đầy đủ (products.html?cat=...)
  // giữ nguyên href sẵn có k chặn
});
/**xử lý ds bài viết & chi tiết*/

// **hiển thị danh sách bài viết cho cả trang index và posts
document.addEventListener('DOMContentLoaded', function () {
    const allContainer    = document.getElementById('allPosts');    // trang posts.html
    const latestContainer = document.getElementById('latestPosts'); // trang index.html

    // nếu trang hiện tại k có khung bài viết nào thì dừng
    if (!allContainer && !latestContainer) return;

    fetch('data/posts.json')
        .then(res => res.json())
        .then(posts => {
            if (!Array.isArray(posts) || posts.length === 0) return;

            // tạo HTML cho 1 bài viết link trỏ về post-detail.html
            const createPostHTML = (post) => `
                <div class="box">
                    <div class="box-img">
                        <a href="post-detail.html?id=${post.id}">
                            <img src="${post.image}" alt="${post.title}">
                        </a>
                    </div>
                    <p>${post.dateText || ''}</p>
                    <h4><a href="post-detail.html?id=${post.id}" style="color:inherit">${post.title}</a></h4>
                    
                    <div class="box-btn">
                        <a href="post-detail.html?id=${post.id}">
                            Đọc thêm <span><i class='bx bx-right-arrow-alt'></i></span>
                        </a>
                    </div>
                </div>
            `;

            // nếu đang ở trang posts.html -> hiện hết tất cả bài
            if (allContainer) {
                // sắp xếp bài mới nhất lên đầu
                const sorted = posts.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
                allContainer.innerHTML = sorted.map(createPostHTML).join('');
            }

            // nếu đang ở trang index.html (hoặc footer) -> hiện 4 bài ngẫu nhiên
            if (latestContainer) {
                const shuffled = posts.slice().sort(() => Math.random() - 0.5).slice(0, 4);
                latestContainer.innerHTML = shuffled.map(createPostHTML).join('');
            }
        })
        .catch(err => console.error('Lỗi tải bài viết:', err));
});

//**xử lý trang CHI TIẾT BÀI VIẾT post-detail.html
document.addEventListener('DOMContentLoaded', async () => {
    const detailTitle = document.getElementById('detailTitle');
    
    // nếu k tìm thấy tiêu đề (tức là k phải trang chi tiết) thì dừng
    if (!detailTitle) return;

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        detailTitle.textContent = "Không tìm thấy bài viết!";
        return;
    }

    try {
        const res = await fetch('data/posts.json');
        const posts = await res.json();
        const post = posts.find(p => p.id === postId);

        if (!post) {
            detailTitle.textContent = "Bài viết không tồn tại!";
            return;
        }

        // đổ dữ liệu vào giao diện
        document.title = `${post.title} - Animall`;
        detailTitle.textContent = post.title;
        document.getElementById('detailDate').textContent = post.dateText;
        document.getElementById('detailImg').src = post.image;
        document.getElementById('detailContent').innerHTML = post.content || "<p>Nội dung đang cập nhật...</p>";

    } catch (err) {
        console.error(err);
        detailTitle.textContent = "Lỗi tải dữ liệu!";
    }
});
// ***auth: đăng nhập / đăng ký / đăng xuất
document.addEventListener('DOMContentLoaded', function () {
  const AUTH_KEY = 'currentUser';
  const LOCAL_USERS_KEY = 'localUsers';

  // *** hàm load danh sách user từ users.json + localStorage ***
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

  // *** cập nhật header (đăng nhập/đăng ký hoặc xin chào/đăng xuất) ***
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

  // *** xử lý đăng nhập (login.html) ***
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

      // lưu thông tin user vào localStorage
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        id: found.id,
        name: found.name,
        email: found.email
      }));

      // chuyển về trang chủ (hoặc trang trước)
      window.location.href = 'index.html';
    });
  }

  // *** xử lý đăng ký (register.html) ***
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

      // lưu user mới vào localStorage (k ghi vào users.json được)
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

//***script của products.html
document.addEventListener('DOMContentLoaded', async () => {
    //***kiểm tra xem có phải trang products.html k
    const grid = document.getElementById('catalogGrid');
    if (!grid) return; // nếu k có khung lưới này thì dừng ngay

    const params = new URLSearchParams(location.search);
    const cat = params.get('cat') || 'dog';
    
    // bản đồ tên danh mục
    const titleMap = {
        dog: 'Sản phẩm cho Cún',
        cat: 'Sản phẩm cho Mèo',
        bird: 'Sản phẩm cho Chim',
        rabbit: 'Sản phẩm cho Thỏ',
        hamster: 'Sản phẩm cho Hamster'
    };

    const title = document.getElementById('catalogTitle');
    if (title) title.textContent = titleMap[cat] || 'Tất cả sản phẩm';

    grid.innerHTML = '<p style="padding:1rem">Đang tải...</p>';
    
    try {
        const res = await fetch('data/products.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('Không tải được dữ liệu sản phẩm');
        const data = await res.json();
        const list = data[cat] || [];

        //***hàm tạo Card sản phẩm
        const card = (p, idx) => `
            <div class="row" 
                 id="prod-${cat}-${idx}"
                 data-id="prod-${cat}-${idx}" 
                 data-cat="${cat}"
                 style="cursor: pointer;"
                 onclick="if(!event.target.closest('a')) window.location.href='product-detail.html?cat=${cat}&id=${idx}'">
                 
              <img src="${p.img}" alt="${p.alt}">
              
              <div class="icon">
                  <a href="#"><i class='bx bx-heart'></i></a>
              </div>
              
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
                      <div class="rating">
                          <a href="#"><i class='bx bxs-star'></i>${p.rate || ''}</a>
                      </div>
                  </div>
              </div>
            </div>
        `;

        grid.innerHTML = list.length
            ? list.map((p, idx) => card(p, idx)).join('')
            : '<p style="padding:1rem;opacity:.7">Chưa có sản phẩm cho danh mục này.</p>';
            
    } catch (e) {
        grid.innerHTML = `<p style="padding:1rem;color:#b00020">Lỗi: ${e.message}</p>`;
    }
});

// *** sản phẩm gần đây ở footer ***
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('recentProducts');
  if (!wrap) return; // nếu k có block thì thôi

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
// *** tìm kiếm sản phẩm ***
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

  // lọc kết quả theo text
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
// ***liên hệ (fixed: chỉ chạy khi có form thôi)
(function () {
    const form = document.getElementById('contactForm');
    
    // nếu trang này k có form liên hệ thì dừng ngay, k làm gì cả (tránh lỗi)
    if (!form) return; 

    const fields = ['name', 'email', 'topic', 'message'];

    fields.forEach(f => {
        const el = document.getElementById(f);
        // kiểm tra kỹ: nếu ô nhập liệu tồn tại thì mới xử lý
        if (el) {
            const val = localStorage.getItem('contact_' + f);
            if (val) el.value = val;
            el.addEventListener('input', () => localStorage.setItem('contact_' + f, el.value));
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { alert('Vui lòng điền đầy đủ thông tin.'); return; }
        alert('Đã gửi liên hệ! (mô phỏng)');
        form.reset();
        fields.forEach(f => localStorage.removeItem('contact_' + f));
    });
})();
/**XỬ LÝ CÁC NÚT TRÊN SẢN PHẨM (GRID): GIỎ HÀNG, ẨN, KHÔI PHỤC*/

document.addEventListener('click', function(e) {
    const targetLink = e.target.closest('.hovr a');
    if (!targetLink) return;

    const isCartBtn = targetLink.querySelector('.bx-cart-alt');
    const isHideBtn = targetLink.querySelector('.bx-low-vision');
    const isSyncBtn = targetLink.querySelector('.bx-sync');

    //**NÚT THÊM VÀO GIỎ (bảo vệ đăng nhập)
    if (isCartBtn) {
        const user = localStorage.getItem('currentUser');
        if (!user) {
            //chưa đăng nhập -> chặn ngay lập tức
            e.preventDefault();
            e.stopImmediatePropagation(); // ngăn cart.js chạy
            
            if (confirm("Bạn cần đăng nhập để mua hàng.\nĐến trang đăng nhập ngay?")) {
                window.location.href = 'login.html';
            }
            return;
        }
        // nếu đã đăng nhập -> để yên cho cart.js tự xử lý tiếp
    }

    //**NÚT ẨN SẢN PHẨM
    if (isHideBtn) {
        e.preventDefault();
        const productCard = targetLink.closest('.row');
        if (productCard) {
            productCard.style.transition = 'all 0.5s ease';
            productCard.style.opacity = '0';
            productCard.style.transform = 'scale(0.8)';
            setTimeout(() => { productCard.style.display = 'none'; }, 500);
        }
    }

    //**NÚT KHÔI PHỤC
    if (isSyncBtn) {
        e.preventDefault();
        const icon = targetLink.querySelector('i');
        if (icon) {
            icon.style.transition = 'transform 0.5s ease';
            icon.style.transform = 'rotate(360deg)';
            setTimeout(() => icon.style.transform = 'none', 500);
        }
        const hiddenRows = document.querySelectorAll('.row[style*="display: none"]');
        if (hiddenRows.length === 0) {
            alert("Danh sách đã đầy đủ!");
        } else {
            hiddenRows.forEach(row => {
                row.style.display = '';
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'scale(1)';
                }, 50);
            });
        }
    }
});
/**XỬ LÝ TRANG CHI TIẾT SẢN PHẨM (product-detail.html)**/

document.addEventListener('DOMContentLoaded', async () => {
    const proName = document.getElementById('proName');
    
    // nếu k có phần tử này -> k phải trang chi tiết -> dừng
    if (!proName) return; 

    //***lấy thông tin từ URL
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    const id = params.get('id');

    if (!cat || !id) {
        proName.textContent = "Không tìm thấy sản phẩm!";
        return;
    }

    try {
        //***tải dữ liệu từ file JSON
        const res = await fetch('data/products.json', { cache: 'no-store' });
        const data = await res.json();
        
        // lấy đúng sản phẩm trong danh mục
        const product = data[cat] ? data[cat][id] : null;

        if (!product) {
            proName.textContent = "Sản phẩm không tồn tại!";
            return;
        }

        //***hiển thị dữ liệu lên màn hình
        document.title = `${product.title} - Animall`;
        
        const imgEl = document.getElementById('MainImg');
        if (imgEl) imgEl.src = product.img;
        
        const tagEl = document.getElementById('proTag');
        if (tagEl) tagEl.textContent = `Sản phẩm / ${product.tag || 'Sản phẩm'}`;
        
        proName.textContent = product.title;
        
        const priceEl = document.getElementById('proPrice');
        if (priceEl) priceEl.textContent = product.price;
        
        const oldPriceEl = document.getElementById('proOldPrice');
        if (oldPriceEl) oldPriceEl.textContent = product.oldPrice || '';
        
        const rateEl = document.getElementById('proRate');
        if (rateEl) rateEl.textContent = product.rate || '5.0';
        
        //***hiển thị mô tả lấy từ json
        const descEl = document.getElementById('proDesc');
        if (descEl) {
            // nếu trong json có 'desc' thì dùng, k thì dùng câu mặc định
            descEl.textContent = product.desc 
                ? product.desc 
                : `Sản phẩm ${product.title} là lựa chọn tuyệt vời cho thú cưng.`;
        }

        //***xử lý nút thêm vào giỏ hàngđể cập nhật số lượng chuẩn
        const addBtn = document.getElementById('addToCartBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                
                //**kiểm tra đăng nhập
                const user = localStorage.getItem('currentUser');
                if (!user) {
                    if (confirm("Bạn cần đăng nhập để mua hàng.\nĐến trang đăng nhập ngay?")) {
                        window.location.href = 'login.html';
                    }
                    return; 
                }

                //**lấy số lượng từ ô input
                const qtyInput = document.getElementById('proQty');
                let quantity = 1;
                if (qtyInput && qtyInput.value > 0) {
                    quantity = parseInt(qtyInput.value);
                }

                //**thêm vào giỏ
                if (window.addToCart) {
                    window.addToCart({
                        id: `prod-${cat}-${id}`,
                        title: product.title,
                        price: product.price,
                        img: product.img,
                        type: cat,
                        quantity: quantity // truyền số lượng đã chọn
                    });
                    
                    // mở giỏ hàng
                    if (window.Cart && typeof window.Cart.open === 'function') {
                        window.Cart.open();
                    }
                }
            });
        }

    } catch (err) {
        console.error(err);
        proName.textContent = "Lỗi tải dữ liệu!";
    }
});
// *** XỬ LÝ NÚT THANH TOÁN TRONG GIỎ HÀNG ***
document.addEventListener('click', function(e) {
    //**kiểm tra xem người dùng có bấm vào nút có id="cartCheckout" k
    // dùng Event Delegation sẽ hoạt động kể cả khi nút này được sinh ra bằng JS
    if (e.target && e.target.id === 'cartCheckout') {
        
        e.preventDefault(); // ngăn chặn hành vi chuyển trang mặc định ngay lập tức để kiểm tra điều kiện trước

        //**kiểm tra đăng nhập
        const user = localStorage.getItem('currentUser');
        if (!user) {
            if (confirm("Bạn cần đăng nhập để thanh toán.\nĐến trang đăng nhập ngay?")) {
                window.location.href = 'login.html';
            }
            return; // dừng lại, k cho đi tiếp
        }

        //**kiểm tra giỏ hàng có trống k
        // key 'cart_items_v1' phải khớp với key dùng lưu giỏ hàng trong localStorage
        const cartKey = 'cart_items_v1'; 
        let cart = [];
        try {
            cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        } catch (err) {
            cart = [];
        }

        if (cart.length === 0) {
            alert("Giỏ hàng của bạn đang trống! Hãy mua thêm sản phẩm.");
            return; // dừng lại
        }

        //**nếu đủ điều kiện -> Chuyển hướng thủ công bằng JS
        window.location.href = 'checkout.html';
    }
});