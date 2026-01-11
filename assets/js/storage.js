/* ==========================================
   DATA SERVICE - UNIFIED FETCH PATTERN
   Reads from local JSON files, easy to switch to API
   ========================================== */

const DataService = {
    
    /* ==========================================
       CONFIGURATION
       ========================================== */
    
    config: {
        // For local development - reads from /data/ folder
        mode: 'local', // 'local' or 'api'
        localBasePath: 'data/',
        apiBasePath: '/api/',
        useCache: true, // Enable/disable caching
        cachePrefix: 'cukraren_'
    },
    
    /* ==========================================
       UNIFIED FETCH FUNCTION
       Works for both local files and API
       ========================================== */
    
    async fetch(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            useCache = this.config.useCache
        } = options;
        
        const cacheKey = this.config.cachePrefix + endpoint.replace('.json', '');
        
        try {
            // For GET requests, check cache first
            if (method === 'GET' && useCache) {
                const cached = this.getFromCache(cacheKey);
                if (cached) {
                    console.log(`✓ Loaded from cache: ${endpoint}`);
                    return cached;
                }
            }
            
            // Determine URL based on mode
            const baseURL = this.config.mode === 'local' 
                ? this.config.localBasePath 
                : this.config.apiBasePath;
            
            const url = baseURL + endpoint;
            
            console.log(`→ Fetching: ${url}`);
            
            // Prepare fetch options
            const fetchOptions = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (body && method !== 'GET') {
                fetchOptions.body = JSON.stringify(body);
            }
            
            // Fetch data
            const response = await fetch(url, fetchOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache GET responses
            if (method === 'GET' && useCache) {
                this.saveToCache(cacheKey, data);
            }
            
            console.log(`✓ Fetched successfully: ${endpoint}`);
            return data;
            
        } catch (error) {
            console.error(`✗ Fetch error [${endpoint}]:`, error.message);
            
            // Try to return cached data as fallback
            if (useCache) {
                const cached = this.getFromCache(cacheKey);
                if (cached) {
                    console.log(`⚠ Using cached fallback for: ${endpoint}`);
                    return cached;
                }
            }
            
            throw error;
        }
    },
    
    /* ==========================================
       CACHE HELPERS
       ========================================== */
    
    getFromCache(key) {
        try {
            const cached = localStorage.getItem(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    },
    
    saveToCache(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`✓ Cached: ${key}`);
        } catch (error) {
            console.error('Cache write error:', error);
        }
    },
    
    clearCache(key = null) {
        if (key) {
            localStorage.removeItem(this.config.cachePrefix + key);
        } else {
            // Clear all cache with prefix
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.config.cachePrefix)) {
                    localStorage.removeItem(key);
                }
            });
        }
        console.log('✓ Cache cleared');
    },
    
    /* ==========================================
       SAVE FUNCTION (for admin)
       In 'local' mode: saves to localStorage
       In 'api' mode: sends POST/PUT request
       ========================================== */
    
    async save(endpoint, data, method = 'POST') {
        if (this.config.mode === 'local') {
            // Local mode: save to localStorage
            const key = this.config.cachePrefix + endpoint.replace('.json', '');
            this.saveToCache(key, data);
            console.log(`✓ Saved to localStorage: ${key}`);
            return { success: true, data: data };
        } else {
            // API mode: send to backend
            try {
                const response = await this.fetch(endpoint, {
                    method: method,
                    body: data,
                    useCache: false
                });
                return { success: true, data: response };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    },
    
    /* ==========================================
       PRODUCTS API
       ========================================== */
    
    async getProducts() {
        return await this.fetch('produkty.json');
    },
    
    async saveProducts(products) {
        return await this.save('produkty.json', products, 'PUT');
    },
    
    async addProduct(product) {
        const products = await this.getProducts();
        product.id = 'prod_' + Date.now();
        product.createdAt = new Date().toISOString();
        products.push(product);
        
        const result = await this.saveProducts(products);
        return result.success ? product : null;
    },
    
    async updateProduct(id, updatedData) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);
        
        if (index !== -1) {
            products[index] = { 
                ...products[index], 
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            const result = await this.saveProducts(products);
            return result.success ? products[index] : null;
        }
        return null;
    },
    
    async deleteProduct(id) {
        const products = await this.getProducts();
        const filtered = products.filter(p => p.id !== id);
        const result = await this.saveProducts(filtered);
        return result.success;
    },
    
    /* ==========================================
       NEWS API
       ========================================== */
    
    async getNews() {
        return await this.fetch('novinky.json');
    },
    
    async saveNews(news) {
        return await this.save('novinky.json', news, 'PUT');
    },
    
    async addNews(newsItem) {
        const news = await this.getNews();
        newsItem.id = 'news_' + Date.now();
        newsItem.date = new Date().toISOString().split('T')[0];
        newsItem.createdAt = new Date().toISOString();
        news.unshift(newsItem);
        
        const result = await this.saveNews(news);
        return result.success ? newsItem : null;
    },
    
    async updateNews(id, updatedData) {
        const news = await this.getNews();
        const index = news.findIndex(n => n.id === id);
        
        if (index !== -1) {
            news[index] = { 
                ...news[index], 
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            const result = await this.saveNews(news);
            return result.success ? news[index] : null;
        }
        return null;
    },
    
    async deleteNews(id) {
        const news = await this.getNews();
        const filtered = news.filter(n => n.id !== id);
        const result = await this.saveNews(filtered);
        return result.success;
    },
    
    /* ==========================================
       GALLERY API
       ========================================== */
    
    async getGallery() {
        return await this.fetch('galerie.json');
    },
    
    async saveGallery(gallery) {
        return await this.save('galerie.json', gallery, 'PUT');
    },
    
    async addGalleryItem(item) {
        const gallery = await this.getGallery();
        item.id = 'gal_' + Date.now();
        item.createdAt = new Date().toISOString();
        gallery.unshift(item);
        
        const result = await this.saveGallery(gallery);
        return result.success ? item : null;
    },
    
    async deleteGalleryItem(id) {
        const gallery = await this.getGallery();
        const filtered = gallery.filter(g => g.id !== id);
        const result = await this.saveGallery(filtered);
        return result.success;
    },
    
    /* ==========================================
       SETTINGS API
       ========================================== */
    
    async getSettings() {
        try {
            return await this.fetch('nastavenia.json');
        } catch (error) {
            // Return default settings if file doesn't exist
            const defaultSettings = {
                shopName: 'Cukráreň Janka',
                address: 'Hlavná 123',
                city: '010 01 Žilina',
                phone: '+421 123 456 789',
                email: 'info@cukrarenjanka.sk',
                hours: {
                    weekdays: '7:00 - 18:00',
                    saturday: '8:00 - 14:00',
                    sunday: 'Zatvorené'
                }
            };
            await this.saveSettings(defaultSettings);
            return defaultSettings;
        }
    },
    
    async saveSettings(settings) {
        settings.updatedAt = new Date().toISOString();
        const result = await this.save('nastavenia.json', settings, 'PUT');
        return result.success ? settings : null;
    }
};

// Backward compatibility wrapper
const Storage = {
    getProducts: () => DataService.getProducts(),
    addProduct: (product) => DataService.addProduct(product),
    updateProduct: (id, data) => DataService.updateProduct(id, data),
    deleteProduct: (id) => DataService.deleteProduct(id),
    
    getNews: () => DataService.getNews(),
    addNews: (item) => DataService.addNews(item),
    updateNews: (id, data) => DataService.updateNews(id, data),
    deleteNews: (id) => DataService.deleteNews(id),
    
    getGallery: () => DataService.getGallery(),
    addGalleryItem: (item) => DataService.addGalleryItem(item),
    deleteGalleryItem: (id) => DataService.deleteGalleryItem(id),
    
    getSettings: () => DataService.getSettings(),
    saveSettings: (settings) => DataService.saveSettings(settings)
};