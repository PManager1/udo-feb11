// UI Components - Handles all rendering logic for the restaurant menu interface
// This file manages the display of categories, items, modifier groups, and other UI elements

class UIComponents {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.currentCategory = null;
    this.currentItem = null;
    this.currentModifierGroup = null;
    this.tempModifierOptions = [];
  }

  // ===== VIEW MANAGEMENT =====

  showDashboard() {
    document.getElementById('dashboardView').classList.remove('hidden');
    document.getElementById('categoryDetailView').classList.add('hidden');
    this.renderCategories();
  }

  showCategoryDetail(categoryId) {
    this.currentCategory = categoryId;
    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('categoryDetailView').classList.remove('hidden');
    
    const category = this.dataManager.getCategoryById(categoryId);
    if (category) {
      document.getElementById('categoryTitle').textContent = category.name;
      document.getElementById('categoryDescription').textContent = category.description || '';
    }
    
    this.renderItems(categoryId);
  }

  // ===== CATEGORY RENDERING =====

  renderCategories() {
    const categories = this.dataManager.getAllCategories();
    const container = document.getElementById('categoriesGrid');
    
    container.innerHTML = categories.map(category => this.renderCategoryCard(category)).join('');
  }

  renderCategoryCard(category) {
    const items = this.dataManager.getItemsByCategory(category.id);
    const availableItems = items.filter(item => item.available);
    
    return `
      <div class="category-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 cursor-pointer ${!category.available ? 'opacity-60' : ''}"
           onclick="showCategoryDetail('${category.id}')">
        <div class="h-32 flex items-center justify-center text-6xl" style="background-color: ${category.color}20">
          ${category.icon}
        </div>
        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-bold text-gray-900">${category.name}</h3>
            ${this.renderAvailabilityToggle('category', category.id, category.available)}
          </div>
          <p class="text-sm text-gray-600 mb-3">${category.description || 'No description'}</p>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">${availableItems.length} of ${items.length} items available</span>
            <span class="text-orange-500 font-medium">View items →</span>
          </div>
        </div>
      </div>
    `;
  }

  renderAvailabilityToggle(type, id, available) {
    return `
      <button onclick="event.stopPropagation(); toggleAvailability('${type}', '${id}')"
              class="availability-toggle w-12 h-6 rounded-full relative transition-all duration-200 ${available ? 'available' : 'unavailable'}">
        <div class="absolute top-1 ${available ? 'left-7' : 'left-1'} w-4 h-4 bg-white rounded-full shadow transition-all duration-200"></div>
      </button>
    `;
  }

  // ===== ITEM RENDERING =====

  renderItems(categoryId) {
    const items = this.dataManager.getItemsByCategory(categoryId);
    const container = document.getElementById('itemsGrid');
    
    container.innerHTML = items.map(item => this.renderItemCard(item)).join('');
  }

  renderItemCard(item) {
    return `
      <div class="item-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${!item.available ? 'opacity-60' : ''}">
        <div class="relative h-48 bg-gray-200">
          ${item.image_url 
            ? `<img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover">`
            : `<div class="w-full h-full flex items-center justify-center text-4xl text-gray-400">🍽️</div>`
          }
          <div class="absolute top-3 right-3">
            ${this.renderAvailabilityToggle('item', item.id, item.available)}
          </div>
        </div>
        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-bold text-gray-900">${item.name}</h3>
            <span class="text-xl font-bold text-orange-500">$${item.base_price.toFixed(2)}</span>
          </div>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">${item.description || 'No description'}</p>
          <div class="flex gap-2">
            <button onclick="editItem('${item.id}')" 
                    class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition text-sm">
              Edit
            </button>
            <button onclick="deleteItem('${item.id}')" 
                    class="bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 px-4 rounded-lg transition text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ===== MODIFIER GROUP RENDERING =====

  renderModifierGroupsForItem(categoryId) {
    const groups = this.dataManager.getCategoryModifierGroups(categoryId);
    const container = document.getElementById('modifierGroupsList');
    
    if (groups.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p class="text-sm">No modifier groups linked to this category</p>
          <p class="text-xs mt-1">Create a new modifier group or add one to this category</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = groups.map(group => this.renderModifierGroupCheckbox(group)).join('');
  }

  renderModifierGroupCheckbox(group) {
    return `
      <label class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 cursor-pointer transition">
        <input type="checkbox" value="${group.id}" class="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500">
        <div class="flex-1">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-900">${group.name}</span>
            <span class="text-xs text-gray-500">${group.options.length} options</span>
          </div>
          <p class="text-sm text-gray-600">${group.description || 'No description'}</p>
        </div>
      </label>
    `;
  }

  renderCategoryModifierGroups() {
    const groups = this.dataManager.getAllModifierGroups();
    const category = this.currentCategory ? this.dataManager.getCategoryById(this.currentCategory) : null;
    const selectedIds = category ? category.modifier_group_ids : [];
    
    const container = document.getElementById('categoryModifierGroups');
    
    container.innerHTML = groups.map(group => `
      <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 cursor-pointer transition">
        <input type="checkbox" value="${group.id}" ${selectedIds.includes(group.id) ? 'checked' : ''} 
               class="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 category-modifier-group">
        <div class="flex-1">
          <span class="font-medium text-gray-900">${group.name}</span>
          <span class="text-xs text-gray-500 ml-2">(${group.options.length} options)</span>
        </div>
      </label>
    `).join('');
  }

  // ===== MODIFIER GROUP OPTIONS RENDERING =====

  renderModifierOptions() {
    const container = document.getElementById('modifierOptionsList');
    
    if (this.tempModifierOptions.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-gray-500 text-sm">
          No options added yet. Click "+ Add Option" to get started.
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.tempModifierOptions.map((option, index) => 
      this.renderModifierOptionInput(option, index)
    ).join('');
  }

  renderModifierOptionInput(option, index) {
    return `
      <div class="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div class="flex-1 space-y-2">
          <input type="text" value="${option.name}" placeholder="Option name"
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm modifier-option-name"
                 data-index="${index}">
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input type="number" value="${option.extra_price}" step="0.01" min="0" placeholder="0.00"
                     class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm modifier-option-price"
                     data-index="${index}">
            </div>
            <button onclick="removeModifierOption(${index})" 
                    class="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition text-sm font-medium">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ===== FORM POPULATION =====

  populateCategoryForm(categoryId) {
    const category = this.dataManager.getCategoryById(categoryId);
    if (!category) return;
    
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDescription').value = category.description || '';
    this.currentCategory = categoryId;
    
    this.renderCategoryModifierGroups();
  }

  populateItemForm(itemId) {
    const item = this.dataManager.getItemById(itemId);
    if (!item) return;
    
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category_id;
    document.getElementById('itemPrice').value = item.base_price;
    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('drawerTitle').textContent = 'Edit Item';
    
    // Set image
    if (item.image_url) {
      const preview = document.getElementById('imagePreview');
      const container = document.getElementById('imagePreviewContainer');
      preview.src = item.image_url;
      container.classList.remove('hidden');
    }
    
    this.currentItem = itemId;
    this.updateProfitCalculator();
  }

  populateModifierGroupForm(groupId) {
    const group = this.dataManager.getModifierGroupById(groupId);
    if (!group) return;
    
    document.getElementById('modifierGroupName').value = group.name;
    document.getElementById('modifierMinSelection').value = group.min_selection;
    document.getElementById('modifierMaxSelection').value = group.max_selection;
    document.getElementById('modifierRequired').checked = group.required;
    document.getElementById('modifierModalTitle').textContent = 'Edit Modifier Group';
    
    this.tempModifierOptions = JSON.parse(JSON.stringify(group.options));
    this.renderModifierOptions();
    this.currentModifierGroup = groupId;
  }

  // ===== CATEGORY SELECT POPULATION =====

  populateCategorySelect(selectedId = null) {
    const categories = this.dataManager.getAllCategories();
    const select = document.getElementById('itemCategory');
    
    select.innerHTML = categories.map(category => 
      `<option value="${category.id}" ${selectedId === category.id ? 'selected' : ''}>${category.name}</option>`
    ).join('');
  }

  // ===== PROFIT CALCULATOR =====

  updateProfitCalculator() {
    const priceInput = document.getElementById('itemPrice');
    const price = parseFloat(priceInput.value) || 0;
    
    // UDO takes 15% commission
    const udoProfit = price * 0.85;
    // Competitor takes 30% commission
    const competitorProfit = price * 0.70;
    // Savings
    const savings = udoProfit - competitorProfit;
    
    document.getElementById('profitAmount').textContent = `$${udoProfit.toFixed(2)}`;
    document.getElementById('competitorProfit').textContent = `$${competitorProfit.toFixed(2)}`;
    document.getElementById('savingsAmount').textContent = `Save $${savings.toFixed(2)} per order!`;
  }

  // ===== TOAST NOTIFICATIONS =====

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toastContent.className = `px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
      type === 'success' ? 'bg-green-600 text-white' : 
      type === 'error' ? 'bg-red-600 text-white' : 
      'bg-gray-900 text-white'
    }`;
    
    toast.classList.remove('hidden');
    toast.classList.add('fade-in');
    
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('fade-in');
    }, 3000);
  }

  // ===== SEARCH FUNCTIONALITY =====

  handleSearch(query) {
    const results = this.dataManager.searchItems(query);
    
    if (query.length === 0) {
      this.showDashboard();
      return;
    }
    
    const container = document.getElementById('categoriesGrid');
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-lg font-medium">No items found</p>
          <p class="text-sm mt-1">Try a different search term</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="col-span-full mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Search Results</h2>
        <p class="text-gray-600">${results.length} item(s) found</p>
      </div>
    ` + results.map(item => `
      <div class="item-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${!item.available ? 'opacity-60' : ''}"
           onclick="showCategoryDetail('${item.category_id}')">
        <div class="relative h-48 bg-gray-200">
          ${item.image_url 
            ? `<img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover">`
            : `<div class="w-full h-full flex items-center justify-center text-4xl text-gray-400">🍽️</div>`
          }
          <div class="absolute top-3 right-3">
            ${this.renderAvailabilityToggle('item', item.id, item.available)}
          </div>
        </div>
        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-bold text-gray-900">${item.name}</h3>
            <span class="text-xl font-bold text-orange-500">$${item.base_price.toFixed(2)}</span>
          </div>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">${item.description || 'No description'}</p>
          <div class="flex gap-2">
            <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              ${this.dataManager.getCategoryById(item.category_id)?.name || 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ===== FORM HELPERS =====

  resetItemForm() {
    document.getElementById('itemForm').reset();
    document.getElementById('drawerTitle').textContent = 'Add New Item';
    document.getElementById('imagePreviewContainer').classList.add('hidden');
    document.getElementById('imagePreview').src = '';
    this.currentItem = null;
    this.tempModifierOptions = [];
    this.populateCategorySelect();
    this.updateProfitCalculator();
  }

  resetCategoryForm() {
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryDescription').value = '';
    this.currentCategory = null;
    this.renderCategoryModifierGroups();
  }

  resetModifierGroupForm() {
    document.getElementById('modifierGroupName').value = '';
    document.getElementById('modifierMinSelection').value = '';
    document.getElementById('modifierMaxSelection').value = '';
    document.getElementById('modifierRequired').checked = false;
    document.getElementById('modifierModalTitle').textContent = 'Create Modifier Group';
    this.tempModifierOptions = [];
    this.renderModifierOptions();
    this.currentModifierGroup = null;
  }

  getFormData(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};
    
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    return data;
  }
}

// Create a global instance
const uiComponents = new UIComponents(dataManager);