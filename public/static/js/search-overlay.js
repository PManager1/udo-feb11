// Search Overlay Loader
async function loadSearchOverlay() {
  try {
    // 1. Determine the correct base path based on current directory depth
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    // Count how many directories we're deep (excluding index.html)
    let depth = 0;
    for (const part of pathParts) {
      if (part.endsWith('.html')) {
        break; // Found the file, stop counting
      }
      depth++;
    }
    
    // Build the base path: "../" for each directory level
    const basePath = '../'.repeat(depth);

    // 2. Fetch the overlay HTML
    const response = await fetch('/search-overlay.html');
    let html = await response.text();
    
    // 3. Replace all href paths with correct relative paths
    // Replace paths without any prefix
    html = html.replace(/href="profiles-list\/"/g, `href="${basePath}profiles-list/"`);
    html = html.replace(/href="foods\/"/g, `href="${basePath}foods/"`);
    html = html.replace(/href="rideshare\/"/g, `href="${basePath}rideshare/"`);
    
    // Replace paths with "./" prefix
    html = html.replace(/href="\.\/profiles-list\/"/g, `href="${basePath}profiles-list/"`);
    html = html.replace(/href="\.\/foods\/"/g, `href="${basePath}foods/"`);
    html = html.replace(/href="\.\/rideshare\/"/g, `href="${basePath}rideshare/"`);
    
    // Replace paths with "../" prefix (in case they're already there)
    html = html.replace(/href="\.\.\/profiles-list\/"/g, `href="${basePath}profiles-list/"`);
    html = html.replace(/href="\.\.\/foods\/"/g, `href="${basePath}foods/"`);
    html = html.replace(/href="\.\.\/rideshare\/"/g, `href="${basePath}rideshare/"`);
    
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