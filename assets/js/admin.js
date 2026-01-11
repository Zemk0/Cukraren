/* ==========================================
   ADMIN PANEL FUNCTIONALITY
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Force check by looking at page elements
    if (document.getElementById('products-count')) {
        loadAdminDashboard();
    }
    if (document.getElementById('news-form')) {
        loadAdminNews();
    }
    if (document.getElementById('gallery-form')) {
        loadAdminGallery();
    }
    if (document.getElementById('contact-info-form')) {
        loadAdminSettings();
    }
});

/* ==========================================
   DASHBOARD
   ========================================== */

async function loadAdminDashboard() {
    console.log('Loading dashboard...');
    
    try {
        const products = await DataService.getProducts();
        const news = await DataService.getNews();
        const gallery = await DataService.getGallery();
        
        // Update dashboard numbers
        const productsCount = document.getElementById('products-count');
        const newsCount = document.getElementById('news-count');
        const galleryCount = document.getElementById('gallery-count');
        
        if (productsCount) productsCount.textContent = products.length;
        if (newsCount) newsCount.textContent = news.length;
        if (galleryCount) galleryCount.textContent = gallery.length;
        
        console.log('Dashboard loaded:', { products: products.length, news: news.length, gallery: gallery.length });
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

/* ==========================================
   NEWS MANAGEMENT
   ========================================== */

function loadAdminNews() {
    console.log('Loading news management...');
    displayNewsList();
    initNewsForm();
}

async function displayNewsList() {
    const container = document.getElementById('news-list');
    if (!container){
console.error('news-list container not found');
return;
}try {
    const news = await DataService.getNews();
    console.log('Displaying news:', news.length);    if (news.length === 0) {
        container.innerHTML = '<tr><td colspan="4" style="text-align: center;">Žiadne novinky</td></tr>';
        return;
    }    container.innerHTML = news.map(item => `
        <tr>
            <td>${item.title}</td>
            <td>${formatDate(item.date)}</td>
            <td><img src="${item.image}" alt="${item.title}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;" onerror="this.src='../assets/images/galeria/placeholder.jpg'"></td>
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
}function initNewsForm() {
const form = document.getElementById('news-form');
if (!form) {
console.error('news-form not found');
return;
}console.log('News form initialized');form.addEventListener('submit', async function(e) {
    e.preventDefault();    console.log('Form submitted');    const newsId = document.getElementById('news-id').value;
    const newsData = {
        title: document.getElementById('news-title').value,
        excerpt: document.getElementById('news-excerpt').value,
        content: document.getElementById('news-content').value,
        image: document.getElementById('news-image').value || '../assets/images/galeria/placeholder.jpg'
    };    console.log('News data:', newsData);    try {
        if (newsId) {
            // Update existing news
            await DataService.updateNews(newsId, newsData);
            showAlert('Novinka bola aktualizovaná!', 'success');
            console.log('News updated:', newsId);
        } else {
            // Add new news
            const newItem = await DataService.addNews(newsData);
            showAlert('Novinka bola pridaná!', 'success');
            console.log('News added:', newItem);
        }        form.reset();
        document.getElementById('news-id').value = '';
        await displayNewsList();
    } catch (error) {
        console.error('Error saving news:', error);
        showAlert('Chyba pri ukladaní novinky!', 'error');
    }
});// Image preview
const imageInput = document.getElementById('news-image');
if (imageInput) {
    imageInput.addEventListener('change', function() {
        previewImage(this.value, 'news-image-preview');
    });
}
}async function editNews(id) {
console.log('Editing news:', id);try {
    const news = await DataService.getNews();
    const item = news.find(n => n.id === id);
    if (!item) {
        console.error('News item not found:', id);
        return;
    }    document.getElementById('news-id').value = item.id;
    document.getElementById('news-title').value = item.title;
    document.getElementById('news-excerpt').value = item.excerpt;
    document.getElementById('news-content').value = item.content;
    document.getElementById('news-image').value = item.image;    previewImage(item.image, 'news-image-preview');    // Scroll to form
    document.getElementById('news-form').scrollIntoView({ behavior: 'smooth' });
} catch (error) {
    console.error('Error editing news:', error);
}
}async function deleteNews(id) {
console.log('Deleting news:', id);if (confirm('Naozaj chcete zmazať túto novinku?')) {
    try {
        await DataService.deleteNews(id);
        showAlert('Novinka bola zmazaná!', 'success');
        await displayNewsList();
        console.log('News deleted:', id);
    } catch (error) {
        console.error('Error deleting news:', error);
        showAlert('Chyba pri mazaní novinky!', 'error');
    }
}
}/* ==========================================
GALLERY MANAGEMENT
========================================== */function loadAdminGallery() {
console.log('Loading gallery management...');
displayGalleryList();
initGalleryForm();
}async function displayGalleryList() {
const container = document.getElementById('gallery-list');
if (!container) {
console.error('gallery-list container not found');
return;
}try {
    const gallery = await DataService.getGallery();
    console.log('Displaying gallery:', gallery.length);    if (gallery.length === 0) {
        container.innerHTML = '<tr><td colspan="3" style="text-align: center;">Žiadne obrázky</td></tr>';
        return;
    }    container.innerHTML = gallery.map(item => `
        <tr>
            <td><img src="${item.image}" alt="${item.title}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 4px;" onerror="this.src='../assets/images/galeria/placeholder.jpg'"></td>
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
}function initGalleryForm() {
const form = document.getElementById('gallery-form');
if (!form) {
console.error('gallery-form not found');
return;
}console.log('Gallery form initialized');form.addEventListener('submit', async function(e) {
    e.preventDefault();    console.log('Gallery form submitted');    const galleryData = {
        title: document.getElementById('gallery-title').value,
        image: document.getElementById('gallery-image').value || '../assets/images/galeria/placeholder.jpg'
    };    console.log('Gallery data:', galleryData);    try {
        const newItem = await DataService.addGalleryItem(galleryData);
        showAlert('Obrázok bol pridaný!', 'success');
        console.log('Gallery item added:', newItem);        form.reset();
        await displayGalleryList();
    } catch (error) {
        console.error('Error adding gallery item:', error);
        showAlert('Chyba pri pridávaní obrázka!', 'error');
    }
});// Image preview
const imageInput = document.getElementById('gallery-image');
if (imageInput) {
    imageInput.addEventListener('change', function() {
        previewImage(this.value, 'gallery-image-preview');
    });
}
}async function deleteGalleryItem(id) {
console.log('Deleting gallery item:', id);if (confirm('Naozaj chcete zmazať tento obrázok?')) {
    try {
        await DataService.deleteGalleryItem(id);
        showAlert('Obrázok bol zmazaný!', 'success');
        await displayGalleryList();
        console.log('Gallery item deleted:', id);
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        showAlert('Chyba pri mazaní obrázka!', 'error');
    }
}
}/* ==========================================
SETTINGS MANAGEMENT
========================================== */function loadAdminSettings() {
console.log('Loading settings...');
initContactInfoForm();
initOpeningHoursForm();
}function initContactInfoForm() {
const form = document.getElementById('contact-info-form');
if (!form) {
console.error('contact-info-form not found');
return;
}console.log('Contact info form initialized');// Load current settings
DataService.getSettings().then(settings => {
    console.log('Current settings:', settings);    document.getElementById('shop-name').value = settings.shopName;
    document.getElementById('shop-address').value = settings.address;
    document.getElementById('shop-city').value = settings.city;
    document.getElementById('shop-phone').value = settings.phone;
    document.getElementById('shop-email').value = settings.email;
}).catch(error => {
    console.error('Error loading settings:', error);
});form.addEventListener('submit', async function(e) {
    e.preventDefault();    console.log('Contact info form submitted');    try {
        // Get current settings
        const currentSettings = await DataService.getSettings();        // Update only contact info
        const updatedSettings = {
            ...currentSettings,
            shopName: document.getElementById('shop-name').value,
            address: document.getElementById('shop-address').value,
            city: document.getElementById('shop-city').value,
            phone: document.getElementById('shop-phone').value,
            email: document.getElementById('shop-email').value
        };        console.log('Updated contact info:', updatedSettings);        await DataService.saveSettings(updatedSettings);
        showAlert('Kontaktné údaje boli uložené!', 'success');
        console.log('Contact info saved');
    } catch (error) {
        console.error('Error saving contact info:', error);
        showAlert('Chyba pri ukladaní kontaktných údajov!', 'error');
    }
});
}function initOpeningHoursForm() {
const form = document.getElementById('opening-hours-form');
if (!form) {
console.error('opening-hours-form not found');
return;
}console.log('Opening hours form initialized');// Load current settings
DataService.getSettings().then(settings => {
    document.getElementById('hours-weekdays').value = settings.hours.weekdays;
    document.getElementById('hours-saturday').value = settings.hours.saturday;
    document.getElementById('hours-sunday').value = settings.hours.sunday;
}).catch(error => {
    console.error('Error loading settings:', error);
});form.addEventListener('submit', async function(e) {
    e.preventDefault();    console.log('Opening hours form submitted');    try {
        // Get current settings
        const currentSettings = await DataService.getSettings();        // Update only opening hours
        const updatedSettings = {
            ...currentSettings,
            hours: {
                weekdays: document.getElementById('hours-weekdays').value,
                saturday: document.getElementById('hours-saturday').value,
                sunday: document.getElementById('hours-sunday').value
            }
        };        console.log('Updated opening hours:', updatedSettings);        await DataService.saveSettings(updatedSettings);
        showAlert('Otváracie hodiny boli uložené!', 'success');
        console.log('Opening hours saved');
    } catch (error) {
        console.error('Error saving opening hours:', error);
        showAlert('Chyba pri ukladaní otváracích hodín!', 'error');
    }
});
}/* ==========================================
UTILITY FUNCTIONS
========================================== */function showAlert(message, type) {
console.log('Showing alert:', message, type);// Remove existing alerts
const existingAlerts = document.querySelectorAll('.alert');
existingAlerts.forEach(alert => alert.remove());// Create alert element
const alert = document.createElement('div');
alert.className = `alert alert-${type}`;
alert.textContent = message;
alert.style.marginBottom = 'var(--spacing-sm)';// Insert at top of admin container
const adminContainer = document.querySelector('.admin-container');
if (adminContainer) {
    adminContainer.insertBefore(alert, adminContainer.firstChild);    // Scroll to top to see the alert
    window.scrollTo({ top: 0, behavior: 'smooth' });    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
}function previewImage(imagePath, previewId) {
const preview = document.getElementById(previewId);
if (!preview) {
console.error('Preview element not found:', previewId);
return;
}if (imagePath) {
    preview.innerHTML = `<img src="${imagePath}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'image-preview-placeholder\\'>Obrázok sa nenašiel</div>'">`;
    console.log('Image preview updated:', imagePath);
} else {
    preview.innerHTML = '<div class="image-preview-placeholder">Náhľad obrázka</div>';
}
}function formatDate(dateString) {
const date = new Date(dateString);
const options = { year: 'numeric', month: 'long', day: 'numeric' };
return date.toLocaleDateString('sk-SK', options);
}