/* ==========================================
   PRODUCTS PAGE - FILTERING
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    loadAllProducts();
    initProductFilter();
});

async function loadAllProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium); grid-column: 1/-1;">Načítavam produkty...</p>';
    
    try {
        const products = await DataService.getProducts();
        
        if (products.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium); grid-column: 1/-1;">Zatiaľ žiadne produkty.</p>';
            return;
        }
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium); grid-column: 1/-1;">Chyba pri načítaní produktov.</p>';
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    container.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/images/produkty/placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price}</div>
            </div>
        </div>
    `).join('');
}

function initProductFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', async function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            const category = this.getAttribute('data-category');
            await filterProducts(category);
        });
    });
}

async function filterProducts(category) {
    const products = await DataService.getProducts();
    
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }
}