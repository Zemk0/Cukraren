/* ==========================================
   ADMIN PANEL INITIALIZATION
========================================== */
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('products-count')) loadAdminDashboard();
    if (document.getElementById('news-form')) loadAdminNews();
    if (document.getElementById('gallery-form')) loadAdminGallery();
    if (document.getElementById('contact-info-form')) loadAdminSettings();
});

/* ==========================================
   DASHBOARD
========================================== */
async function loadAdminDashboard() {
    try {
        const products = await DataService.getProducts();
        const news = await DataService.getNews();
        const gallery = await DataService.getGallery();

        document.getElementById('products-count').textContent = products.length;
        document.getElementById('news-count').textContent = news.length;
        document.getElementById('gallery-count').textContent = gallery.length;

        console.log('Dashboard loaded:', { products: products.length, news: news.length, gallery: gallery.length });
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

/* ==========================================
   NEWS MANAGEMENT
========================================== */
function loadAdminNews() {
    displayNewsList();
    initNewsForm();
}

async function displayNewsList() {
    const container = document.getElementById('news-list');
    if (!container) return console.error('news-list container not found');

    try {
        const news = await DataService.getNews();
        if (news.length === 0) {
            container.innerHTML = '<tr><td colspan="4" style="text-align: center;">Žiadne novinky</td></tr>';
            return;
        }

        container.innerHTML = news.map(item => `
            <tr>
                <td>${item.title}</td>
                <td>${formatDate(item.date)}</td>
                <td><img src="${"../"+item.image}" alt="${item.title}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;" onerror="this.src='../assets/images/galeria/placeholder.jpg'"></td>
                <td class="admin-table-actions">
                    <button class="btn-edit" onclick="editNews('${item.id}')">Upraviť</button>
                    <button class="btn-remove" onclick="deleteNews('${item.id}')">Zmazať</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error displaying news:', error);
        container.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Chyba pri načítaní noviniek</td></tr>';
    }
}

function initNewsForm() {
    const form = document.getElementById('news-form');
    if (!form) return console.error('news-form not found');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const newsId = document.getElementById('news-id').value;
        const newsData = {
            title: document.getElementById('news-title').value,
            excerpt: document.getElementById('news-excerpt').value,
            content: document.getElementById('news-content').value,
            image: document.getElementById('news-image').value || '../assets/images/galeria/placeholder.jpg'
        };

        try {
            if (newsId) {
                await DataService.updateNews(newsId, newsData);
                showAlert('Novinka bola aktualizovaná!', 'success');
            } else {
                await DataService.addNews(newsData);
                showAlert('Novinka bola pridaná!', 'success');
            }
            form.reset();
            document.getElementById('news-id').value = '';
            await displayNewsList();
        } catch (error) {
            console.error('Error saving news:', error);
            showAlert('Chyba pri ukladaní novinky!', 'error');
        }
    });

    const imageInput = document.getElementById('news-image');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            previewImage(this.value, 'news-image-preview');
        });
    }
}

async function editNews(id) {
    try {
        const news = await DataService.getNews();
        const item = news.find(n => n.id === id);
        if (!item) return console.error('News item not found:', id);

        document.getElementById('news-id').value = item.id;
        document.getElementById('news-title').value = item.title;
        document.getElementById('news-excerpt').value = item.excerpt;
        document.getElementById('news-content').value = item.content;
        document.getElementById('news-image').value = item.image;

        previewImage(item.image, 'news-image-preview');
        document.getElementById('news-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editing news:', error);
    }
}

async function deleteNews(id) {
    if (!confirm('Naozaj chcete zmazať túto novinku?')) return;
    try {
        await DataService.deleteNews(id);
        showAlert('Novinka bola zmazaná!', 'success');
        await displayNewsList();
    } catch (error) {
        console.error('Error deleting news:', error);
        showAlert('Chyba pri mazaní novinky!', 'error');
    }
}

/* ==========================================
   GALLERY MANAGEMENT
========================================== */
function loadAdminGallery() {
    displayGalleryList();
    initGalleryForm();
}

async function displayGalleryList() {
    const container = document.getElementById('gallery-list');
    if (!container) return console.error('gallery-list container not found');

    try {
        const gallery = await DataService.getGallery();
        if (gallery.length === 0) {
            container.innerHTML = '<tr><td colspan="3" style="text-align: center;">Žiadne obrázky</td></tr>';
            return;
        }

        container.innerHTML = gallery.map(item => `
            <tr>
                <td><img src="${"../"+item.image}" alt="${item.title}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 4px;" onerror="this.src='../assets/images/galeria/placeholder.png'"></td>
                <td>${item.title}</td>
                <td class="admin-table-actions">
                    <button class="btn-remove" onclick="deleteGalleryItem('${item.id}')">Zmazať</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error displaying gallery:', error);
        container.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Chyba pri načítaní galérie</td></tr>';
    }
}

function initGalleryForm() {
    const form = document.getElementById('gallery-form');
    if (!form) return console.error('gallery-form not found');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const galleryData = {
            title: document.getElementById('gallery-title').value,
            image: document.getElementById('gallery-image').value || '../assets/images/galeria/placeholder.png'
        };

        try {
            await DataService.addGalleryItem(galleryData);
            showAlert('Obrázok bol pridaný!', 'success');
            form.reset();
            await displayGalleryList();
        } catch (error) {
            console.error('Error adding gallery item:', error);
            showAlert('Chyba pri pridávaní obrázka!', 'error');
        }
    });

    const imageInput = document.getElementById('gallery-image');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            previewImage(this.value, 'gallery-image-preview');
        });
    }
}

async function deleteGalleryItem(id) {
    if (!confirm('Naozaj chcete zmazať tento obrázok?')) return;
    try {
        await DataService.deleteGalleryItem(id);
        showAlert('Obrázok bol zmazaný!', 'success');
        await displayGalleryList();
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        showAlert('Chyba pri mazaní obrázka!', 'error');
    }
}

/* ==========================================
   SETTINGS MANAGEMENT
========================================== */
function loadAdminSettings() {
    initContactInfoForm();
    initOpeningHoursForm();
}

function initContactInfoForm() {
    const form = document.getElementById('contact-info-form');
    if (!form) return console.error('contact-info-form not found');

    DataService.getSettings().then(settings => {
        document.getElementById('shop-name').value = settings.shopName;
        document.getElementById('shop-address').value = settings.address;
        document.getElementById('shop-city').value = settings.city;
        document.getElementById('shop-phone').value = settings.phone;
        document.getElementById('shop-email').value = settings.email;
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const currentSettings = await DataService.getSettings();
            const updatedSettings = {
                ...currentSettings,
                shopName: document.getElementById('shop-name').value,
                address: document.getElementById('shop-address').value,
                city: document.getElementById('shop-city').value,
                phone: document.getElementById('shop-phone').value,
                email: document.getElementById('shop-email').value
            };
            await DataService.saveSettings(updatedSettings);
            showAlert('Kontaktné údaje boli uložené!', 'success');
        } catch (error) {
            console.error('Error saving contact info:', error);
            showAlert('Chyba pri ukladaní kontaktných údajov!', 'error');
        }
    });
}

function initOpeningHoursForm() {
    const form = document.getElementById('opening-hours-form');
    if (!form) return console.error('opening-hours-form not found');

    DataService.getSettings().then(settings => {
        document.getElementById('hours-weekdays').value = settings.hours.weekdays;
        document.getElementById('hours-saturday').value = settings.hours.saturday;
        document.getElementById('hours-sunday').value = settings.hours.sunday;
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const currentSettings = await DataService.getSettings();
            const updatedSettings = {
                ...currentSettings,
                hours: {
                    weekdays: document.getElementById('hours-weekdays').value,
                    saturday: document.getElementById('hours-saturday').value,
                    sunday: document.getElementById('hours-sunday').value
                }
            };
            await DataService.saveSettings(updatedSettings);
            showAlert('Otváracie hodiny boli uložené!', 'success');
        } catch (error) {
            console.error('Error saving opening hours:', error);
            showAlert('Chyba pri ukladaní otváracích hodín!', 'error');
        }
    });
}

/* ==========================================
   UTILITY FUNCTIONS
========================================== */
function showAlert(message, type) {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.marginBottom = 'var(--spacing-sm)';

    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) {
        adminContainer.insertBefore(alert, adminContainer.firstChild);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => alert.remove(), 5000);
    }
}

function previewImage(imagePath, previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return console.error('Preview element not found:', previewId);

    if (imagePath) {
        preview.innerHTML = `<img src="${imagePath}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'image-preview-placeholder\\'>Obrázok sa nenašiel</div>'">`;
    } else {
        preview.innerHTML = '<div class="image-preview-placeholder">Náhľad obrázka</div>';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', { year: 'numeric', month: 'long', day: 'numeric' });
}
