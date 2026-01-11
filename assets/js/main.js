/* ==========================================
   MAIN JAVASCRIPT - CUKRÁREŇ JANKA
   ========================================== */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all components
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
    
    // Load home page products if on home page
    if (document.getElementById('home-products')) {
        loadHomeProducts();
    }
    
    // Load home page news if on home page
    if (document.getElementById('home-news')) {
        loadHomeNews();
    }
});

/* ==========================================
   MOBILE MENU
   ========================================== */

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuToggle || !navMenu) return;
    
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!menuToggle.contains(event.target) && !navMenu.contains(event.target)) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ==========================================
   SMOOTH SCROLL
   ========================================== */

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ==========================================
   CONTACT FORM
   ========================================== */

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };
        
        // Validate
        if (!formData.name || !formData.email || !formData.message) {
            showFormMessage('Prosím vyplňte všetky povinné polia.', 'error');
            return;
        }
        
        // Simulate form submission (in production, send to backend)
        setTimeout(() => {
            showFormMessage('Ďakujeme za vašu správu! Ozveme sa vám čoskoro.', 'success');
            contactForm.reset();
        }, 500);
    });
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('form-message');
    if (!formMessage) return;
    
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

/* ==========================================
   LOAD HOME PRODUCTS (ASYNC)
   ========================================== */

async function loadHomeProducts() {
    const container = document.getElementById('home-products');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Načítavam produkty...</p>';
    
    try {
        // Fetch products from data source
        const products = await DataService.getProducts();
        
        // Show only first 6 products on home page
        const featuredProducts = products.slice(0, 6);
        
        if (featuredProducts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Zatiaľ žiadne produkty.</p>';
            return;
        }
        
        container.innerHTML = featuredProducts.map(product => `
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
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Chyba pri načítaní produktov.</p>';
    }
}

/* ==========================================
   LOAD HOME NEWS (ASYNC)
   ========================================== */

async function loadHomeNews() {
    const container = document.getElementById('home-news');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Načítavam novinky...</p>';
    
    try {
        // Fetch news from data source
        const news = await DataService.getNews();
        
        // Show only first 3 news on home page
        const recentNews = news.slice(0, 3);
        
        if (recentNews.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Zatiaľ žiadne novinky.</p>';
            return;
        }
        
        container.innerHTML = recentNews.map(item => `
            <div class="news-card">
                <div class="news-image">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/images/galeria/placeholder.jpg'">
                </div>
                <div class="news-content">
                    <div class="news-date">${formatDate(item.date)}</div>
                    <h3 class="news-title">${item.title}</h3>
                    <p class="news-excerpt">${item.excerpt}</p>
                    <a href="novinky.html" class="news-link">Čítať viac →</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Chyba pri načítaní noviniek.</p>';
    }
}

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */

// Format date to Slovak format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('sk-SK', options);
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Generate unique ID
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}