/* ==========================================
   NEWS PAGE
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
    const newsArticles = document.getElementById('news-articles');
    if (newsArticles) {
        loadAllNews();
    }
});

async function loadAllNews() {
    const container = document.getElementById('news-articles');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Načítavam novinky...</p>';
    
    try {
        const news = await DataService.getNews();
        
        if (news.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Zatiaľ žiadne novinky.</p>';
            return;
        }
        
        container.innerHTML = news.map(item => `
            <article class="news-article">
                <div class="news-article-image">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/images/galeria/placeholder.jpg'">
                </div>
                <div class="news-article-content">
                    <div class="news-article-date">${formatNewsDate(item.date)}</div>
                    <h2 class="news-article-title">${item.title}</h2>
                    <div class="news-article-text">${item.content}</div>
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-medium);">Chyba pri načítaní noviniek.</p>';
    }
}

function formatNewsDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('sk-SK', options);
}