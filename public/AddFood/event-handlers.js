// Event Handlers - Manages all user interactions and event listeners
// This file connects the UI components to the data manager

// ===== APPLICATION INITIALIZATION =====

async function initializeApp() {
  // Check if user is logged in
  if (typeof tokenManager === 'undefined' || !tokenManager.hasValidToken()) {
    console.warn('⚠️  No valid token found, redirecting to login');
    window.location.href = '/login/index.html';
    return;
  }
  
  // Clear any stale sign-out flag (user has logged back in)
  localStorage.removeItem('udo-signed-out');
  
  // Production: No demo data - all data from backend
  
  // Initialize API mode with health check
  await dataManager.initializeApiMode();
  
  // Show dashboard
  await uiComponents.showDashboard();
  
  // Setup search functionality
  setupSearch();
  
  // Setup form submissions
  setupForms();
  
  // Setup sync status updates
  setupSyncStatusUpdates();
  
  console.log('AddFood application initialized successfully');
}

// ===== SYNC STATUS UPDATES =====

function setupSyncStatusUpdates() {
  // Listen for sync status changes from data manager
  const checkInterval = setInterval(() => {
    updateSyncStatus();
  }, 5000);
  
  // Initial check
  updateSyncStatus();
}

function updateSyncStatus() {
  const statusElement = document.getElementById('syncStatus');
  const textElement = document.getElementById('syncStatusText');
  const dotElement = statusElement?.querySelector('div');
  
  if (!statusElement || !textElement || !dotElement) return;
  
  const syncStatus = dataManager.getSyncStatus();
  
  // Determine status based on isOnline flag
  let status;
  if (syncStatus.isOnline) {
    status = 'online';
  } else if (syncStatus.lastError) {
    status = 'error';
  } else {
    status = 'offline';
  }
  
  switch (status) {
    case 'online':
      statusElement.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700';
      dotElement.className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';
      textElement.textContent = 'Online';
      break;
    case 'offline':
      statusElement.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600';
      dotElement.className = 'w-2 h-2 rounded-full bg-gray-400';
      textElement.textContent = 'Offline';
      break;
    case 'error':
      statusElement.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700';
      dotElement.className = 'w-2 h-2 rounded-full bg-red-500';
      textElement.textContent = 'Error';
      break;
    default:
      statusElement.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600';
      dotElement.className = 'w-2 h-2 rounded-full bg-gray-400';
      textElement.textContent = 'Checking...';
  }
}

// ===== SEARCH FUNCTIONALITY =====

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = e.target.value.trim();
      uiComponents.handleSearch(query);
    }, 300);
  });
}

// ===== FORM SUBMISSIONS =====

function setupForms() {
  // Item form
  document.getElementById('itemForm').addEventListener('submit', handleItemFormSubmit);
}

async function handleItemFormSubmit(e) {
  e.preventDefault();
  
  try {
    const name = document.getElementById('itemName').value;
    const categoryId = document.getElementById('itemCategory').value;
    const price = document.getElementById('itemPrice').value;
    const description = document.getElementById('itemDescription').value;
    const preview = document.getElementById('imagePreview');
    
    // Get selected modifier groups
    const modifierCheckboxes = document.querySelectorAll('#modifierGroupsList input[type="checkbox"]:checked');
    const modifierGroupIds = Array.from(modifierCheckboxes).map(cb => cb.value);
    
    const itemData = {
      name,
      category_id: categoryId,
      base_price: price,
      description,
      image_url: preview.src || '',
      modifier_group_ids: modifierGroupIds
    };
    
    let item;
    if (uiComponents.currentItem) {
      item = await dataManager.updateItem(uiComponents.currentItem, itemData);
    } else {
      item = await dataManager.createItem(itemData);
    }
    
    if (item) {
      uiComponents.showToast(uiComponents.currentItem ? 'Item updated successfully!' : 'Item created successfully!');
      closeItemDrawer();
      
      // Refresh the current view
      if (uiComponents.currentCategory) {
        await uiComponents.showCategoryDetail(uiComponents.currentCategory);
      } else {
        await uiComponents.showDashboard();
      }
    } else {
      uiComponents.showToast('Failed to save item. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Error saving item:', error);
    uiComponents.showToast(`Error: ${error.message}. Please check your connection and try again.`, 'error');
  }
}

// ===== VIEW NAVIGATION =====

async function showDashboard() {
  await uiComponents.showDashboard();
}

async function showCategoryDetail(categoryId) {
  await uiComponents.showCategoryDetail(categoryId);
}

// ===== ITEM DRAWER =====

async function openItemDrawer(itemId = null) {
  await uiComponents.populateCategorySelect();
  
  if (itemId) {
    await uiComponents.populateItemForm(itemId);
    const item = await dataManager.getItemById(itemId);
    await uiComponents.renderModifierGroupsForItem(item.category_id || item.categoryId);
  } else {
    await uiComponents.resetItemForm();
    if (uiComponents.currentCategory) {
      document.getElementById('itemCategory').value = uiComponents.currentCategory;
      await uiComponents.renderModifierGroupsForItem(uiComponents.currentCategory);
    } else {
      const categories = await dataManager.getAllCategories();
      if (categories.length > 0) {
        document.getElementById('itemCategory').value = categories[0].id;
        await uiComponents.renderModifierGroupsForItem(categories[0].id);
      }
    }
  }
  
  document.getElementById('itemDrawer').classList.remove('translate-x-full');
  document.getElementById('itemDrawerOverlay').classList.remove('hidden');
}

function closeItemDrawer() {
  document.getElementById('itemDrawer').classList.add('translate-x-full');
  document.getElementById('itemDrawerOverlay').classList.add('hidden');
  
  // Wait for animation to complete before resetting
  setTimeout(() => {
    uiComponents.resetItemForm();
  }, 300);
}

function editItem(itemId) {
  openItemDrawer(itemId);
}

async function deleteItem(itemId) {
  if (confirm('Are you sure you want to delete this item?')) {
    if (await dataManager.deleteItem(itemId)) {
      uiComponents.showToast('Item deleted successfully!');
      
      if (uiComponents.currentCategory) {
        await uiComponents.showCategoryDetail(uiComponents.currentCategory);
      } else {
        await uiComponents.showDashboard();
      }
    } else {
      uiComponents.showToast('Failed to delete item. Please try again.', 'error');
    }
  }
}

// ===== CATEGORY MODAL =====

async function openCategoryModal(categoryId = null) {
  // Cancel any pending reset from a previous modal close
  if (_categoryModalResetTimeout) {
    clearTimeout(_categoryModalResetTimeout);
    _categoryModalResetTimeout = null;
  }
  
  // Show modal FIRST for immediate feedback
  document.getElementById('categoryModal').classList.remove('hidden');
  document.getElementById('categoryModalOverlay').classList.remove('hidden');
  
  if (categoryId) {
    try {
      await uiComponents.populateCategoryForm(categoryId);
      // Verify the name was set (debug for race condition)
      const nameEl = document.getElementById('categoryName');
      console.log('After populate - categoryName value:', nameEl?.value);
      if (!nameEl?.value) {
        console.warn('Category name was cleared! Re-applying...');
        const cat = await dataManager.getCategoryById(categoryId);
        if (cat) {
          nameEl.value = cat.name || cat.title || '';
          console.log('Re-applied name:', nameEl.value);
        }
      }
      // Delayed check: verify 200ms later if name survived
      setTimeout(() => {
        const val = document.getElementById('categoryName')?.value;
        console.log('Delayed check (200ms) - categoryName value:', val);
        if (!val) {
          console.warn('Name was cleared AFTER populate! Stack trace for debugging:');
          console.trace();
        }
      }, 200);
    } catch (error) {
      console.error('Error populating category form:', error);
      uiComponents.showToast('Failed to load category data', 'error');
    }
  } else {
    await uiComponents.resetCategoryForm();
  }
}

// Track the reset timeout so we can cancel it if modal reopens
let _categoryModalResetTimeout = null;

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.add('hidden');
  document.getElementById('categoryModalOverlay').classList.add('hidden');
  
  // Clear any existing timeout
  if (_categoryModalResetTimeout) clearTimeout(_categoryModalResetTimeout);
  
  _categoryModalResetTimeout = setTimeout(() => {
    uiComponents.resetCategoryForm();
    _categoryModalResetTimeout = null;
  }, 300);
}

async function saveCategory() {
  const name = document.getElementById('categoryName').value;
  const description = document.getElementById('categoryDescription').value;
  const icon = document.getElementById('categoryIcon').value || '🍽️';
  const color = document.getElementById('categoryColor').value || '#f97316';
  
  // Get selected modifier groups
  const checkboxes = document.querySelectorAll('.category-modifier-group:checked');
  const modifierGroupIds = Array.from(checkboxes).map(cb => cb.value);
  
  const categoryData = {
    name,
    description,
    icon,
    color,
    modifier_group_ids: modifierGroupIds
  };
  
  // Save icon/color/description locally as backup (backend may not store these)
  if (uiComponents.currentCategory) {
    uiComponents._saveLocalMeta(uiComponents.currentCategory, { icon, color, description });
  }
  
  let category;
  if (uiComponents.currentCategory) {
    category = await dataManager.updateCategory(uiComponents.currentCategory, categoryData);
  } else {
    category = await dataManager.createCategory(categoryData);
    // Save metadata for newly created category too
    if (category && category.id) {
      uiComponents._saveLocalMeta(category.id, { icon, color, description });
    }
  }
  
  if (category) {
    uiComponents.showToast(uiComponents.currentCategory ? 'Category updated successfully!' : 'Category created successfully!');
    closeCategoryModal();
    await uiComponents.showDashboard();
  } else {
    uiComponents.showToast('Failed to save category. Please try again.', 'error');
  }
}

// ===== MODIFIER GROUP MODAL =====

async function openModifierGroupModal(groupId = null) {
  if (groupId) {
    await uiComponents.populateModifierGroupForm(groupId);
  } else {
    uiComponents.resetModifierGroupForm();
  }
  
  document.getElementById('modifierModal').classList.remove('hidden');
  document.getElementById('modifierModalOverlay').classList.remove('hidden');
}

function closeModifierGroupModal() {
  document.getElementById('modifierModal').classList.add('hidden');
  document.getElementById('modifierModalOverlay').classList.add('hidden');
  
  setTimeout(() => {
    uiComponents.resetModifierGroupForm();
  }, 300);
}

function addModifierOption() {
  uiComponents.tempModifierOptions.push({
    name: '',
    extra_price: 0.00
  });
  uiComponents.renderModifierOptions();
}

function removeModifierOption(index) {
  uiComponents.tempModifierOptions.splice(index, 1);
  uiComponents.renderModifierOptions();
}

function updateModifierOptionValue(index, field, value) {
  uiComponents.tempModifierOptions[index][field] = value;
}

async function saveModifierGroup() {
  const name = document.getElementById('modifierGroupName').value;
  const minSelection = document.getElementById('modifierMinSelection').value;
  const maxSelection = document.getElementById('modifierMaxSelection').value;
  const required = document.getElementById('modifierRequired').checked;
  
  // Collect option values from DOM
  const nameInputs = document.querySelectorAll('.modifier-option-name');
  const priceInputs = document.querySelectorAll('.modifier-option-price');
  
  const options = Array.from(nameInputs).map((input, index) => ({
    name: input.value,
    extra_price: parseFloat(priceInputs[index].value) || 0
  })).filter(opt => opt.name.trim() !== '');
  
  const groupData = {
    name,
    description: '',
    min_selection: minSelection,
    max_selection: maxSelection,
    required,
    options
  };
  
  let group;
  if (uiComponents.currentModifierGroup) {
    group = await dataManager.updateModifierGroup(uiComponents.currentModifierGroup, groupData);
  } else {
    group = await dataManager.createModifierGroup(groupData);
  }
  
  if (group) {
    uiComponents.showToast(uiComponents.currentModifierGroup ? 'Modifier group updated successfully!' : 'Modifier group created successfully!');
    closeModifierGroupModal();
    
    // Refresh current view
    if (uiComponents.currentCategory) {
      await uiComponents.showCategoryDetail(uiComponents.currentCategory);
    }
  } else {
    uiComponents.showToast('Failed to save modifier group. Please try again.', 'error');
  }
}

// ===== AVAILABILITY TOGGLES (86ing) =====

async function toggleAvailability(type, id) {
  let result;
  
  if (type === 'category') {
    const category = await dataManager.getCategoryById(id);
    if (category) {
      const currentStatus = category.available !== undefined ? category.available : (category.isActive || false);
      const newStatus = !currentStatus;
      result = await dataManager.updateCategory(id, { available: newStatus });
      uiComponents.showToast(`${category.name} is now ${newStatus ? 'available' : 'unavailable'}`);
    }
  } else if (type === 'item') {
    const item = await dataManager.getItemById(id);
    if (item) {
      result = await dataManager.toggleItemAvailability(id);
      const isNowAvailable = result ? (result.available !== false) : true;
      uiComponents.showToast(`${item.name} is now ${isNowAvailable ? 'available' : 'unavailable'}`);
    }
  }
  
  // Refresh the current view
  if (uiComponents.currentCategory) {
    await uiComponents.showCategoryDetail(uiComponents.currentCategory);
  } else {
    await uiComponents.showDashboard();
  }
}

// ===== IMAGE HANDLING =====

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // In a real application, you would upload this to a server
    // For demo purposes, we'll create a local object URL
    const reader = new FileReader();
    reader.onload = (e) => {
      showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

function handleImageUrl(event) {
  const url = event.target.value;
  if (url) {
    showImagePreview(url);
  }
}

function usePlaceholderImage() {
  const placeholderImages = [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800',
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800'
  ];
  const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  showImagePreview(randomImage);
}

function showImagePreview(url) {
  const preview = document.getElementById('imagePreview');
  const container = document.getElementById('imagePreviewContainer');
  
  preview.src = url;
  container.classList.remove('hidden');
  
  // Add fade-in animation
  container.classList.add('fade-in');
  setTimeout(() => container.classList.remove('fade-in'), 300);
}

function clearImage() {
  const preview = document.getElementById('imagePreview');
  const container = document.getElementById('imagePreviewContainer');
  
  preview.src = '';
  container.classList.add('hidden');
  
  // Clear file inputs
  const fileInput = document.querySelector('input[type="file"]');
  const urlInput = document.getElementById('imageUrlInput');
  if (fileInput) fileInput.value = '';
  if (urlInput) urlInput.value = '';
}

// ===== MODIFIER OPTION INPUT HANDLERS =====

// Add event listeners for modifier option inputs dynamically
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('modifier-option-name')) {
    const index = parseInt(e.target.dataset.index);
    updateModifierOptionValue(index, 'name', e.target.value);
  } else if (e.target.classList.contains('modifier-option-price')) {
    const index = parseInt(e.target.dataset.index);
    updateModifierOptionValue(index, 'extra_price', parseFloat(e.target.value) || 0);
  }
});

// ===== KEYBOARD SHORTCUTS =====

document.addEventListener('keydown', (e) => {
  // Escape key closes modals and drawers
  if (e.key === 'Escape') {
    closeItemDrawer();
    closeCategoryModal();
    closeModifierGroupModal();
  }
});

// ===== SIGN OUT =====

/**
 * Handle sign out - clear token, notify other tabs, redirect
 */
function handleSignOut() {
  console.log('Signing out...');
  
  // Clear the auth token first
  if (typeof tokenManager !== 'undefined') {
    tokenManager.clearToken();
  }
  
  // Notify other tabs via BroadcastChannel
  try {
    const channel = new BroadcastChannel('udo-auth-channel');
    channel.postMessage({ type: 'SIGN_OUT' });
    channel.close();
  } catch (e) {
    console.log('BroadcastChannel not supported');
  }
  
  // Set a persistent flag in localStorage so other tabs detect it on focus
  localStorage.setItem('udo-signed-out', 'true');
  
  // Redirect to login page
  window.location.href = '../login/';
}

// ===== CROSS-TAB AUTH LISTENER =====

(function setupCrossTabSignOut() {
  // Method 1: BroadcastChannel (modern browsers)
  try {
    const authChannel = new BroadcastChannel('udo-auth-channel');
    authChannel.onmessage = function(event) {
      if (event.data && event.data.type === 'SIGN_OUT') {
        console.log('Received sign-out from another tab');
        if (typeof tokenManager !== 'undefined') {
          tokenManager.clearToken();
        }
        window.location.href = '../login/';
      }
    };
  } catch (e) {
    console.log('BroadcastChannel not supported, using storage event fallback');
  }

  // Method 2: localStorage storage event (fires in OTHER tabs)
  window.addEventListener('storage', function(event) {
    if (event.key === 'udo-signed-out' && event.newValue === 'true') {
      console.log('Received sign-out via storage event');
      if (typeof tokenManager !== 'undefined') {
        tokenManager.clearToken();
      }
      window.location.href = '../login/';
    }
  });

  // Method 3: visibilitychange - check token when user focuses this tab
  // This catches the case where the other tab signed out before this tab loaded the listeners
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      // Tab just became visible - check if user is still authenticated
      const signedOut = localStorage.getItem('udo-signed-out');
      if (signedOut === 'true') {
        console.log('Tab focused - user was signed out in another tab');
        if (typeof tokenManager !== 'undefined') {
          tokenManager.clearToken();
        }
        window.location.href = '../login/';
      }
    }
  });
})();
