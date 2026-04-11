// Event Handlers - Manages all user interactions and event listeners
// This file connects the UI components to the data manager

// ===== APPLICATION INITIALIZATION =====

async function initializeApp() {
  // Initialize demo data
  initializeDemoData();
  
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
  if (syncStatus.isOnline && syncStatus.useApiMode) {
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
      uiComponents.showCategoryDetail(uiComponents.currentCategory);
    } else {
      uiComponents.showDashboard();
    }
  } else {
    uiComponents.showToast('Failed to save item. Please try again.', 'error');
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
    await uiComponents.renderModifierGroupsForItem(item.category_id);
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
  if (categoryId) {
    await uiComponents.populateCategoryForm(categoryId);
  } else {
    await uiComponents.resetCategoryForm();
  }
  
  document.getElementById('categoryModal').classList.remove('hidden');
  document.getElementById('categoryModalOverlay').classList.remove('hidden');
}

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.add('hidden');
  document.getElementById('categoryModalOverlay').classList.add('hidden');
  
  setTimeout(() => {
    uiComponents.resetCategoryForm();
  }, 300);
}

async function saveCategory() {
  const name = document.getElementById('categoryName').value;
  const description = document.getElementById('categoryDescription').value;
  
  // Get selected modifier groups
  const checkboxes = document.querySelectorAll('.category-modifier-group:checked');
  const modifierGroupIds = Array.from(checkboxes).map(cb => cb.value);
  
  const categoryData = {
    name,
    description,
    modifier_group_ids: modifierGroupIds
  };
  
  let category;
  if (uiComponents.currentCategory) {
    category = await dataManager.updateCategory(uiComponents.currentCategory, categoryData);
  } else {
    category = await dataManager.createCategory(categoryData);
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
      const newStatus = !category.available;
      result = await dataManager.updateCategory(id, { available: newStatus });
      uiComponents.showToast(`${category.name} is now ${newStatus ? 'available' : 'unavailable'}`);
    }
  } else if (type === 'item') {
    const item = await dataManager.getItemById(id);
    if (item) {
      result = await dataManager.toggleItemAvailability(id);
      uiComponents.showToast(`${item.name} is now ${result.available ? 'available' : 'unavailable'}`);
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