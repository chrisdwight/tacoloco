/*
    cart.js
    -------
    Client-side cart, checkout modal and simple order tracker.

    - Stores cart in `localStorage` under key `cart` (array of {name,qty,price}).
    - Stores most recent order under `lastOrder` for the tracker.
    - Intended for demo purposes only (no server integration).

    Notes for contributors:
    - Menu items in `menu.html` use `button.add-to-cart` with a `data-price` attribute.
    - This file exposes `window.cartUtils = { getCart, saveCart, addItemToCart, renderCart }` for debugging.
*/
document.addEventListener('DOMContentLoaded', function () {
    attachAddToCartListeners();
    bindCartModalControls();
    // If a static checkout page exists with an element 'cart-contents', render there as well
    if (document.getElementById('cart-contents')) {
        renderCart('cart-contents');
    }
    updateCartCount();
});

/* ------------------------------
   Storage helpers
   - getCart / saveCart
   ------------------------------ */

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/* ------------------------------
   UI helpers
   - updateCartCount, showTemporaryMessage,
   - formatCurrency, escapeHtml
   ------------------------------ */

function attachAddToCartListeners() {
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            const itemEl = btn.closest('.menu-item');
            const nameEl = itemEl ? itemEl.querySelector('h4') : null;
            const name = nameEl ? nameEl.textContent.trim() : 'Item';
            // get price from data-price attribute (button) or from .price text
            let price = 0;
            if (btn.dataset && btn.dataset.price) {
                price = parseFloat(btn.dataset.price) || 0;
            } else if (itemEl) {
                const p = itemEl.querySelector('.price');
                if (p) price = parseFloat(p.textContent.replace(/[^0-9\.]/g, '')) || 0;
            }
            addItemToCart(name, price);
        });
    });
}

function addItemToCart(name, price = 0) {
    const cart = getCart();
    const found = cart.find(i => i.name === name);
    if (found) {
        found.qty += 1;
    } else {
        cart.push({ name: name, qty: 1, price: parseFloat(price) || 0 });
    }
    saveCart(cart);
    showTemporaryMessage(`${name} added to cart`);
    updateCartCount();
}

function updateCartCount() {
    const countEls = document.querySelectorAll('.cart-count');
    const cart = getCart();
    const total = cart.reduce((s, it) => s + (it.qty || 0), 0);
    countEls.forEach(el => el.textContent = total);
}

function showTemporaryMessage(text) {
    // Small non-blocking feedback
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.style.position = 'fixed';
    msg.style.right = '20px';
    msg.style.bottom = '80px';
    msg.style.background = 'rgba(0,0,0,0.75)';
    msg.style.color = '#fff';
    msg.style.padding = '8px 12px';
    msg.style.borderRadius = '6px';
    msg.style.zIndex = 9999;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 1600);
}

/**
 * Render helpers (cart rendering and controls)
 * - renderCart: builds the cart UI into a given container
 */

/* Checkout page rendering and controls */
function renderCart(containerId = 'cart-contents') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const cart = getCart();
    container.innerHTML = '';
    if (!cart.length) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // header row
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['Item', 'Price', 'Qty', ''].forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        th.style.textAlign = 'left';
        th.style.padding = '8px';
        hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    cart.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';

        const tdName = document.createElement('td');
        tdName.textContent = item.name;
        tdName.style.padding = '8px';

        const tdUnit = document.createElement('td');
        tdUnit.textContent = formatCurrency(item.price || 0);
        tdUnit.style.padding = '8px';

        const tdQty = document.createElement('td');
        tdQty.style.padding = '8px';
        tdQty.style.textAlign = 'center';
        const minus = document.createElement('button');
        minus.textContent = '-';
        minus.style.marginRight = '6px';
        minus.addEventListener('click', () => changeQty(idx, -1, containerId));
        const qtySpan = document.createElement('span');
        qtySpan.textContent = item.qty;
        const plus = document.createElement('button');
        plus.textContent = '+';
        plus.style.marginLeft = '6px';
        plus.addEventListener('click', () => changeQty(idx, 1, containerId));
        tdQty.appendChild(minus);
        tdQty.appendChild(qtySpan);
        tdQty.appendChild(plus);

        const tdRemove = document.createElement('td');
        tdRemove.style.padding = '8px';
        tdRemove.style.textAlign = 'right';
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => removeItem(idx, containerId));
        tdRemove.appendChild(removeBtn);
        tr.appendChild(tdName);
        tr.appendChild(tdUnit);
        tr.appendChild(tdQty);
        tr.appendChild(tdRemove);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    // summary
    const subtotal = cart.reduce((s, it) => s + ((it.price || 0) * (it.qty || 0)), 0);
    const summary = document.createElement('div');
    summary.className = 'cart-summary';
    summary.style.marginTop = '12px';
    summary.innerHTML = `
        <div style="display:flex;justify-content:space-between;padding:6px 0;"><strong>Subtotal</strong><span>${formatCurrency(subtotal)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #eee;"><strong>Order Total</strong><span>${formatCurrency(subtotal)}</span></div>
    `;
    container.appendChild(summary);

    const actions = document.createElement('div');
    actions.style.marginTop = '16px';

    // add small order form for customer name & phone
    const form = document.createElement('div');
    form.className = 'cart-form';
    const labelName = document.createElement('label');
    labelName.textContent = 'Name for order';
    const inputName = document.createElement('input');
    inputName.id = 'order-name';
    inputName.placeholder = 'Full name';

    const labelPhone = document.createElement('label');
    labelPhone.textContent = 'Phone';
    const inputPhone = document.createElement('input');
    inputPhone.id = 'order-phone';
    inputPhone.placeholder = 'Phone number';

    // wrap labels + inputs for grid
    const nameWrap = document.createElement('div');
    nameWrap.appendChild(labelName);
    nameWrap.appendChild(inputName);
    const phoneWrap = document.createElement('div');
    phoneWrap.appendChild(labelPhone);
    phoneWrap.appendChild(inputPhone);
    form.appendChild(nameWrap);
    form.appendChild(phoneWrap);
    container.appendChild(form);

    const place = document.createElement('button');
    place.textContent = 'Place Order';
    place.style.padding = '10px 16px';
    place.style.background = '#FF5722';
    place.style.color = '#fff';
    place.style.border = 'none';
    place.style.borderRadius = '6px';
    place.addEventListener('click', () => placeOrder(containerId));
    actions.appendChild(place);
    container.appendChild(actions);
}

function changeQty(index, delta, containerId = 'cart-contents') {
    const cart = getCart();
    if (!cart[index]) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveCart(cart);
    renderCart(containerId);
    updateCartCount();
}

function removeItem(index, containerId = 'cart-contents') {
    const cart = getCart();
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart(cart);
    renderCart(containerId);
    updateCartCount();
}

/* ------------------------------
    Orders & Tracker
    - placeOrder, renderTracker, watcher
    ------------------------------ */

function placeOrder(containerId = 'cart-contents') {
    // Read name & phone if present
    const nameEl = document.getElementById('order-name');
    const phoneEl = document.getElementById('order-phone');
    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';

    // Minimal placeholder behaviour — in a real site you'd send this to a server
    const cart = getCart();
    const placedAt = new Date();
    // create ETA (default: 20 minutes from now)
    const eta = new Date(placedAt.getTime() + 20 * 60 * 1000);
    const order = {
        id: 'order-' + Date.now(),
        customer: { name, phone },
        items: cart,
        placedAt: placedAt.toISOString(),
        eta: eta.toISOString(),
        status: 'received'
    };
    // Save lastOrder locally
    localStorage.setItem('lastOrder', JSON.stringify(order));

    // clear cart and refresh count
    localStorage.removeItem('cart');
    updateCartCount();

    // show a brief confirmation inside the container, then open tracker
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = `<p>Thank you${name ? ', ' + escapeHtml(name) : ''}! Your order has been placed.</p>`;
    // open tracker after a short delay
    setTimeout(() => {
        openTrackerModal();
    }, 900);
}

/* Order tracker rendering and watcher */
function openTrackerModal(){
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    renderTracker('cart-contents-modal');
}

function renderTracker(containerId = 'cart-contents-modal'){
    const container = document.getElementById(containerId);
    if (!container) return;
    const raw = localStorage.getItem('lastOrder');
    if(!raw){ container.innerHTML = '<p>No recent order found.</p>'; return; }
    const order = JSON.parse(raw);
    container.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'order-tracker';
    const etaEl = document.createElement('div');
    etaEl.className = 'eta';
    etaEl.id = 'tracker-eta';
    title.appendChild(etaEl);

    const stepsWrap = document.createElement('div');
    stepsWrap.className = 'tracker-steps';
    const steps = ['Received','Preparing','Ready for Pickup','Completed'];
    steps.forEach(s => {
        const step = document.createElement('div');
        step.className = 'tracker-step';
        step.dataset.step = s;
        const lbl = document.createElement('div'); lbl.className = 'label'; lbl.textContent = s;
        const time = document.createElement('div'); time.className = 'time'; time.textContent = '';
        step.appendChild(lbl);
        step.appendChild(time);
        stepsWrap.appendChild(step);
    });

    container.appendChild(title);
    container.appendChild(stepsWrap);

    // summary + close
    const info = document.createElement('div');
    info.style.marginTop = '10px';
    info.innerHTML = `<div><strong>Order ID:</strong> ${order.id}</div>`;
    container.appendChild(info);

    // start watcher to update countdown and progress
    startOrderWatcher();
}

function computeOrderStatus(order){
    const now = Date.now();
    const placed = new Date(order.placedAt).getTime();
    const eta = new Date(order.eta).getTime();
    if(now < placed + 60*1000) return 'received'; // first minute: received
    if(now < eta) return 'preparing';
    if(now >= eta && now < eta + 30*60*1000) return 'ready'; // 30 min pickup window
    return 'completed';
}

function startOrderWatcher(){
    // clear existing
    stopOrderWatcher();
    function update(){
        const raw = localStorage.getItem('lastOrder');
        if(!raw) return;
        const order = JSON.parse(raw);
        const now = Date.now();
        const eta = new Date(order.eta).getTime();

        // update ETA text/countdown
        const etaEl = document.getElementById('tracker-eta');
        if(etaEl){
            const diff = eta - now;
            if(diff > 0){
                const mins = Math.floor(diff/60000);
                const secs = Math.floor((diff%60000)/1000);
                etaEl.textContent = `Estimated pickup: ${formatCurrencyTime(eta)} (in ${mins}m ${secs}s)`;
            } else {
                etaEl.textContent = `Estimated pickup: ${formatCurrencyTime(eta)} (ready)`;
            }
        }

        // update steps
        const steps = document.querySelectorAll('.tracker-step');
        const status = computeOrderStatus(order);
        steps.forEach(step => {
            step.classList.remove('active','completed');
            const s = step.dataset.step.toLowerCase().replace(/ /g,'');
            if(status === 'received'){
                if(s === 'received') step.classList.add('active');
            } else if(status === 'preparing'){
                if(s === 'received') step.classList.add('completed');
                if(s === 'preparing') step.classList.add('active');
            } else if(status === 'ready'){
                if(s === 'received' || s === 'preparing') step.classList.add('completed');
                if(s === 'readyforpickup') step.classList.add('active');
            } else if(status === 'completed'){
                step.classList.add('completed');
            }
        });
    }
    // run immediately and then every 2 seconds
    update();
    window._orderWatcherInterval = setInterval(update, 2000);
}

function stopOrderWatcher(){
    if(window._orderWatcherInterval){
        clearInterval(window._orderWatcherInterval);
        window._orderWatcherInterval = null;
    }
}

function formatCurrencyTime(isoOrMs){
    const d = new Date(isoOrMs);
    return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function escapeHtml(str){
    if(!str) return '';
    return str.replace(/[&<>"'`]/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;",'`':'&#96;'})[m]; });
}

function formatCurrency(n){
    return '$' + (Number(n) || 0).toFixed(2);
}

/* ------------------------------
   Modal controls & initialization
   ------------------------------ */

/* Modal controls */
function bindCartModalControls() {
    const open = document.getElementById('open-cart');
    const openTracker = document.getElementById('open-tracker');
    const close = document.getElementById('close-cart');
    const modal = document.getElementById('cart-modal');
    if (open) {
        open.addEventListener('click', function (e) {
            e.preventDefault();
            openCartModal();
        });
    }
    if (openTracker) {
        openTracker.addEventListener('click', function(e){ e.preventDefault(); openTrackerModal(); });
    }
    if (close) {
        close.addEventListener('click', closeCartModal);
    }
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeCartModal();
        });
    }
}

function openCartModal() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    renderCart('cart-contents-modal');
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    modal.style.display = 'none';
    // stop running watcher when modal is closed
    stopOrderWatcher();
}

// expose for console if needed
window.cartUtils = { getCart, saveCart, addItemToCart, renderCart };
