const LANG_LABELS = { en: 'ENGLISH', fr: 'FRANÇAIS', es: 'ESPAÑOL' };
const CART_KEY = 'chapter_cart';
let BOOKS = [];

function getCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCartPage() {
  const cart = getCart();
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartCount');

  const combined = [];
  cart.forEach(entry => {
    const book = BOOKS.find(b => b.id === entry.bookId);
    if (!book) return;
    const existing = combined.find(i => i.book.id === book.id);
    if (existing) {
      existing.qty += entry.qty;
    } else {
      combined.push({ book, qty: entry.qty });
    }
  });

  const totalQty = combined.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = totalQty;

  if (combined.length === 0) {
    container.innerHTML = `
      <div class="text-[#5c5c5c] font-light text-sm py-20 text-center border border-[#3c3c3c]" style="border-radius:0">
        YOUR CART IS EMPTY
      </div>
    `;
    totalEl.textContent = '0.00 MAD';
    return;
  }

  let total = 0;
  container.innerHTML = combined.map(item => {
    const { book, qty } = item;
    const langLabel = LANG_LABELS[book.language];
    const lineTotal = book.price * qty;
    total += lineTotal;
    return `
      <div class="flex gap-6 pb-8 mb-8 border-b border-[#3c3c3c]">
        <div class="w-24 shrink-0 bg-[#0c0c0c] overflow-hidden" style="border-radius:0">
          <img src="${book.cover}" alt="${book.title}" class="w-full aspect-[2/3] object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <span class="lang-dot ${book.language}"></span>
            <span class="font-syncopate text-[10px] tracking-[0.2em] text-[#8c8c8c]">${langLabel}</span>
          </div>
          <h4 class="font-syncopate text-sm font-bold tracking-[0.05em] mb-1">${book.title}</h4>
          <p class="text-xs font-light text-[#8c8c8c] mb-4">${book.author}</p>
          <div class="flex flex-wrap items-center gap-6">
            <span class="font-syncopate text-sm tracking-wider">${book.price.toFixed(2)} MAD</span>
            <div class="flex items-center border border-[#3c3c3c]" style="border-radius:0">
              <button onclick="changeQty('${book.id}', -1)" class="bg-transparent border-0 px-3 py-1.5 text-[#8c8c8c] hover:text-[#ffffff] cursor-pointer transition-colors font-syncopate">−</button>
              <span id="qty-${book.id}" class="px-4 py-1.5 text-sm font-light text-center min-w-[40px] border-x border-[#3c3c3c]">${qty}</span>
              <button onclick="changeQty('${book.id}', 1)" class="bg-transparent border-0 px-3 py-1.5 text-[#8c8c8c] hover:text-[#ffffff] cursor-pointer transition-colors font-syncopate">+</button>
            </div>
            <span class="font-syncopate text-sm font-bold tracking-wider ml-auto">${lineTotal.toFixed(2)} MAD</span>
          </div>
        </div>
        <button onclick="removeItem('${book.id}')" class="self-start bg-transparent border-0 text-[#5c5c5c] hover:text-[#e22718] cursor-pointer transition-colors font-syncopate text-[10px] tracking-[0.2em]">REMOVE</button>
      </div>
    `;
  }).join('');

  totalEl.textContent = total.toFixed(2) + ' MAD';
}

function changeQty(bookId, delta) {
  let cart = getCart();
  const entry = cart.find(i => i.bookId === bookId);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) {
    cart = cart.filter(i => i.bookId !== bookId);
  }
  saveCart(cart);
  renderCartPage();
}

function removeItem(bookId) {
  let cart = getCart();
  cart = cart.filter(i => i.bookId !== bookId);
  saveCart(cart);
  renderCartPage();
}

document.addEventListener('DOMContentLoaded', function() {
  fetch('books.json')
    .then(res => res.json())
    .then(data => {
      BOOKS = data;
      renderCartPage();
    })
    .catch(() => {
      renderCartPage();
    });
});