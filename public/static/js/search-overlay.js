// Search Overlay Loader
async function loadSearchOverlay() {
  try {
    // 1. Determine the correct base path
    const pathDepth = window.location.pathname.split('/').filter(Boolean).length;
    const basePath = pathDepth > 0 ? '../'.repeat(pathDepth) : '';

    // 2. Fetch the overlay HTML
    const response = await fetch('/search-overlay.html');
    let html = await response.text();
    
    // 3. Replace all href paths with correct relative paths
    html = html.replace(/href="\.\/profiles-list\/"/g, `href="${basePath}profiles-list/"`);
    html = html.replace(/href="\.\.\/profiles-list\/"/g, `href="${basePath}profiles-list/"`);
    html = html.replace(/href="\.\/rideshare\/"/g, `href="${basePath}rideshare/"`);
    html = html.replace(/href="\.\.\/rideshare\/"/g, `href="${basePath}rideshare/"`);
    html = html.replace(/href="\.\/foods\/"/g, `href="${basePath}foods/"`);
    html = html.replace(/href="\.\.\/foods\/"/g, `href="${basePath}foods/"`);
    
    // 4. Insert it into the bottom of the body
    document.body.insertAdjacentHTML('beforeend', html);

    // 5. Re-attach the event listeners now that elements exist
    const searchInput = document.getElementById('searchInput');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');
    const overlaySearchInput = document.getElementById('overlaySearchInput');

    if (searchInput) {
      searchInput.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.classList.remove('hidden');
        setTimeout(() => {
          searchOverlay.classList.add('active');
        }, 10);
        overlaySearchInput.focus();
      });
    }

    const hideOverlay = () => {
      searchOverlay.classList.remove('active');
      setTimeout(() => {
        searchOverlay.classList.add('hidden');
      }, 300);
    };

    if (closeSearch) {
      closeSearch.addEventListener('click', hideOverlay);
    }

    if (searchOverlay) {
      searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
          hideOverlay();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideOverlay();
      }
    });
  } catch (error) {
    console.error('Failed to load search overlay:', error);
  }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadSearchOverlay);