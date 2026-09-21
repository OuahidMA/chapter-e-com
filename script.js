const LANG_LABELS = { en: 'ENGLISH', fr: 'FRANÇAIS', es: 'ESPAÑOL' };
const CART_KEY = 'chapter_cart';
let BOOKS = [];

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
}

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) state.cart = JSON.parse(saved);
  } catch (e) {
    state.cart = [];
  }
}

const state = {
  currentPage: 'home',
  cart: [],
  selectedBookId: null,
  filters: { languages: [] }
};

function getBook(id) {
  return BOOKS.find(b => b.id === id);
}

function render() {
  renderCurationBands();
  renderPLP();
  renderCart();
  if (state.selectedBookId) renderPDP(state.selectedBookId);
}

function renderCurationBands() {
  const container = document.getElementById('curationBands');
  const sections = [
    { lang: 'fr', label: 'EDITIONS EN FRANÇAIS' },
    { lang: 'es', label: 'SPANISH FICTION' },
    { lang: 'en', label: 'ENGLISH ANTHOLOGIES' }
  ];
  let html = '';
  sections.forEach(s => {
    const books = BOOKS.filter(b => b.language === s.lang);
    if (books.length === 0) {
      html += `
        <div class="mb-24 last:mb-0">
          <div class="flex items-center gap-6 mb-12">
            <span class="font-syncopate text-xs tracking-[0.3em] text-[#8c8c8c]">${s.label}</span>
            <div class="flex-1 h-px bg-[#3c3c3c]"></div>
            <div class="m-stripe flex-1 max-w-[80px]" style="height:3px"></div>
          </div>
          <p class="text-[#5c5c5c] font-light text-sm">No books added yet.</p>
        </div>
      `;
      return;
    }
    html += `
      <div class="mb-24 last:mb-0">
        <div class="flex items-center gap-6 mb-12">
          <span class="font-syncopate text-xs tracking-[0.3em] text-[#8c8c8c]">${s.label}</span>
          <div class="flex-1 h-px bg-[#3c3c3c]"></div>
          <div class="m-stripe flex-1 max-w-[80px]" style="height:3px"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          ${books.map(book => renderBookCard(book)).join('')}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
  container.querySelectorAll('.book-card').forEach(el => {
    el.addEventListener('click', () => selectBook(el.dataset.bookId));
  });
}

function renderBookCard(book) {
  const langLabel = LANG_LABELS[book.language];
  return `
    <div class="book-card cursor-pointer" data-book-id="${book.id}">
      <div class="overflow-hidden bg-[#0c0c0c] mb-4" style="border-radius:0">
        <img src="${book.cover}" alt="${book.title}" class="book-card-img" loading="lazy">
      </div>
      <div class="flex items-center gap-2 mb-2">
        <span class="lang-dot ${book.language}"></span>
        <span class="font-syncopate text-[10px] tracking-[0.2em] text-[#8c8c8c]">${langLabel}</span>
      </div>
      <h3 class="font-syncopate text-sm font-bold tracking-[0.05em] text-[#ffffff] mb-1">${book.title}</h3>
      <p class="text-xs font-light text-[#8c8c8c]">${book.author}</p>
    </div>
  `;
}

function renderPLP() {
  const filterContainer = document.getElementById('langFilters');
  const langs = [
    { code: 'fr', label: 'FRANÇAIS' },
    { code: 'es', label: 'ESPAÑOL' },
    { code: 'en', label: 'ENGLISH' }
  ];
  filterContainer.innerHTML = langs.map(l => `
    <div class="flex items-center gap-3">
      <input type="checkbox" id="flt-${l.code}" value="${l.code}" ${state.filters.languages.includes(l.code) ? 'checked' : ''} onchange="toggleLangFilter('${l.code}')" class="filter-checkbox appearance-none w-4 h-4 border border-[#3c3c3c] bg-transparent checked:bg-[#ffffff] checked:border-[#ffffff] cursor-pointer" style="border-radius:0">
      <label for="flt-${l.code}" class="text-xs font-syncopate tracking-[0.15em] text-[#8c8c8c] cursor-pointer select-none">${l.label}</label>
    </div>
  `).join('');

  const grid = document.getElementById('plpGrid');
  let filtered = [...BOOKS];
  if (state.filters.languages.length > 0) {
    filtered = filtered.filter(b => state.filters.languages.includes(b.language));
  }
  if (state.filters.search) {
    const q = state.filters.search.toLowerCase();
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center text-[#5c5c5c] font-light py-20 text-sm">No editions match your criteria</div>`;
    return;
  }
  grid.innerHTML = filtered.map(book => renderBookCard(book)).join('');
  grid.querySelectorAll('.book-card').forEach(el => {
    el.addEventListener('click', () => selectBook(el.dataset.bookId));
  });
}

function renderPDP(bookId) {
  const book = getBook(bookId);
  if (!book) return;
  state.selectedBookId = bookId;
  const langLabel = LANG_LABELS[book.language];

  document.getElementById('pdpCover').src = book.cover;
  document.getElementById('pdpCover').alt = book.title;

  document.getElementById('pdpLangIndicator').innerHTML = `
    <span class="inline-flex items-center gap-2 px-3 py-1 border border-[#3c3c3c] font-syncopate text-[10px] tracking-[0.2em] text-[#8c8c8c]" style="border-radius:0">
      <span class="lang-dot ${book.language}"></span>
      ${langLabel} EDITION
    </span>
  `;

  document.getElementById('pdpTitle').textContent = book.title;
  document.getElementById('pdpAuthor').textContent = book.author;
  document.getElementById('pdpDescription').textContent = book.description;
  document.getElementById('pdpPrice').textContent = book.price.toFixed(2) + ' MAD';

  const specs = [
    { label: 'AUTHOR', value: book.author },
    { label: 'LANGUAGE', value: langLabel },
    { label: 'ISBN-13', value: book.isbn },
    { label: 'PAGE COUNT', value: book.pages + ' pages' },
  ];
  document.getElementById('pdpSpecs').innerHTML = specs.map(s => `
    <tr>
      <td class="font-syncopate text-[10px] tracking-[0.2em] text-[#8c8c8c] w-1/3 py-4">${s.label}</td>
      <td class="font-light text-sm text-[#ffffff] py-4">${s.value}</td>
    </tr>
  `).join('');
}

function renderCart() {
  const countEl = document.getElementById('cartCount');
  if (!countEl) return;
  countEl.textContent = state.cart.reduce((s, i) => s + i.qty, 0);
}

function navigateTo(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'home') {
    animateHero();
  }
  render();
}

function selectBook(bookId) {
  state.selectedBookId = bookId;
  navigateTo('pdp');
}

function toggleCart() {
  window.location.href = 'cart.html';
}

function addToCart(bookId) {
  const existing = state.cart.find(item => item.bookId === bookId);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ bookId, qty: 1 });
  }
  saveCart();
  renderCart();
  gsap.fromTo('#cartCount', { scale: 1.5 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
}

function addToCartFromPDP() {
  if (state.selectedBookId) {
    addToCart(state.selectedBookId);
  }
}

function toggleLangFilter(code) {
  const idx = state.filters.languages.indexOf(code);
  if (idx > -1) {
    state.filters.languages.splice(idx, 1);
  } else {
    state.filters.languages.push(code);
  }
  renderPLP();
}

function clearFilters() {
  state.filters.languages = [];
  state.filters.search = '';
  document.getElementById('globalSearch').value = '';
  renderPLP();
}

function animateHero() {
  const tl = gsap.timeline();
  tl.fromTo('#heroImg', { opacity: 0, scale: 1.05 }, { opacity: 0.6, scale: 1, duration: 1.2, ease: 'power2.out' })
    .fromTo('.hero-line', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, '-=0.6');
}

function initAnimations() {
  document.addEventListener('mouseover', function(e) {
    const card = e.target.closest('.book-card');
    if (card) {
      const img = card.querySelector('img');
      if (img) gsap.to(img, { scale: 1.05, duration: 0.4, ease: 'power2.out' });
    }
  });
  document.addEventListener('mouseout', function(e) {
    const card = e.target.closest('.book-card');
    if (card) {
      const img = card.querySelector('img');
      if (img) gsap.to(img, { scale: 1, duration: 0.4, ease: 'power2.out' });
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  loadCart();
  fetch('books.json')
    .then(res => res.json())
    .then(data => {
      BOOKS = data;
      render();
      initAnimations();
      animateHero();
    })
    .catch(() => {
      render();
      initAnimations();
      animateHero();
    });
});