const kurdishNumerals = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩',
    '.': '.', ',': '،'
};

const kurdishMonths = [
    'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
    'تەمموز', 'ئاب', 'ئەیلول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'
];

function toKurdishNumerals(num) {
    return String(num).split('').map(char => kurdishNumerals[char] || char).join('');
}

function formatKurdishCurrency(amount) {
    return toKurdishNumerals(amount.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    })) + ' د.ع';
}

function formatKurdishDate(date) {
    const day = toKurdishNumerals(date.getDate());
    const month = kurdishMonths[date.getMonth()];
    const year = toKurdishNumerals(date.getFullYear());
    return `${day} ${month} ${year}`;
}

function formatKurdishTime(date) {
    const hours = toKurdishNumerals(date.getHours().toString().padStart(2, '0'));
    const minutes = toKurdishNumerals(date.getMinutes().toString().padStart(2, '0'));
    return `${hours}:${minutes}`;
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = formatKurdishTime(now);
    document.getElementById('currentDate').textContent = formatKurdishDate(now);
}

let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = [];
let currentReceipt = null;

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function renderCategories() {
    const categories = ['هەموو', ...new Set(products.map(p => p.category))];
    const filterDiv = document.querySelector('.category-filter');
    filterDiv.innerHTML = categories.map(cat => 
        `<button class="category-btn ${cat === 'هەموو' ? 'active' : ''}" data-category="${cat}">${cat}</button>`
    ).join('');
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(btn.dataset.category);
        });
    });
}

function renderProducts(category = 'هەموو') {
    const grid = document.getElementById('productsGrid');
    const filtered = category === 'هەموو' ? products : products.filter(p => p.category === category);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>هیچ بەرهەمێک نەدۆزرایەوە</p></div>';
        return;
    }
    
    grid.innerHTML = filtered.map(product => {
        const isLowStock = product.quantity < 10;
        const isOutOfStock = product.quantity === 0;
        const badgeClass = isOutOfStock ? 'badge-destructive' : isLowStock ? 'badge-secondary' : 'badge-outline';
        const stockText = isOutOfStock ? 'نەماوە' : `${toKurdishNumerals(product.quantity)} دانە`;
        
        return `
            <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-id="${product.id}" data-testid="card-product-${product.id}">
                <div class="product-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                </div>
                <div class="product-info">
                    <h3 class="product-name" data-testid="text-product-name-${product.id}">${product.name}</h3>
                    <p class="product-price" data-testid="text-product-price-${product.id}">${formatKurdishCurrency(product.price)}</p>
                </div>
                <div class="product-badges">
                    <span class="badge ${badgeClass}">${stockText}</span>
                    <span class="badge badge-outline">${product.category}</span>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.product-card:not(.out-of-stock)').forEach(card => {
        card.addEventListener('click', () => {
            const product = products.find(p => p.id === card.dataset.id);
            addToCart(product);
        });
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
        if (existingItem.quantity >= product.quantity) {
            showToast('هەڵە', 'بڕی کافی نییە', 'error');
            return;
        }
        existingItem.quantity++;
        existingItem.lineTotal = existingItem.quantity * existingItem.price;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            lineTotal: product.price
        });
    }
    
    playSound('add');
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const btnCheckout = document.getElementById('btnCheckout');
    const btnClearCart = document.getElementById('btnClearCart');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.2;"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                <p class="cart-empty-text">سەبەتە بەتاڵە</p>
                <p class="cart-empty-hint">بەرهەمێک هەڵبژێرە</p>
            </div>
        `;
        cartTotal.textContent = '٠ د.ع';
        btnCheckout.disabled = true;
        btnClearCart.style.display = 'none';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.lineTotal, 0);
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item" data-testid="cart-item-${item.productId}">
            <div class="cart-item-header">
                <h3 class="cart-item-name" data-testid="text-cart-item-name-${item.productId}">${item.name}</h3>
                <button class="btn-remove" onclick="removeFromCart(${index})" data-testid="button-remove-${item.productId}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
            </div>
            <div class="cart-item-details">
                <span class="cart-item-price">${formatKurdishCurrency(item.price)}</span>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)" ${item.quantity <= 1 ? 'disabled' : ''} data-testid="button-decrease-${item.productId}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                    </button>
                    <span class="quantity-value" data-testid="text-quantity-${item.productId}">${toKurdishNumerals(item.quantity)}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)" data-testid="button-increase-${item.productId}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                </div>
                <span class="cart-item-total" data-testid="text-line-total-${item.productId}">${formatKurdishCurrency(item.lineTotal)}</span>
            </div>
        </div>
    `).join('');
    
    cartTotal.textContent = formatKurdishCurrency(total);
    btnCheckout.disabled = false;
    btnClearCart.style.display = 'block';
}

function updateQuantity(index, delta) {
    const item = cart[index];
    const product = products.find(p => p.id === item.productId);
    const newQuantity = item.quantity + delta;
    
    if (newQuantity > product.quantity) {
        showToast('هەڵە', 'بڕی کافی نییە', 'error');
        playSound('error');
        return;
    }
    
    if (newQuantity <= 0) return;
    
    item.quantity = newQuantity;
    item.lineTotal = item.quantity * item.price;
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function clearCart() {
    cart = [];
    renderCart();
}

function openProductDialog() {
    document.getElementById('productDialog').style.display = 'flex';
    document.getElementById('productForm').reset();
    document.getElementById('productDialogTitle').textContent = 'زیادکردنی بەرهەمی نوێ';
}

function closeProductDialog() {
    document.getElementById('productDialog').style.display = 'none';
}

function saveProduct(e) {
    e.preventDefault();
    
    const product = {
        id: generateId(),
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        category: document.getElementById('productCategory').value
    };
    
    products.push(product);
    saveProducts();
    closeProductDialog();
    renderCategories();
    renderProducts();
    showToast('سەرکەوتوو', 'بەرهەم زیادکرا', 'success');
}

function openCheckoutDialog() {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + item.lineTotal, 0);
    document.getElementById('checkoutTotal').textContent = formatKurdishCurrency(total);
    document.getElementById('checkoutDialog').style.display = 'flex';
}

function closeCheckoutDialog() {
    document.getElementById('checkoutDialog').style.display = 'none';
}

function confirmCheckout() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const total = cart.reduce((sum, item) => sum + item.lineTotal, 0);
    const now = new Date();
    
    currentReceipt = {
        receiptNumber: generateId().substr(0, 8).toUpperCase(),
        items: [...cart],
        total: total,
        paymentMethod: paymentMethod,
        date: now
    };
    
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
            product.quantity -= cartItem.quantity;
        }
    });
    
    saveProducts();
    cart = [];
    
    closeCheckoutDialog();
    renderCart();
    renderProducts();
    playSound('success');
    showToast('سەرکەوتوو', 'فرۆشتن تەواو بوو', 'success');
    
    setTimeout(() => {
        openReceiptDialog();
    }, 300);
}

function openReceiptDialog() {
    if (!currentReceipt) return;
    
    const receiptContent = document.getElementById('receiptContent');
    receiptContent.innerHTML = `
        <div class="receipt-header">
            <h2 class="receipt-store-name">فرۆشگای کوردستان</h2>
            <p class="receipt-subtitle">وەسڵی فرۆشتن</p>
        </div>
        
        <div class="receipt-info">
            <div class="receipt-info-item">
                <span class="receipt-info-label">ژمارەی وەسڵ:</span>
                <span>${toKurdishNumerals(currentReceipt.receiptNumber)}</span>
            </div>
            <div class="receipt-info-item">
                <span class="receipt-info-label">بەروار:</span>
                <span>${formatKurdishDate(currentReceipt.date)}</span>
            </div>
            <div class="receipt-info-item">
                <span class="receipt-info-label">کات:</span>
                <span>${formatKurdishTime(currentReceipt.date)}</span>
            </div>
            <div class="receipt-info-item">
                <span class="receipt-info-label">شێوازی پارەدان:</span>
                <span>${currentReceipt.paymentMethod}</span>
            </div>
        </div>
        
        <h3 class="receipt-items-title">بەرهەمەکان</h3>
        
        <div class="receipt-items">
            ${currentReceipt.items.map((item, index) => `
                <div class="receipt-item">
                    <span class="receipt-item-name">${item.name}</span>
                    <span class="receipt-item-qty">${toKurdishNumerals(item.quantity)}</span>
                    <span class="receipt-item-price">${formatKurdishCurrency(item.price)}</span>
                    <span class="receipt-item-total">${formatKurdishCurrency(item.lineTotal)}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="receipt-total-section">
            <div class="receipt-total-row grand-total">
                <span>کۆی گشتی:</span>
                <span>${formatKurdishCurrency(currentReceipt.total)}</span>
            </div>
        </div>
        
        <div class="receipt-footer">
            <p>سوپاس بۆ کڕینەکەت!</p>
            <p>فرۆشگای کوردستان</p>
        </div>
    `;
    
    document.getElementById('receiptDialog').style.display = 'flex';
}

function closeReceiptDialog() {
    document.getElementById('receiptDialog').style.display = 'none';
}

function printReceipt() {
    window.print();
}

function downloadReceiptPDF() {
    if (!currentReceipt || !window.jspdf) {
        showToast('هەڵە', 'تکایە چاوەڕێ بکە', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('KURDISTAN SHOP', 105, 18, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Sales Receipt / Wasll', 105, 30, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt Number: ${currentReceipt.receiptNumber}`, 20, 52);
    doc.text(`Date: ${formatKurdishDate(currentReceipt.date)}`, 20, 60);
    doc.text(`Time: ${formatKurdishTime(currentReceipt.date)}`, 20, 68);
    doc.text(`Payment: ${currentReceipt.paymentMethod}`, 20, 76);
    
    doc.setLineWidth(0.5);
    doc.line(20, 83, 190, 83);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ITEMS', 20, 93);
    
    doc.setFontSize(10);
    doc.text('No.', 20, 103);
    doc.text('Item Name', 35, 103);
    doc.text('Qty', 100, 103);
    doc.text('Price', 125, 103);
    doc.text('Total', 165, 103);
    
    doc.setLineWidth(0.3);
    doc.line(20, 106, 190, 106);
    
    let yPos = 116;
    doc.setFont('helvetica', 'normal');
    currentReceipt.items.forEach((item, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.text(String(index + 1), 20, yPos);
        doc.text(item.name, 35, yPos);
        doc.text(String(item.quantity), 100, yPos);
        doc.text(item.price.toFixed(2), 125, yPos);
        doc.text(item.lineTotal.toFixed(2), 165, yPos);
        yPos += 10;
    });
    
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('GRAND TOTAL:', 20, yPos);
    doc.text(currentReceipt.total.toFixed(2) + ' IQD', 165, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your purchase!', 105, yPos, { align: 'center' });
    doc.text('Kurdistan Shop', 105, yPos + 7, { align: 'center' });
    
    doc.save(`receipt-${currentReceipt.receiptNumber}.pdf`);
    showToast('سەرکەوتوو', 'PDF داگیرا', 'success');
}

function newSale() {
    cart = [];
    renderCart();
    showToast('', 'فرۆشتنی نوێ دەستی پێکرد', 'success');
}

function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'add') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'error') {
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'success') {
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
}

function showToast(title, message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#fee2e2' : type === 'success' ? '#dcfce7' : '#fff'};
        border: 1px solid ${type === 'error' ? '#fca5a5' : type === 'success' ? '#86efac' : '#e5e5e5'};
        color: ${type === 'error' ? '#991b1b' : type === 'success' ? '#166534' : '#1a1a1a'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    toast.innerHTML = `
        ${title ? `<div style="font-weight: 700; margin-bottom: 0.25rem;">${title}</div>` : ''}
        <div>${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.getElementById('btnAddProduct').addEventListener('click', openProductDialog);
document.getElementById('btnCancelProduct').addEventListener('click', closeProductDialog);
document.getElementById('productForm').addEventListener('submit', saveProduct);

document.getElementById('btnCheckout').addEventListener('click', openCheckoutDialog);
document.getElementById('btnCancelCheckout').addEventListener('click', closeCheckoutDialog);
document.getElementById('btnConfirmCheckout').addEventListener('click', confirmCheckout);

document.getElementById('btnCloseReceipt').addEventListener('click', closeReceiptDialog);
document.getElementById('btnPrintReceipt').addEventListener('click', printReceipt);
document.getElementById('btnDownloadReceipt').addEventListener('click', downloadReceiptPDF);

document.getElementById('btnClearCart').addEventListener('click', clearCart);
document.getElementById('btnNewSale').addEventListener('click', newSale);
document.getElementById('btnViewReceipts').addEventListener('click', () => {
    if (currentReceipt) {
        openReceiptDialog();
    } else {
        showToast('', 'هیچ وەسڵێک نییە', 'error');
    }
});

document.getElementById('btnSettings').addEventListener('click', () => {
    showToast('ڕێکخستنەکان', 'بەزووانە لە داهاتوودا', 'success');
});

document.querySelectorAll('.dialog-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
        }
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

updateDateTime();
setInterval(updateDateTime, 1000);
renderCategories();
renderProducts();
renderCart();

if (products.length === 0) {
    const sampleProducts = [
        { id: generateId(), name: 'نان', price: 500, quantity: 50, category: 'خواردەمەنی' },
        { id: generateId(), name: 'شیر', price: 1000, quantity: 30, category: 'خواردنەوە' },
        { id: generateId(), name: 'کرێم', price: 2000, quantity: 15, category: 'پاکیژەیی' },
        { id: generateId(), name: 'قالێچە', price: 50000, quantity: 5, category: 'کەلووپەل' }
    ];
    
    products = sampleProducts;
    saveProducts();
    renderCategories();
    renderProducts();
}

console.log('سیستەمی کاشێری کوردی - ئامادەیە');
