// Search Overlay Loader
async function loadSearchOverlay() {
  try {
    // 1. Fetch the overlay HTML
    const response = await fetch('/search-overlay.html');
    const html = await response.text();
    
    // 2. Insert it into the bottom of the body
    document.body.insertAdjacentHTML('beforeend', html);

    // 3. Re-attach the event listeners now that elements exist
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