// promotions.js
// Trang Khuyến mãi: 10 sản phẩm ngẫu nhiên + countdown + lọc + sort + combo tiết kiệm

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('promoProductGrid');
    const empty = document.getElementById('promoEmpty');
    const comboGrid = document.getElementById('promoComboGrid');

    const $species = document.getElementById('promoSpecies');
    const $sort = document.getElementById('promoSort');
    const $shuffle = document.getElementById('promoShuffle');
    const $countdown = document.getElementById('promoCountdown');

    if (!grid) return;

    const DATA_URL = 'data/products.json';

    const moneyToNumber = (s) => parseInt(String(s || '').replace(/[^\d]/g, ''), 10) || 0;
    const numberToMoney = (n) => (n || 0).toLocaleString('vi-VN') + ' VND';

    const catLabel = (cat) => {
      switch (cat) {
        case 'dog': return 'Chó';
        case 'cat': return 'Mèo';
        case 'bird': return 'Chim';
        case 'hamster': return 'Thú nhỏ';
        case 'rabbit': return 'Thỏ';
        default: return cat;
      }
    };

    const sampleRandom = (arr, n) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.slice(0, n);
    };

    const state = {
      data: null,
      all: [], // [{ cat, idx, ...product }]
      selection: [],
      filter: {
        cat: 'all',
        sort: 'random',
      },
    };

    const PROMO_COUNT = 10;

    const getBaseList = () => {
      return state.filter.cat === 'all'
        ? state.all
        : state.all.filter(p => p.cat === state.filter.cat);
    };

    const productCard = (p) => {
      const heart = (window.Wishlist && window.Wishlist.has(p.cat, p.idx)) ? 'bxs-heart' : 'bx-heart';
      return `
        <div class="row"
          id="prod-${p.cat}-${p.idx}"
          data-id="prod-${p.cat}-${p.idx}"
          data-cat="${p.cat}"
          style="cursor:pointer;"
          onclick="if(!event.target.closest('a')) window.location.href='product-detail.html?cat=${p.cat}&id=${p.idx}'">

          <img src="${p.img}" alt="${p.alt || p.title}">

          <div class="icon">
            <a href="#" data-wishlist-toggle data-cat="${p.cat}" data-idx="${p.idx}" aria-label="Yêu thích">
              <i class='bx ${heart}'></i>
            </a>
          </div>

          <div class="hovr">
            <a href="#" aria-label="Thêm vào giỏ"><i class='bx bx-cart-alt'></i></a>
            <a href="#" aria-label="Xem nhanh"><i class='bx bx-low-vision'></i></a>
            <a href="#" aria-label="So sánh"><i class='bx bx-sync'></i></a>
          </div>

          <div class="btm-text">
            <p>${p.tag || catLabel(p.cat)}</p>
            <h5>${p.title}</h5>
            <div class="price">
              <div class="pri-1"><h6>${p.price} <span>${p.oldPrice || ''}</span></h6></div>
              <div class="rating"><a href="#"><i class='bx bxs-star'></i>${p.rate || ''}</a></div>
            </div>
          </div>
        </div>
      `;
    };

    async function loadData() {
      if (state.data) return state.data;
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('Không tải được data/products.json');
      state.data = await res.json();

      const all = [];
      Object.keys(state.data).forEach((cat) => {
        const list = state.data[cat] || [];
        list.forEach((p, idx) => all.push({ ...p, cat, idx }));
      });
      state.all = all;

      return state.data;
    }

    function pickSelection() {
      const base = getBaseList();
      state.selection = sampleRandom(base, Math.min(PROMO_COUNT, base.length));
    }

    function applySortInPlace() {
      if (!state.selection.length) return;

      if (state.filter.sort === 'price-asc') {
        state.selection.sort((a, b) => moneyToNumber(a.price) - moneyToNumber(b.price));
        return;
      }
      if (state.filter.sort === 'price-desc') {
        state.selection.sort((a, b) => moneyToNumber(b.price) - moneyToNumber(a.price));
        return;
      }

      state.selection = sampleRandom(state.selection, state.selection.length);
    }

    function renderSelection() {
      if (!state.selection.length) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
      }
      if (empty) empty.style.display = 'none';
      grid.innerHTML = state.selection.map(productCard).join('');
    }

    function initCountdown() {
      if (!$countdown) return;

      const KEY = 'promo_flash_end_v1';
      const now = Date.now();
      const saved = parseInt(localStorage.getItem(KEY) || '', 10);

      const endTs = (!saved || Number.isNaN(saved) || saved <= now)
        ? (now + 6 * 60 * 60 * 1000)
        : saved;

      localStorage.setItem(KEY, String(endTs));

      const fmt = (n) => String(n).padStart(2, '0');
      const tick = () => {
        const left = Math.max(0, endTs - Date.now());
        const totalSec = Math.floor(left / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;

        $countdown.textContent = `${fmt(h)}:${fmt(m)}:${fmt(s)}`;

        if (left <= 0) {
          clearInterval(timer);
          $countdown.textContent = '00:00:00';
        }
      };

      tick();
      const timer = setInterval(tick, 1000);
    }

    function buildCombos() {
      if (!comboGrid) return;

      const base = getBaseList();
      const combos = [];

      const used = new Set();
      const takeUnique = (arr, k) => {
        const picked = [];
        const shuffled = sampleRandom(arr, Math.min(arr.length, 60));
        for (const it of shuffled) {
          const key = `${it.cat}:${it.idx}`;
          if (used.has(key)) continue;
          picked.push(it);
          used.add(key);
          if (picked.length >= k) break;
        }
        return picked;
      };

      for (let i = 0; i < 3; i++) {
        const items = takeUnique(base, 3);
        if (items.length < 3) break;

        const before = items.reduce((s, p) => s + moneyToNumber(p.oldPrice || p.price), 0);
        const discountPct = 12 + i * 3;
        const after = Math.max(0, Math.round(before * (1 - discountPct / 100)));

        combos.push({
          id: `combo-${state.filter.cat}-${i}`,
          title: `Combo tiết kiệm ${i + 1}`,
          discountPct,
          before,
          after,
          items,
        });
      }

      if (!combos.length) {
        comboGrid.innerHTML = `<p class="note" style="margin-top:12px;">Chưa đủ sản phẩm để tạo combo.</p>`;
        return;
      }

      comboGrid.innerHTML = combos.map((c) => {
        const list = c.items.map((p) => {
          const alt = (p.alt || p.title || '').replace(/"/g, '&quot;');
          const title = (p.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return `
            <li>
              <a
                class="promo-combo-item"
                href="product-detail.html?cat=${p.cat}&id=${p.idx}"
                data-combo-img="${p.img}"
                data-combo-alt="${alt}"
              >${title}</a>
            </li>
          `;
        }).join('');
        const encoded = c.items.map(p => `${p.cat}:${p.idx}`).join(',');
        const first = c.items[0];
        const defaultImg = first?.img || '';
        const defaultAlt = (first?.alt || first?.title || 'Sản phẩm').replace(/"/g, '&quot;');

        return `
          <div class="card promo-combo-card" data-combo-id="${c.id}" data-items="${encoded}">
            <div class="promo-combo-head">
              <h3>${c.title}</h3>
              <span class="promo-badge">-${c.discountPct}%</span>
            </div>

            <div class="promo-combo-body">
              <div class="promo-combo-left">
                <ul class="promo-combo-list">${list}</ul>
              </div>

              <div class="promo-combo-preview" aria-hidden="true">
                <img src="${defaultImg}" alt="${defaultAlt}">
              </div>
            </div>

            <div class="promo-combo-footer">
              <div class="promo-combo-price">
                <div class="promo-combo-before">${numberToMoney(c.before)}</div>
                <div class="promo-combo-after">${numberToMoney(c.after)}</div>
              </div>

              <button class="btn" type="button" data-add-combo>Thêm combo vào giỏ</button>
            </div>
          </div>
        `;
      }).join('');

      const setPreview = (cardEl, img, alt) => {
        const imgEl = cardEl?.querySelector('.promo-combo-preview img');
        if (!imgEl || !img) return;
        imgEl.src = img;
        if (alt) imgEl.alt = alt;
      };

      comboGrid.querySelectorAll('.promo-combo-card').forEach((cardEl) => {
        const firstItem = cardEl.querySelector('.promo-combo-item');
        if (firstItem) {
          setPreview(cardEl, firstItem.getAttribute('data-combo-img'), firstItem.getAttribute('data-combo-alt'));
        }

        const onPick = (e) => {
          const item = e.target.closest('.promo-combo-item');
          if (!item || !cardEl.contains(item)) return;
          setPreview(cardEl, item.getAttribute('data-combo-img'), item.getAttribute('data-combo-alt'));
        };

        cardEl.addEventListener('mouseover', onPick);
        cardEl.addEventListener('focusin', onPick);
      });

      comboGrid.querySelectorAll('[data-add-combo]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();

          const user = localStorage.getItem('currentUser');
          if (!user) {
            if (confirm('Bạn cần đăng nhập để mua hàng.\nĐến trang đăng nhập ngay?')) {
              window.location.href = 'login.html';
            }
            return;
          }

          const cardEl = btn.closest('.promo-combo-card');
          const raw = cardEl?.getAttribute('data-items') || '';
          const pairs = raw.split(',').map(s => s.trim()).filter(Boolean);

          pairs.forEach((pair) => {
            const parts = pair.split(':');
            if (parts.length !== 2) return;
            const cat = parts[0];
            const idx = parseInt(parts[1], 10);
            const prod = state.all.find(p => p.cat === cat && p.idx === idx);
            if (!prod) return;

            if (typeof window.addToCart === 'function') {
              window.addToCart({
                id: `prod-${prod.cat}-${prod.idx}`,
                title: prod.title,
                price: prod.price,
                img: prod.img,
                type: catLabel(prod.cat),
                quantity: 1,
              });
            }
          });

          if (window.Cart && typeof window.Cart.open === 'function') window.Cart.open();
        });
      });
    }

    function bindUI() {
      if ($species) {
        $species.addEventListener('change', () => {
          state.filter.cat = $species.value;
          pickSelection();
          applySortInPlace();
          renderSelection();
          buildCombos();
        });
      }

      if ($sort) {
        $sort.addEventListener('change', () => {
          state.filter.sort = $sort.value;
          applySortInPlace();
          renderSelection();
        });
      }

      if ($shuffle) {
        $shuffle.addEventListener('click', () => {
          pickSelection();
          applySortInPlace();
          renderSelection();
          buildCombos();
        });
      }
    }

    (async () => {
      try {
        grid.innerHTML = `<p style="padding:1rem">Đang tải...</p>`;
        await loadData();

        initCountdown();
        bindUI();

        pickSelection();
        applySortInPlace();
        renderSelection();
        buildCombos();
      } catch (e) {
        grid.innerHTML = `<p style="padding:1rem;color:#b00020">Lỗi: ${e.message}</p>`;
      }
    })();
  });
})();