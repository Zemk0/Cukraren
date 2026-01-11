/* ==========================================
   GALLERY PAGE WITH LIGHTBOX
   ========================================== */

let currentImageIndex = 0;
let galleryImages = [];

document.addEventListener('DOMContentLoaded', function() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
        loadGallery();
        initLightbox();
    }
});

async function loadGallery() {
    const container = document.getElementById('gallery-grid');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium); grid-column: 1/-1;">Načítavam galériu...</p>';
    
    try {
        const gallery = await DataService.getGallery();
        galleryImages = gallery;
        
        if (gallery.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium); grid-column: 1/-1;">Zatiaľ žiadne obrázky v galérii.</p>';
            return;
        }
        
        container.innerHTML = gallery.map((item, index) => `
            <div class="gallery-item" data-index="${index}">
                <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/images/galeria/placeholder.jpg'">
                <div class="gallery-item-overlay">
                    <div class="gallery-item-title">${item.title}</div>
                </div>
            </div>
        `).join('');
        
        // Add click event to gallery items
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                openLightbox(index);
            });
        });
    } catch (error) {
        console.error('Error loading gallery:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium); grid-column: 1/-1;">Chyba pri načítaní galérie.</p>';
    }
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    if (!lightbox) return;
    
    // Close lightbox
    closeBtn.addEventListener('click', closeLightbox);
    
    // Previous image
    prevBtn.addEventListener('click', function() {
        navigateLightbox(-1);
    });
    
    // Next image
    nextBtn.addEventListener('click', function() {
        navigateLightbox(1);
    });
    
    // Close on background click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1);
        }
    });
}

function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    if (!lightbox || !lightboxImage) return;
    
    currentImageIndex = index;
    const item = galleryImages[index];
    
    lightboxImage.src = item.image;
    lightboxImage.alt = item.title;
    
    if (lightboxCaption) {
        lightboxCaption.textContent = item.title;
    }
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    currentImageIndex += direction;
    
    // Loop around
    if (currentImageIndex < 0) {
        currentImageIndex = galleryImages.length - 1;
    } else if (currentImageIndex >= galleryImages.length) {
        currentImageIndex = 0;
    }
    
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const item = galleryImages[currentImageIndex];
    
    lightboxImage.src = item.image;
    lightboxImage.alt = item.title;
    
    if (lightboxCaption) {
        lightboxCaption.textContent = item.title;
    }
}