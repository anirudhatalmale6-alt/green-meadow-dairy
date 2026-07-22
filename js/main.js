/* Green Meadow Dairy — demo store logic (vanilla JS, localStorage cart) */
(function () {
  "use strict";
  var CURRENCY = "₹"; // Rupee
  var KEY = "gmd_cart_v1";

  /* ---------- cart storage ---------- */
  function readCart() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function writeCart(c) { localStorage.setItem(KEY, JSON.stringify(c)); updateBadges(); }
  function cartCount(c) {
    c = c || readCart(); var n = 0;
    for (var k in c) n += c[k].qty;
    return n;
  }
  function cartTotal(c) {
    c = c || readCart(); var t = 0;
    for (var k in c) t += c[k].qty * c[k].price;
    return t;
  }
  function fmt(n) { return CURRENCY + n.toLocaleString("en-IN"); }

  function updateBadges() {
    var n = cartCount();
    document.querySelectorAll(".cart-count").forEach(function (el) {
      el.textContent = n;
      el.style.display = n > 0 ? "grid" : "none";
    });
  }

  /* ---------- add to cart ---------- */
  function addToCart(p) {
    var c = readCart();
    if (c[p.id]) c[p.id].qty += 1;
    else c[p.id] = { id: p.id, name: p.name, price: p.price, unit: p.unit, img: p.img, qty: 1 };
    writeCart(c);
    toast("Added “" + p.name + "” to cart");
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    addToCart({
      id: btn.getAttribute("data-id"),
      name: btn.getAttribute("data-name"),
      price: parseInt(btn.getAttribute("data-price"), 10),
      unit: btn.getAttribute("data-unit") || "",
      img: btn.getAttribute("data-img") || ""
    });
  });

  /* ---------- toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = "🛒 " + msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- cart page render ---------- */
  function renderCart() {
    var root = document.getElementById("cartRoot");
    if (!root) return;
    var c = readCart();
    var ids = Object.keys(c);
    if (!ids.length) {
      root.innerHTML =
        '<div class="cart-empty">' +
        '<div class="em">🥛</div>' +
        '<h2>Your cart is empty</h2>' +
        '<p class="muted">Add some farm-fresh dairy to get started.</p>' +
        '<a class="btn btn--primary" href="shop.html">Browse products</a>' +
        '</div>';
      return;
    }
    var rows = "";
    ids.forEach(function (id) {
      var it = c[id];
      rows +=
        '<div class="cart-row" data-row="' + id + '">' +
          '<img src="' + it.img + '" alt="' + it.name + '">' +
          '<div>' +
            '<h4>' + it.name + '</h4>' +
            '<div class="rp">' + fmt(it.price) + ' <span class="muted">' + (it.unit || "") + '</span></div>' +
            '<button class="rm" data-rm="' + id + '">Remove</button>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<div class="qty">' +
              '<button data-dec="' + id + '" aria-label="Decrease">−</button>' +
              '<span>' + it.qty + '</span>' +
              '<button data-inc="' + id + '" aria-label="Increase">+</button>' +
            '</div>' +
            '<div class="line-tot">' + fmt(it.price * it.qty) + '</div>' +
          '</div>' +
        '</div>';
    });
    var sub = cartTotal(c);
    var delivery = sub >= 500 || sub === 0 ? 0 : 40;
    root.innerHTML =
      '<div class="cart-wrap">' +
        '<div class="cart-list">' + rows + '</div>' +
        '<div class="summary">' +
          '<h3>Order summary</h3>' +
          '<div class="line"><span>Subtotal</span><span>' + fmt(sub) + '</span></div>' +
          '<div class="line"><span>Delivery</span><span>' + (delivery ? fmt(delivery) : "Free") + '</span></div>' +
          '<div class="line total"><span>Total</span><span>' + fmt(sub + delivery) + '</span></div>' +
          '<button class="btn btn--primary btn--block" id="checkoutBtn" style="margin-top:1rem">Checkout</button>' +
          '<p class="form-note" style="margin-top:.8rem">Free delivery on orders over ' + fmt(500) + '. This is a demo store &mdash; no real payment is taken.</p>' +
        '</div>' +
      '</div>';
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    var inc = t.getAttribute && t.getAttribute("data-inc");
    var dec = t.getAttribute && t.getAttribute("data-dec");
    var rm = t.getAttribute && t.getAttribute("data-rm");
    if (inc) { var c = readCart(); if (c[inc]) { c[inc].qty++; writeCart(c); renderCart(); } }
    else if (dec) { var d = readCart(); if (d[dec]) { d[dec].qty--; if (d[dec].qty <= 0) delete d[dec]; writeCart(d); renderCart(); } }
    else if (rm) { var r = readCart(); delete r[rm]; writeCart(r); renderCart(); }
    else if (t.id === "checkoutBtn") {
      var co = document.getElementById("checkoutSection");
      if (co) { co.style.display = "block"; co.scrollIntoView({ behavior: "smooth" }); }
    }
  });

  /* ---------- nav toggle ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    }, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* ---------- shop filters ---------- */
  var filterBar = document.querySelector(".filters");
  if (filterBar) {
    filterBar.addEventListener("click", function (e) {
      var b = e.target.closest(".filter");
      if (!b) return;
      filterBar.querySelectorAll(".filter").forEach(function (f) { f.classList.remove("active"); });
      b.classList.add("active");
      var cat = b.getAttribute("data-filter");
      document.querySelectorAll("[data-cat]").forEach(function (card) {
        var show = cat === "all" || card.getAttribute("data-cat") === cat;
        card.style.display = show ? "" : "none";
      });
    });
  }

  /* ---------- form validation ---------- */
  var form = document.querySelector("[data-validate]");
  if (form) {
    var emailRe = /^[a-zA-Z][^\s@]*@[^\s@]+\.[^\s@]+$/;
    var phoneRe = /^[\d\s()+-]{7,}$/;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="company_extra"]') && form.querySelector('[name="company_extra"]').value) return; // honeypot
      var ok = true;
      form.querySelectorAll("[data-required]").forEach(function (field) {
        var input = field.querySelector("input,textarea,select");
        var v = (input.value || "").trim();
        var bad = !v;
        if (input.type === "email" && v && !emailRe.test(v)) bad = true;
        if (input.getAttribute("data-phone") && v && !phoneRe.test(v)) bad = true;
        field.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) return;
      var okBox = form.querySelector(".form-ok");
      if (okBox) { okBox.style.display = "block"; okBox.scrollIntoView({ behavior: "smooth", block: "center" }); }
      form.reset();
      if (KEY && form.getAttribute("data-clears-cart")) { localStorage.removeItem(KEY); updateBadges(); }
    });
    form.querySelectorAll("[data-required] input,[data-required] textarea").forEach(function (i) {
      i.addEventListener("input", function () { i.closest(".field").classList.remove("invalid"); });
    });
  }

  /* ---------- footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  updateBadges();
  renderCart();
})();
