const header = document.querySelector("header");
window.addEventListener("scroll", function() {
    header.classList.toggle("sticky", window.scrollY > 0);
});

// ===== WISHLIST (Yêu thích) =====
const Wishlist = (() => {
  const KEY = 'wishlist_items_v1';
  let setCache = null;

  const normalizeItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items
      .filter(it => it && typeof it.cat === 'string' && Number.isFinite(Number(it.idx)))
      .map(it => ({ cat: it.cat, idx: Number(it.idx) }));
  };

  const read = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      return normalizeItems(JSON.parse(raw));
    } catch {
      return [];
    }
  };

  const write = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
    setCache = null;
  };

  const getSet = () => {
    if (setCache) return setCache;
    const s = new Set(read().map(it => `${it.cat}:${it.idx}`));
    setCache = s;
    return s;
  };

  const has = (cat, idx) => getSet().has(`${cat}:${Number(idx)}`);

  const toggle = (cat, idx) => {
    const c = String(cat);
    const i = Number(idx);
    if (!c || !Number.isFinite(i)) return { added: false, items: read() };

    const items = read();
    const key = `${c}:${i}`;
    const s = getSet();

    if (s.has(key)) {
      const next = items.filter(it => !(it.cat === c && Number(it.idx) === i));
      write(next);
      return { added: false, items: next };
    }

    const next = [{ cat: c, idx: i }, ...items];
    write(next);
    return { added: true, items: next };
  };

  const count = () => read().length;

  return { KEY, read, has, toggle, count };
})();

window.Wishlist = Wishlist;

let __wishlistProductsCache = null;
async function __getWishlistProductsData() {
  if (__wishlistProductsCache) return __wishlistProductsCache;
  const res = await fetch('data/products.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Không tải được data/products.json');
  __wishlistProductsCache = await res.json();
  return __wishlistProductsCache;
}

window.renderWishlistPopover = async function (popEl) {
  if (!popEl) return;
  const items = Wishlist.read();

  if (items.length === 0) {
    popEl.innerHTML = `
      <div class="wishlist-pop__head"><strong>Yêu thích</strong></div>
      <div class="wishlist-pop__empty">Chưa có sản phẩm yêu thích.</div>
      <a class="wishlist-pop__cta" href="products.html">Đi chọn sản phẩm</a>
    `;
    return;
  }

  popEl.innerHTML = `
    <div class="wishlist-pop__head"><strong>Yêu thích</strong></div>
    <div class="wishlist-pop__loading">Đang tải...</div>
  `;

  let data;
  try {
    data = await __getWishlistProductsData();
  } catch (e) {
    popEl.innerHTML = `
      <div class="wishlist-pop__head"><strong>Yêu thích</strong></div>
      <div class="wishlist-pop__empty">Không tải được dữ liệu sản phẩm.</div>
    `;
    return;
  }

  const resolved = items
    .map(({ cat, idx }) => {
      const p = data && data[cat] && data[cat][idx];
      if (!p) return null;
      return { cat, idx, p };
    })
    .filter(Boolean);

  if (resolved.length === 0) {
    popEl.innerHTML = `
      <div class="wishlist-pop__head"><strong>Yêu thích</strong></div>
      <div class="wishlist-pop__empty">Danh sách yêu thích đang trống.</div>
      <a class="wishlist-pop__cta" href="products.html">Đi chọn sản phẩm</a>
    `;
    return;
  }

  popEl.innerHTML = `
    <div class="wishlist-pop__head"><strong>Yêu thích</strong></div>
    <ul class="wishlist-pop__list">
      ${resolved
        .slice(0, 8)
        .map(({ cat, idx, p }) => `
          <li class="wishlist-item">
            <a class="wishlist-item__link" href="product-detail.html?cat=${cat}&id=${idx}">
              <img class="wishlist-item__img" src="${p.img}" alt="${p.alt || p.title}">
              <div class="wishlist-item__meta">
                <div class="wishlist-item__title">${p.title}</div>
                <div class="wishlist-item__price">${p.price || ''}</div>
              </div>
            </a>
            <button class="wishlist-item__remove" type="button" data-wishlist-remove data-cat="${cat}" data-idx="${idx}" aria-label="Bỏ khỏi yêu thích">&times;</button>
          </li>
        `)
        .join('')}
    </ul>
    <div class="wishlist-pop__foot">
      <a class="wishlist-pop__cta" href="products.html">Xem thêm sản phẩm</a>
    </div>
  `;
};

// delegated click for wishlist hearts on product cards
document.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('[data-wishlist-remove]');
  if (removeBtn) {
    e.preventDefault();
    e.stopPropagation();
    const cat = removeBtn.getAttribute('data-cat');
    const idx = removeBtn.getAttribute('data-idx');
    Wishlist.toggle(cat, idx); // ensure removed if present
    const badge = document.getElementById('wishCount');
    if (badge) {
      const c = Wishlist.count();
      badge.textContent = String(c);
      badge.style.display = c > 0 ? 'inline-flex' : 'none';
    }
    const pop = document.getElementById('wishlistPop');
    if (pop && !pop.hasAttribute('hidden') && typeof window.renderWishlistPopover === 'function') {
      window.renderWishlistPopover(pop);
    }
    return;
  }

  const btn = e.target.closest('[data-wishlist-toggle]');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();

  const cat = btn.getAttribute('data-cat');
  const idx = btn.getAttribute('data-idx');
  const { added } = Wishlist.toggle(cat, idx);

  // sync all matching hearts (same product) across the page
  document.querySelectorAll('[data-wishlist-toggle]').forEach((toggleEl) => {
    if (toggleEl.getAttribute('data-cat') !== String(cat)) return;
    if (toggleEl.getAttribute('data-idx') !== String(idx)) return;
    const icon = toggleEl.querySelector('i');
    if (!icon) return;
    icon.classList.remove('bx-heart', 'bxs-heart');
    icon.classList.add(added ? 'bxs-heart' : 'bx-heart');
  });

  // update header badge if present
  const badge = document.getElementById('wishCount');
  if (badge) {
    const c = Wishlist.count();
    badge.textContent = String(c);
    badge.style.display = c > 0 ? 'inline-flex' : 'none';
  }
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
  const card = (p, idx, catKey) => {
    const heart = (window.Wishlist && window.Wishlist.has(catKey, idx)) ? 'bxs-heart' : 'bx-heart';
    return `
    <div class="row" 
         id="prod-${catKey}-${idx}" 
         data-id="prod-${catKey}-${idx}" 
         data-cat="${catKey}"
         style="cursor: pointer;"
         onclick="if(!event.target.closest('a')) window.location.href='product-detail.html?cat=${catKey}&id=${idx}'">
           
          <img src="${p.img}" alt="${p.alt}">
          
          <div class="icon">
              <a href="#" data-wishlist-toggle data-cat="${catKey}" data-idx="${idx}" aria-label="Yêu thích">
                <i class='bx ${heart}'></i>
              </a>
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
  };

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

        const normalizePostContent = (raw) => {
          if (!raw) return '';
          const html = String(raw);

          // If content is a full HTML document, extract <article> or <body>.
          // This prevents nested <html>/<body> markup from breaking layout.
          const looksLikeDoc = /<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html) || /<body[\s>]/i.test(html);
          if (!looksLikeDoc) return html;

          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const article = doc.querySelector('article');
            if (article && article.innerHTML.trim()) return article.innerHTML;
            const body = doc.body;
            if (body && body.innerHTML.trim()) return body.innerHTML;
            return html;
          } catch {
            return html;
          }
        };

        // đổ dữ liệu vào giao diện
        document.title = `${post.title} - Animall`;
        detailTitle.textContent = post.title;
        document.getElementById('detailDate').textContent = post.dateText;
        document.getElementById('detailImg').src = post.image;
        const normalized = normalizePostContent(post.content);
        document.getElementById('detailContent').innerHTML = normalized || "<p>Nội dung đang cập nhật...</p>";

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
        document.body.classList.add('is-auth');
        logReg.classList.add('is-loggedin');
        logReg.innerHTML = `
          <span class="user-greeting">Xin chào, <strong>${user.name}</strong></span>
          <span class="user-actions" aria-label="Tài khoản">
            <a class="user-icon" href="pet-profile.html" title="Pet Profile" aria-label="Pet Profile">
              <i class='bx bx-id-card'></i>
            </a>

            <span class="wishlist-wrap">
              <a class="user-icon" href="#" id="wishlistToggle" title="Yêu thích" aria-label="Yêu thích" aria-haspopup="true" aria-expanded="false">
                <i class='bx bx-heart'></i>
                <span class="wish-count" id="wishCount">0</span>
              </a>
              <div class="wishlist-pop" id="wishlistPop" hidden></div>
            </span>

            <a class="user-icon" href="#" id="logoutLink" title="Đăng xuất" aria-label="Đăng xuất">
              <i class='bx bx-log-out'></i>
            </a>
          </span>
        `;

        // init wishlist badge + popover
        const wishBadge = document.getElementById('wishCount');
        if (wishBadge) {
          const c = Wishlist.count();
          wishBadge.textContent = String(c);
          wishBadge.style.display = c > 0 ? 'inline-flex' : 'none';
        }

        const wishToggle = document.getElementById('wishlistToggle');
        const wishPop = document.getElementById('wishlistPop');
        if (wishToggle && wishPop) {
          const closeWish = () => {
            wishPop.setAttribute('hidden', '');
            wishToggle.setAttribute('aria-expanded', 'false');
          };
          const openWish = async () => {
            wishPop.removeAttribute('hidden');
            wishToggle.setAttribute('aria-expanded', 'true');
            await window.renderWishlistPopover(wishPop);
          };

          wishToggle.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!wishPop.hasAttribute('hidden')) closeWish();
            else await openWish();
          });

          document.addEventListener('click', (e) => {
            if (wishPop.hasAttribute('hidden')) return;
            if (e.target.closest('.wishlist-wrap')) return;
            closeWish();
          });

          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeWish();
          });
        }

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
      document.body.classList.remove('is-auth');
      logReg.classList.remove('is-loggedin');
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

      // chuyển về trang chủ (hoặc trang cần quay lại)
      const redirectTo = localStorage.getItem('auth_redirect_to');
      if (redirectTo) {
        localStorage.removeItem('auth_redirect_to');
        window.location.href = redirectTo;
      } else {
        window.location.href = 'index.html';
      }
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

    // --- Pet Profile store helpers (v2) ---
    // Keep in this scope for PLP usage; a global helper is also defined near the bottom.

    const params = new URLSearchParams(location.search);
    const Store = window.PetProfileStore;
    const pet = Store ? Store.getActive() : null;
    const petEnabled = !!(pet && pet.personalization && pet.personalization.enabled);

    const explicitCat = params.has('cat') || params.has('species');
    const forcePet = params.get('pp') === '1';

    let cat = params.get('cat') || params.get('species') || 'dog';
    const need = params.get('need') || '';
    let q = (params.get('q') || '').trim();
    const sort = params.get('sort') || '';
    let stage = params.get('stage') || '';

    // Auto-apply Pet Profile when user didn't explicitly choose a category.
    // If user wants to force apply even with an explicit cat, use `pp=1`.
    const usingPet = petEnabled && (forcePet || !explicitCat);
    if (usingPet && pet) {
      if (pet.species) cat = pet.species;
      if (!stage && pet.stage) stage = pet.stage;
      if (!q && pet.note) q = pet.note;
    }

    // Pet Profile bar (PLP)
    (function initPetBar() {
      const bar = document.getElementById('petPersonalizationBar');
      if (!bar || !Store) return;

      const petNow = Store.getActive();
      if (!petNow) {
        bar.style.display = 'block';
        bar.innerHTML = `
          <div class="pet-bar__inner">
            <div>
              <strong>Gợi ý theo Pet Profile</strong>
              <div class="pet-bar__sub">Tạo hồ sơ để lọc theo loài, nhu cầu và nhắc size phụ kiện.</div>
            </div>
            <a class="btn-outline" href="pet-profile.html#start">Tạo hồ sơ</a>
          </div>
        `;
        return;
      }

      const enabled = !!petNow.personalization?.enabled;
      const sameSpecies = petNow.species === cat;

      const applyHref = (() => {
        const p = new URLSearchParams(location.search);
        p.set('pp', '1');
        p.set('cat', petNow.species);
        if (petNow.stage && !p.get('stage')) p.set('stage', petNow.stage);
        if (petNow.note && !p.get('q')) p.set('q', petNow.note);
        return 'products.html?' + p.toString();
      })();

      const needMap = {
        food: 'Thức ăn',
        health: 'Sức khỏe',
        hygiene: 'Vệ sinh',
        accessory: 'Phụ kiện',
        toy: 'Đồ chơi'
      };
      const stageMap = { puppy: 'Nhỏ tuổi', adult: 'Trưởng thành', senior: 'Cao tuổi' };
      const needLabel = need ? (needMap[need] || need) : '';
      const stageLabelText = stage ? (stageMap[stage] || stage) : '';
      const noteText = q || '';

      const detailParts = [
        needLabel ? `Nhu cầu: ${needLabel}` : '',
        stageLabelText ? `Giai đoạn: ${stageLabelText}` : '',
        noteText ? `Từ khóa: ${noteText}` : ''
      ].filter(Boolean);

      bar.style.display = 'block';
      bar.innerHTML = `
        <div class="pet-bar__inner">
          <div class="pet-bar__left">
            <div class="pet-bar__title">
              <span class="pet-badge">${petNow.name}</span>
              <strong>Cá nhân hóa theo Pet Profile${usingPet ? ' (đang áp dụng)' : ''}</strong>
            </div>
            <div class="pet-bar__sub">
              ${enabled ? 'Đang bật' : 'Đang tắt'} • ${petNow.species ? petNow.species.toUpperCase() : ''}${petNow.stage ? ' • ' + petNow.stage : ''}
              ${petNow.weightKg != null ? ' • ~' + petNow.weightKg + 'kg' : ''}
            </div>
            ${detailParts.length ? `<div class="pet-bar__note">${detailParts.join(' • ')}</div>` : ''}
          </div>
          <div class="pet-bar__right">
            <label class="pet-switch">
              <input type="checkbox" id="petBarToggle" ${enabled ? 'checked' : ''} />
              <span>Bật cá nhân hóa</span>
            </label>
            ${enabled && !usingPet ? `<a class="btn-outline" href="${applyHref}">Áp dụng theo bé</a>` : ''}
            <a class="btn-outline" href="pet-profile.html">Về Pet Profile</a>
            <a class="btn-outline" href="pet-profile.html#dashboard">Quản lý</a>
          </div>
        </div>
      `;

      const toggle = document.getElementById('petBarToggle');
      if (toggle) {
        toggle.addEventListener('change', () => {
          const current = Store.getActive();
          if (!current) return;
          current.personalization = current.personalization || {};
          current.personalization.enabled = !!toggle.checked;
          current.updatedAt = Date.now();
          Store.upsert(current);
          // re-render quickly
          initPetBar();
        });
      }
    })();
    
    // bản đồ tên danh mục
    const titleMap = {
      dog: 'Sản phẩm cho Chó',
      cat: 'Sản phẩm cho Mèo',
      bird: 'Sản phẩm cho Chim',
      rabbit: 'Sản phẩm cho Thỏ',
      hamster: 'Sản phẩm cho Thú nhỏ',
      fish: 'Sản phẩm cho Cá',
      reptile: 'Sản phẩm cho Bò sát'
    };

    // Catalog title removed; no update needed.

    grid.innerHTML = '<p style="padding:1rem">Đang tải...</p>';
    
    try {
        const res = await fetch('data/products.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('Không tải được dữ liệu sản phẩm');
        const data = await res.json();
      const listRaw = data[cat] || [];

        const moneyToNumber = (s) => parseInt(String(s || '').replace(/[^\d]/g, ''), 10) || 0;

      const normalize = (s) => String(s || '').toLowerCase();
      const joinText = (p) => normalize([p.tag, p.title, p.desc].filter(Boolean).join(' '));

      // map keyword sets for IA needs/topics (best-effort with existing dataset)
      const NEED_KEYWORDS = {
        food: ['thức ăn', 'dinh dưỡng', 'hạt', 'pate', 'snack', 'ăn vặt', 'sữa', 'súp', 'ciao', 'churu', 'cỏ mèo', 'timothy', 'alfalfa', 'hướng dương', 'kê', 'sâu'],
        health: ['sức khỏe', 'vitamin', 'canxi', 'tiêu hóa', 'tiết niệu', 've', 'rận', 'giun', 'khử khuẩn', 'bổ sung'],
        hygiene: ['vệ sinh', 'sữa tắm', 'khử mùi', 'tai', 'răng', 'cát', 'xẻng', 'tã', 'túi', 'lót', 'mùn cưa', 'xịt'],
        accessory: ['phụ kiện', 'vòng cổ', 'dây dắt', 'đai', 'áo', 'giày', 'bát', 'bình', 'chuồng', 'nệm', 'túi', 'balo', 'lồng', 'khay'],
        toy: ['đồ chơi', 'bóng', 'dây', 'cần câu', 'catnip', 'xích đu', 'gương', 'wheel', 'đường hầm', 'mài răng'],
        combo: ['combo', 'bộ', 'kit'],
        reorder: ['định kỳ', 'mua lại'],
        newbie: ['bộ', 'kit', 'cơ bản', 'lần đầu', 'checklist', 'setup']
      };

      let list = listRaw.map((p, idx) => ({ ...p, __idx: idx }));

      // filter by need (best-effort)
      if (need) {
        const keys = NEED_KEYWORDS[need] || [need];
        const filtered = list.filter(p => {
          const t = joinText(p);
          return keys.some(k => t.includes(normalize(k)));
        });
        // fallback: if no match, show full category list
        if (filtered.length) list = filtered;
      }

      // filter by free text
      if (q) {
        const qn = normalize(q);
        const beforeQ = list;
        const filteredQ = list.filter(p => joinText(p).includes(qn));
        // fallback: if no match, keep list from need/category
        if (filteredQ.length) {
          list = filteredQ;
        } else {
          list = beforeQ;
        }
      }

      // sort
      if (sort === 'best') {
        list.sort((a, b) => (parseFloat(b.rate || '0') - parseFloat(a.rate || '0')));
      } else if (sort === 'new') {
        list.sort((a, b) => (b.__idx - a.__idx));
      } else if (sort === 'sale') {
        const discount = (p) => {
          const price = moneyToNumber(p.price);
          const oldP = moneyToNumber(p.oldPrice);
          if (!oldP || !price) return 0;
          return Math.max(0, oldP - price);
        };
        list.sort((a, b) => discount(b) - discount(a));
      }

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
                  <a href="#" data-wishlist-toggle data-cat="${cat}" data-idx="${idx}" aria-label="Yêu thích">
                    <i class='bx ${(window.Wishlist && window.Wishlist.has(cat, idx)) ? 'bxs-heart' : 'bx-heart'}'></i>
                  </a>
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
          ? list.map((p) => card(p, p.__idx)).join('')
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

// *** hero quick search (index.html)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quickSearchForm');
  if (!form) return;
  const speciesEl = document.getElementById('qsSpecies');
  const needEl = document.getElementById('qsNeed');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cat = speciesEl?.value || 'dog';
    const need = needEl?.value || '';

    const params = new URLSearchParams();
    params.set('cat', cat);
    if (need) params.set('need', need);

    window.location.href = 'products.html?' + params.toString();
  });
});


let menu = document.querySelector('#menu-icon');
let navigation = document.querySelector('.navigation');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navigation.classList.toggle('active');
};

// *** Mega menu (Sản phẩm): tabs + toggle/close
document.addEventListener('DOMContentLoaded', () => {
  const megaHost = document.querySelector('[data-mega]');
  if (!megaHost) return;

  const trigger = megaHost.querySelector('.nav-mega-trigger');
  const menuEl  = megaHost.querySelector('.mega-menu');
  const tabs    = Array.from(megaHost.querySelectorAll('[data-mega-tab]'));
  const panels  = Array.from(megaHost.querySelectorAll('[data-mega-panel]'));

  const setExpanded = (open) => {
    if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const closeMega = () => {
    megaHost.classList.remove('mega-open');
    setExpanded(false);
  };

  const openMega = () => {
    megaHost.classList.add('mega-open');
    setExpanded(true);
  };

  // click trigger: toggle (hữu ích cho mobile/touch)
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      // nếu đang ở desktop và user muốn đi thẳng products.html: giữ ctrl/cmd click
      if (e.metaKey || e.ctrlKey) return;

      // trên mobile: ưu tiên mở menu trước
      e.preventDefault();
      if (megaHost.classList.contains('mega-open')) closeMega();
      else openMega();
    });
  }

  // tabs
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-mega-tab');
      tabs.forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      panels.forEach(p => p.classList.toggle('is-active', p.getAttribute('data-mega-panel') === key));
      openMega();
    });
  });

  // click outside để đóng
  document.addEventListener('click', (e) => {
    if (!megaHost.classList.contains('mega-open')) return;
    if (e.target.closest('[data-mega]')) return;
    closeMega();
  });

  // ESC để đóng
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMega();
  });

  // Tooltip khi text bị cắt (hiện "...")
  // Dùng native title để nhẹ và không phá layout
  if (menuEl) {
    menuEl.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a');
      if (!link || !menuEl.contains(link)) return;

      // chỉ set title khi text thật sự bị overflow
      const isOverflowing = link.scrollWidth > link.clientWidth + 1;
      if (isOverflowing) {
        const fullText = (link.textContent || '').trim();
        if (fullText) link.setAttribute('title', fullText);
      } else {
        // tránh tooltip thừa khi không bị cắt
        if (link.getAttribute('title') === (link.textContent || '').trim()) {
          link.removeAttribute('title');
        }
      }
    });
  }

  // nếu mở mobile menu thì giữ mega menu đóng để gọn
  if (menu && navigation) {
    menu.addEventListener('click', () => {
      if (!navigation.classList.contains('active')) closeMega();
    });
  }
});
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

        // --- Pet Profile fit (PDP) ---
        (function renderPetFit() {
          const box = document.getElementById('petFitBox');
          const badge = document.getElementById('petFitBadge');
          const why = document.getElementById('petFitWhy');
          const cta = document.getElementById('petFitCta');
          const Store = window.PetProfileStore;
          if (!box || !badge || !why || !Store) return;

          const pet = Store.getActive();
          if (!pet) {
            box.style.display = 'block';
            badge.textContent = 'Tạo Pet Profile để xem gợi ý phù hợp';
            why.textContent = 'Bạn sẽ thấy gợi ý theo loài/nhu cầu và nhắc size phụ kiện.';
            if (cta) cta.textContent = 'Tạo Pet Profile';
            return;
          }

          const enabled = !!pet.personalization?.enabled;
          if (!enabled) {
            box.style.display = 'block';
            badge.textContent = `Cá nhân hóa đang tắt cho ${pet.name}`;
            why.textContent = 'Bật lại trong Pet Profile để xem gợi ý phù hợp.';
            if (cta) cta.textContent = 'Bật cá nhân hóa';
            return;
          }

          const text = String([product.tag, product.title, product.desc].filter(Boolean).join(' ')).toLowerCase();
          const seemsAccessory = /(vòng cổ|dây dắt|đai|yếm|áo|giày|balo|túi|lồng|chuồng|nệm)/i.test(text);
          const sameSpecies = pet.species === cat;
          const hasWeight = pet.weightKg != null && !Number.isNaN(Number(pet.weightKg)) && Number(pet.weightKg) > 0;

          box.style.display = 'block';

          if (!sameSpecies) {
            badge.textContent = `Có thể không phù hợp với ${pet.name}`;
            why.textContent = `Sản phẩm thuộc danh mục ${cat.toUpperCase()}, nhưng bé là ${pet.species.toUpperCase()}.`;
            return;
          }

          if (seemsAccessory && !hasWeight) {
            badge.textContent = `Cần thêm cân nặng để gợi ý size cho ${pet.name}`;
            why.textContent = 'Sản phẩm có vẻ là phụ kiện; cân nặng/số đo giúp gợi ý size chính xác hơn.';
            return;
          }

          badge.textContent = `Phù hợp với ${pet.name}`;
          const reasons = [];
          reasons.push(`Cùng loài: ${pet.species.toUpperCase()}.`);
          if (pet.stage) reasons.push(`Giai đoạn: ${pet.stage}.`);
          if (pet.note) reasons.push(`Ghi chú: “${pet.note}”.`);
          if (seemsAccessory) reasons.push('Nhận diện phụ kiện: có thể cần xem size.');
          why.textContent = reasons.join(' ');
        })();

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

// --- Pet Profile Store (global) ---
// Used by pet-profile.html, products.html (PLP bar), and product-detail.html (PDP fit).
(function initPetProfileStore() {
  if (window.PetProfileStore) return;

  const PROFILES_KEY = 'petProfiles_v2';
  const ACTIVE_KEY = 'petActiveId_v2';
  const V1_KEY = 'petProfile_v1';

  function safeParse(json, fallback) {
    try {
      const v = JSON.parse(json);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function list() {
    return safeParse(localStorage.getItem(PROFILES_KEY), []);
  }

  function write(all) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(all || []));
  }

  function newId() {
    return 'pet_' + Date.now() + '_' + Math.random().toString(16).slice(2);
  }

  function getActive() {
    const all = list();
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (activeId) {
      const found = all.find(p => p && p.id === activeId);
      if (found) return found;
    }
    return all[0] || null;
  }

  function setActive(id) {
    if (!id) return;
    localStorage.setItem(ACTIVE_KEY, id);
  }

  function upsert(pet) {
    if (!pet || !pet.id) return;
    const all = list();
    const idx = all.findIndex(p => p && p.id === pet.id);
    if (idx >= 0) all[idx] = pet;
    else all.unshift(pet);
    write(all);
  }

  function remove(id) {
    const all = list().filter(p => p && p.id !== id);
    write(all);
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (activeId === id) {
      if (all[0]?.id) setActive(all[0].id);
      else localStorage.removeItem(ACTIVE_KEY);
    }
  }

  function migrateFromV1() {
    const all = list();
    if (all && all.length) return;

    const v1 = safeParse(localStorage.getItem(V1_KEY), null);
    if (!v1 || !v1.name || !v1.species) return;

    const pet = {
      id: newId(),
      name: String(v1.name || '').trim(),
      species: v1.species || 'dog',
      stage: v1.stage || 'adult',
      sex: 'unknown',
      weightKg: v1.weight ? Number(v1.weight) : null,
      breed: null,
      note: v1.note ? String(v1.note) : null,
      health: { digest: false, skin: false, urinary: false, overweight: false },
      personalization: { enabled: true },
      createdAt: v1.updatedAt || Date.now(),
      updatedAt: v1.updatedAt || Date.now()
    };
    upsert(pet);
    setActive(pet.id);
  }

  window.PetProfileStore = {
    list,
    getActive,
    setActive,
    upsert,
    remove,
    migrateFromV1,
    newId
  };
})();
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

// *** Account dropdown (Tài khoản)
document.addEventListener('DOMContentLoaded', () => {
  const host = document.querySelector('[data-dropdown]');
  if (!host) return;
  const trigger = host.querySelector('.nav-dropdown-trigger');

  const setExpanded = (open) => {
    if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  const close = () => {
    host.classList.remove('dropdown-open');
    setExpanded(false);
  };
  const open = () => {
    host.classList.add('dropdown-open');
    setExpanded(true);
  };

  if (trigger) {
    trigger.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      if (host.classList.contains('dropdown-open')) close();
      else open();
    });
  }

  document.addEventListener('click', (e) => {
    if (!host.classList.contains('dropdown-open')) return;
    if (e.target.closest('[data-dropdown]')) return;
    close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
});

// ===== SERVICE BOOKING TO CART =====
document.addEventListener('DOMContentLoaded', () => {
  // Xử lý khi bấm nút "Đặt Dịch Vụ" trong service cards
  document.body.addEventListener('click', (e) => {
    const bookBtn = e.target.closest('.service-book-btn');
    if (!bookBtn) return;
    
    e.preventDefault();
    
    // Lấy thông tin service từ card cha
    const serviceCard = bookBtn.closest('.service-card');
    if (!serviceCard) return;
    
    const normalizeServiceKey = (raw) => {
      if (!raw) return '';
      const s = String(raw).trim().toLowerCase();
      if (!s) return '';
      if (s.startsWith('sv-')) return s.slice(3);
      if (s === 'beauty') return 'grooming';
      return s;
    };

    const serviceKey = normalizeServiceKey(serviceCard.dataset.id || serviceCard.dataset.service);
    const targetUrl = `services.html?sv=${encodeURIComponent(serviceKey || '')}#booking`;

    // Kiểm tra đăng nhập trước (giữ hành vi bảo vệ như cũ)
    const user = localStorage.getItem('currentUser');
    if (!user) {
      if (confirm("Bạn cần đăng nhập để đặt dịch vụ.\nĐến trang đăng nhập ngay?")) {
        localStorage.setItem('auth_redirect_to', targetUrl);
        window.location.href = 'login.html';
      }
      return;
    }

    window.location.href = targetUrl;
  });
});