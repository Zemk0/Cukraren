/* ==========================================
   MAIN JAVASCRIPT - CUKRÁREŇ JANKA
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    initMobileMenu();
    initSmoothScroll();
    // Load home page products if on home page
    if (document.getElementById('home-products')) {
        loadHomeProducts();
    }
    
    // Load home page news if on home page
    if (document.getElementById('home-news')) {
        loadHomeNews();
    }

    loadHero();
    loadFeatured();
    loadAbout();

});

/* ==========================================
   MOBILE MENU
   ========================================== */

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuToggle || !navMenu) {
        console.error('Menu elements not found');
        return;
    }
    
    // Toggle menu on button click
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        console.log('Menu toggled:', navMenu.classList.contains('active'));
    });
    
    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            console.log('Menu closed via link click');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            console.log('Menu closed via outside click');
        }
    });
    
    // Close menu on ESC key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            console.log('Menu closed via ESC key');
        }
    });
}

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

//   LOAD HOME PRODUCTS (ASYNC)


async function loadHomeProducts() {
    const container = document.getElementById('home-products');
    if (!container) return;
    
    
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Načítavam produkty...</p>';
    
    try {

        const products = await DataService.getProducts();
        
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

//   LOAD HOME NEWS

async function loadHomeNews() {
    const container = document.getElementById('home-news');
    if (!container) return;
    

    container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Načítavam novinky...</p>';
    
    try {
        
        const news = await DataService.getNews();
        
        
        const recentNews = news.slice(0, 3);
        
        if (recentNews.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Zatiaľ žiadne novinky.</p>';
            return;
        }
        
        container.innerHTML = recentNews.map(item => `
            <div class="news-card">
                <div class="news-image">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/images/galeria/placeholder.png'">
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

//   LOAD HERO
async function loadHero() {
    const hero = document.getElementById('hero-section');
    if (!hero) return;

    try {
        const res = await fetch('data/hero.json');
        const data = await res.json();

        hero.innerHTML = `
            <div class="hero-content">
                <div class="hero-image">
                    <img src="${data.image}" alt="${data.imageAlt}">
                    <div class="hero-overlay">
                        <h2 class="hero-title">${data.title}</h2>
                        <p class="hero-subtitle">${data.subtitle}</p>
                        <a href="${data.buttonLink}" class="btn-hero">
                            ${data.buttonText}
                        </a>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error('Hero load failed', err);
    }
}
//   LOAD FREATURED

async function loadFeatured() {
    const container = document.getElementById('featured-section');
    if (!container) return;

    try {
        const res = await fetch('data/featured.json');
        const data = await res.json();

        container.innerHTML = data.map(item => `
            <div class="featured-card">
                <div class="featured-image">
                    <img src="${item.image}" alt="${item.alt}">
                </div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        `).join('');
    } catch (err) {
        console.error('Featured load failed', err);
    }
}
//   LOAD ABOUT
async function loadAbout() {
    const container = document.getElementById('about-section');
    if (!container) return;

    try {
        const res = await fetch('data/about.json');
        const data = await res.json();

        container.innerHTML = `
            <div class="about-content">
                <div class="about-text">
                    <h2 class="section-title">${data.title}</h2>
                    ${data.paragraphs.map(p => `<p>${p}</p>`).join('')}
                    <a href="${data.buttonLink}" class="btn-primary">
                        ${data.buttonText}
                    </a>
                </div>
                <div class="about-image">
                    <img src="${data.image}" alt="${data.imageAlt}">
                </div>
            </div>
        `;
    } catch (err) {
        console.error('About load failed', err);
    }
}


/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('sk-SK', options);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}